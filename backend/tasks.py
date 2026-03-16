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
from backend.models import DebridFiles
from urllib.parse import urlparse, unquote
import subprocess
import json
from pathlib import Path
import pickle
import logging

logging.basicConfig(
    level=logging.INFO,
    format=u"%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(os.path.join(Path(__file__).parents[1], f"logs/import-{datetime.datetime.today().strftime('%Y-%m-%d')}.log")) ,
        logging.StreamHandler()
    ]
)

class ImportDebrid():
    headers = {
            "Authorization": f"Bearer {settings.DEBRID_API_KEY}"
        }
    
    debrid_api = "https://api.real-debrid.com/rest/1.0"
    files_to_import = 0
    all_downloads = {}

    def is_real_debrid_link_expired(self, url):
        try:
            response = requests.head(url, allow_redirects=True, timeout=10)
            return response.status_code != 200
        except requests.RequestException:
            return True

    def import_debrid_videos(self, debrid_id, parent_hash, parent_title, clear_import=False):
        logging.info("Importing RD Videos") 
        logging.info(f"debrid_id={debrid_id} parent_hash={parent_hash} parent_title={parent_title} clear_import={clear_import}")

        DebridFiles.objects.filter(debrid_id=debrid_id).update(importing=True)
        if clear_import:
            logging.info("Clearing Previous Imports")
            deleted_count, _ = DebridVideo.objects.filter(parent_hash=parent_hash).delete()
            logging.info(f"Deleted {deleted_count} videos")
        
        url = f"{self.debrid_api}/torrents/info/{debrid_id}"
        debrid_links = requests.get(url, headers=self.headers).json().get("links")
        logging.info(f"{len(debrid_links)} Files Found")
        
        for debrid_link in debrid_links:
            logging.info(f"Debrid Link - {debrid_link}")
            download_link = self.all_downloads.get(debrid_link)
            if not download_link:
                logging.info(f"Unrestricting Link - {debrid_link}")
                download_link= self.unrestrict_link(debrid_link)

            if download_link:
                logging.info(f"Download Link - {download_link}")
                download_link = unquote(download_link)
                self.add_debrid_video(download_link, parent_hash, parent_title, debrid_id, clear_import, debrid_link)

        DebridFiles.objects.filter(debrid_id=debrid_id).update(
            is_imported=True,
            importing=False,
            import_timestamp=timezone.now()
        ) 
        
        return 'Done'

    def get_debrid_info(self, debrid_url):

        cmd = [
            "ffprobe",
            "-v", "quiet",
            "-print_format", "json",
            "-show_format",
            "-show_streams",
            debrid_url
        ]

        result = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding="utf-8",
            timeout=30
        )

        if result.returncode != 0:
            logging.error(f"ffProbe failed. Returned non-zero exit status. {result.stderr}")

        probe = json.loads(result.stdout)
        format_info = probe.get("format", {})
        video_stream = None

        for stream in probe.get("streams", []):
            if stream.get("codec_type") == "video":
                video_stream = stream
                break

        return {
            "title": os.path.splitext(os.path.basename(urlparse(debrid_url).path))[0],
            "size": round(int(format_info.get("size", 0)) / float(1048576), 3),
            "duration": float(format_info.get("duration", 0)) if format_info.get("duration") else 0,
            "video_url": debrid_url,
            "width": video_stream.get("width") if video_stream else None,
            "height": video_stream.get("height") if video_stream else None,
        }


    def generate_poster(self, video_url, video_id):
        debriddata_dir = os.path.join(settings.MEDIA_ROOT, settings.MEDIA_DIR, "debriddata")
        base_folder = os.path.join(debriddata_dir, video_id)
        poster_path = Path(os.path.join(base_folder, f"{video_id}_poster.jpg"))
        poster_path.parent.mkdir(parents=True, exist_ok=True)

        cmd = [
            "ffmpeg",
            "-ss", "5",
            "-i", video_url,
            "-vframes", "1",
            "-q:v", "15",
            "-y",
            "-loglevel", "error",
            str(poster_path)
        ]

        subprocess.run(cmd, check=True)
        return poster_path

    def extract_realdebrid_id(self, url):
        path_parts = urlparse(url).path.split("/")
        
        if "d" in path_parts:
            idx = path_parts.index("d")
            if idx + 1 < len(path_parts):
                return path_parts[idx + 1]
        
        return None

    def get_all_download_links(self):
        all_downloads = {}
        page_no = 0
        while True:
            page_no += 1
            url = f"{self.debrid_api}/downloads?limit=500&page={page_no}"
            x = requests.get(url, headers=self.headers)
            if x.status_code==200:
                downloads = x.json()
                for download in downloads:
                    link = download.get("link")
                    if link:
                        all_downloads[link] = download.get("download")
            else:
                break

        return all_downloads

    def unrestrict_link(self, link):
        url = f"{self.debrid_api}/unrestrict/link"
        data = {
            "link": link
        }
        response = requests.post(url, headers=self.headers, data=data)
        if response.status_code == 200:
            return response.json().get("download")


    def add_debrid_video(self, url, parent_hash, parent_title, parent_debrid_id, clear_import, debrid_link):

        video_id = shortuuid.ShortUUID().random(length=12)
        url_id = self.extract_realdebrid_id(url)

        try:
            debrid_object = DebridVideo.objects.get(url_id=url_id)
            if clear_import:
                logging.info(f"Debrid Video already exists, Deleting {debrid_object.id } - {debrid_object.title}")
                debrid_object.delete()
            else:
                logging.info(f"Debrid Video already exists, Skipping {debrid_object.id } - {debrid_object.title}")
                return
        except DebridVideo.DoesNotExist:
            pass
        
        logging.info(f"Downloading Video Data")
        data = self.get_debrid_info(url)
        if data['size'] == 0:
            logging.info(f"Link Invalid {url} - Unrestricting Link - {debrid_link}")
            url = self.unrestrict_link(debrid_link)
            if not url:
                logging.warning(f"Download Link Unavailable {url}")
                return
            
            data = self.get_debrid_info(url)
            if data['size'] == 0:
                logging.warning(f"Download Link Unavailable {url}")
                return

        logging.info(f"Downloading Poster")
        poster_file = self.generate_poster(url, video_id)
        
        debrid_object = DebridVideo.objects.create(
            url = url,
            id = video_id,
            url_id = url_id,
            title = data.get("title", "Unknown"),
            width = data.get("width", 0),
            height = data.get("height", 0),
            duration = datetime.timedelta(seconds=data.get("duration", 0)),
            size = data.get("size", 0),
            parent_hash = parent_hash,
            parent_title = parent_title,
            debrid_id = parent_debrid_id,
            debrid_link = debrid_link
        )

        if os.path.exists(poster_file): 
            debrid_object.poster = f"MediaSurfer\media\debriddata\{video_id}\{video_id}_poster.jpg"
            debrid_object.save()


    def start_import_process(self, debrid_ids, clear_import, import_all):

        if import_all:
            logging.info("Importing All Videos")
            to_import = DebridFiles.objects.filter(is_imported=False)
        else:
            debrid_ids = [d for d in debrid_ids.split(",") if d]
            to_import = DebridFiles.objects.filter(debrid_id__in=debrid_ids, is_imported=False)

        self.files_to_import = to_import.count()
        logging.info(f"Importing {self.files_to_import} Files")

        if self.files_to_import > 0:
            logging.info(f"Pre Cacheing all download links")
            self.all_downloads = self.get_all_download_links()

            # TODO - Remove Stub
            # if os.path.exists("data.pkl"):
            #     with open("data.pkl", "rb") as f:
            #         self.all_downloads = pickle.load(f)
            # else:
            #     self.all_downloads = self.get_all_download_links()
            #     with open("data.pkl", "wb") as f:
            #         pickle.dump(self.all_downloads, f)


        for debrid_file in to_import:
            logging.info(f"Importing {debrid_file.title} - {self.files_to_import} Pending")
            self.import_debrid_videos(debrid_file.debrid_id, debrid_file.hash, debrid_file.title, clear_import)
            self.files_to_import -= 1


@shared_task(bind=True)
def import_debrid_videos(self, debrid_ids, clear_import=False, import_all=False):
    print ("debrid_ids", debrid_ids)
    print ("clear_import", clear_import)
    print ("import_all", import_all)
    # debrid_ids = "KTXK74BLXMZ6U,U3TVQQYQY545M,JKIF74C6R7I6A"
    # clear_import = False
    # import_all = False
    p = ImportDebrid()
    p.start_import_process(debrid_ids, clear_import, import_all)
