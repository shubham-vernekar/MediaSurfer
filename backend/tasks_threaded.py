from django.core.management.base import BaseCommand
from celery import shared_task
import requests
import time
from django.conf import settings
from django.utils import timezone
import shortuuid
import os
import datetime
from videos.models import DebridVideo
from .models import DebridFiles
from .utils import get_debrid_info, generate_poster, unrestrict_link
from urllib.parse import urlparse, unquote
from django.db.models import Q
import subprocess
import json
from pathlib import Path
import pickle
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from rich.progress import (
    Progress, SpinnerColumn, BarColumn, TextColumn,
    TimeElapsedColumn, TimeRemainingColumn, TaskProgressColumn, MofNCompleteColumn
)
from rich.console import Console
from rich.live import Live
from rich.panel import Panel
from rich.table import Table
from rich import print as rprint
import threading
from pathlib import Path

console = Console()

class ImportDebrid():
    headers = {"Authorization": f"Bearer {settings.DEBRID_API_KEY}"}
    debrid_api = "https://api.real-debrid.com/rest/1.0"
    files_to_import = 0
    all_downloads = {}
    _progress_lock = threading.Lock()
    DOWNLOADS_CACHE_PATH = Path("all_downloads_cache.pkl")
    CACHE_TTL_SECONDS = 12 * 60 * 60

    def import_debrid_videos(self, debrid_file, progress, outer_task):
        videos = list(debrid_file.videos.filter(
            Q(poster__isnull=True) | Q(poster="")
        ))
        total_videos = debrid_file.videos.count()

        # Inner progress bar per file
        inner_task = progress.add_task(
            f"  [cyan]{debrid_file.title[:40]}[/cyan]",
            total=len(videos)
        )

        def process_video(video):
            debrid_link = video.debrid_link
            download_link = self.all_downloads.get(debrid_link)

            if not download_link:
                # logging.info(f"Unrestricting Link - {debrid_link}")
                download_link = unrestrict_link(debrid_link)

            if not download_link:
                logging.warning(f"Download Link Unavailable for {debrid_link}")
                return "skipped"

            try:
                video.width, video.height, video.duration, _ = get_debrid_info(download_link)
            except subprocess.TimeoutExpired:
                logging.error(f"Download Timed Out - {debrid_link}")

            if not video.duration:
                download_link = unrestrict_link(debrid_link)
                if not download_link:
                    return "skipped"
                try:
                    video.width, video.height, video.duration, _  = get_debrid_info(download_link)
                except subprocess.TimeoutExpired:
                    logging.error(f"Download Timed Out (2)")
                if not video.duration:
                    return "skipped"

            try:
                poster_file = generate_poster(download_link, video.id, video.duration.total_seconds())
                if os.path.exists(poster_file):
                    video.poster = f"MediaSurfer\media\debriddata\{video.id[:2].upper()}\{video.id}_poster.jpg"
            except subprocess.CalledProcessError:
                logging.error(f"Poster Could not be generated")
                return "no_poster"

            video.save()
            return "ok"

        stats = {"ok": 0, "skipped": 0, "no_poster": 0}

        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = {executor.submit(process_video, v): v for v in videos}
            for future in as_completed(futures):
                result = future.result()
                with self._progress_lock:
                    stats[result] = stats.get(result, 0) + 1
                    progress.advance(inner_task)

        progress.remove_task(inner_task)
        progress.advance(outer_task)

        debrid_file.is_imported = True
        debrid_file.save()
        return stats

    def get_all_download_links(self, force_refresh=False):
        # --- Try loading from cache ---
        if not force_refresh and self.DOWNLOADS_CACHE_PATH.exists():
            try:
                with open(self.DOWNLOADS_CACHE_PATH, "rb") as f:
                    cached = pickle.load(f)
                age = time.time() - cached["timestamp"]
                if age < self.CACHE_TTL_SECONDS:
                    age_str = f"{int(age // 3600)}h {int((age % 3600) // 60)}m"
                    console.print(
                        f"[green]✓[/green] Loaded [bold]{len(cached['data'])}[/bold] "
                        f"download links from cache (age: {age_str})"
                    )
                    return cached["data"]
                else:
                    console.print("[yellow]Cache expired, re-fetching...[/yellow]")
            except (pickle.UnpicklingError, KeyError, EOFError):
                console.print("[yellow]Cache corrupted, re-fetching...[/yellow]")

        # --- Fetch from API ---
        all_downloads = {}
        page_no = 0
        with console.status("[bold yellow]Pre-caching all download links...", spinner="dots"):
            while True:
                page_no += 1
                url = f"{self.debrid_api}/downloads?limit=5000&page={page_no}"
                x = requests.get(url, headers=self.headers)
                if x.status_code == 200:
                    downloads = x.json()
                    if not downloads:
                        break
                    for download in downloads:
                        link = download.get("link")
                        if link:
                            all_downloads[link] = download.get("download")
                else:
                    break

        # --- Save to cache ---
        try:
            with open(self.DOWNLOADS_CACHE_PATH, "wb") as f:
                pickle.dump({"timestamp": time.time(), "data": all_downloads}, f)
            console.print(
                f"[green]✓[/green] Fetched and cached [bold]{len(all_downloads)}[/bold] "
                f"download links (valid for 12h)"
            )
        except OSError as e:
            console.print(f"[yellow]Warning: could not save cache: {e}[/yellow]")

        return all_downloads

    def start_import_process(self, debrid_ids, import_all):
        if import_all:
            to_import = list(DebridFiles.objects.filter(is_imported=False))
        else:
            debrid_ids = [d for d in debrid_ids.split(",") if d]
            to_import = list(DebridFiles.objects.filter(debrid_id__in=debrid_ids, is_imported=False))

        self.files_to_import = len(to_import)

        console.rule("[bold blue]Real-Debrid Import")
        console.print(f"[bold]Files to import:[/bold] {self.files_to_import}\n")

        if self.files_to_import == 0:
            console.print("[yellow]Nothing to import.[/yellow]")
            return

        self.all_downloads = self.get_all_download_links()

        total_stats = {"ok": 0, "skipped": 0, "no_poster": 0}

        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            BarColumn(bar_width=40),
            TaskProgressColumn(),
            MofNCompleteColumn(),
            TimeElapsedColumn(),
            TimeRemainingColumn(),
            console=console,
            transient=False,
        ) as progress:

            outer_task = progress.add_task(
                "[bold green]Overall files", total=self.files_to_import
            )

            for debrid_file in to_import:
                stats = self.import_debrid_videos(debrid_file, progress, outer_task)
                for k, v in stats.items():
                    total_stats[k] = total_stats.get(k, 0) + v

        # Summary table
        table = Table(title="Import Summary", show_header=True, header_style="bold magenta")
        table.add_column("Metric", style="dim")
        table.add_column("Count", justify="right")
        table.add_row("✅ Imported", str(total_stats["ok"]))
        table.add_row("⚠️  No poster", str(total_stats["no_poster"]))
        table.add_row("⏭️  Skipped", str(total_stats["skipped"]))
        table.add_row("[bold]Total files[/bold]", str(self.files_to_import))
        console.print(table)