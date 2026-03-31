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


    def import_debrid_videos(self, debrid_file):
        logging.info("Importing RD Videos")
        logging.info(f"debrid_id={debrid_file.debrid_id} parent_hash={debrid_file.hash} parent_title={debrid_file.title}")
        
        videos = debrid_file.videos.filter(
            Q(poster__isnull=True) | Q(poster="")
        )

        logging.info(f"Total {debrid_file.videos.all().count()} videos. Importing {videos.count()} videos")

        count = 0
        for video in videos:
            total = debrid_file.videos.count()
            remaining = videos.count() - count
            processed = total - remaining

            percentage = (processed / total * 100) if total > 0 else 0

            logging.info(
                f"Total {total} videos. {remaining} Remaining "
                f"({percentage:.2f}% done)"
            )

            count += 1
            debrid_link = video.debrid_link

            download_link = self.all_downloads.get(debrid_link)
            if not download_link:
                logging.info(f"Unrestricting Link - {debrid_link}")
                download_link = unrestrict_link(debrid_link)

            if not download_link:
                logging.warning(f"Download Link Unavailable for {debrid_link}")
                continue

            try:
                video.width, video.height, video.duration, _  = get_debrid_info(download_link)
            except subprocess.TimeoutExpired:
                logging.error(f"Download Timed Out - Unrestricting link -  {debrid_link}")

            if not video.duration:
                logging.info(f"Link Invalid - Unrestricting again - {debrid_link}")
                download_link = unrestrict_link(debrid_link)
                if not download_link:
                    logging.warning(f"Download Link Unavailable {debrid_link}")
                    continue
                try:
                    video.width, video.height, video.duration, _  = get_debrid_info(download_link)
                except subprocess.TimeoutExpired:
                    logging.error(f"Download Timed Out (2)")

                if not video.duration:
                    logging.warning(f"Download Link still invalid {debrid_link}")
                    continue

            logging.info(f"Downloading Poster")
            try:
                poster_file = generate_poster(download_link, video.id, video.duration.total_seconds())
                if os.path.exists(poster_file): 
                    video.poster = f"MediaSurfer\media\debriddata\{video.id[:2].upper()}\{video.id}_poster.jpg"
            except subprocess.CalledProcessError:
                logging.error(f"Poster Could not be generated")
            
            video.save()

        debrid_file.is_imported = True
        debrid_file.save()
        

    def get_all_download_links(self):
        all_downloads = {}
        page_no = 0
        while True:
            page_no += 1
            url = f"{self.debrid_api}/downloads?limit=5000&page={page_no}"
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


    def start_import_process(self, debrid_ids, import_all):

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
            self.import_debrid_videos(debrid_file)
            self.files_to_import -= 1


@shared_task(bind=True)
def import_debrid_videos(self, debrid_ids, import_all=False):
    print ("debrid_ids", debrid_ids)
    print ("import_all", import_all)
    # debrid_ids = "KTXK74BLXMZ6U,U3TVQQYQY545M,JKIF74C6R7I6A"
    # clear_import = False
    # import_all = False
    p = ImportDebrid()
    p.start_import_process(debrid_ids, import_all)
