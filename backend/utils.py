import json
import os
from urllib.parse import urlparse, unquote
from videos.models import Video, DebridVideo
import ffmpeg
import re
import subprocess
import requests
from pathlib import Path
from django.conf import settings
import shortuuid
import datetime
import random


def get_pending_videos():

    pending_videos = []
    unsupported_videos = []

    directories = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "management/commands/directories.json"), 'r'))

    all_videos = [x.lower() for x in Video.objects.all().values_list('file_path', flat=True)]
    for directory in directories:
        for path, _, all_files in os.walk(directory):
            for file_name in all_files:
                file_name = os.path.join(path, file_name).replace("\\","/")
                extention = file_name[file_name.rfind("."):].lower()
                if extention in settings.SUPPORTED_VIDEO_FORMATS:
                    if not file_name.lower() in all_videos:
                        probe = ffmpeg.probe(file_name)
                        video_stream = next((stream for stream in probe['streams'] if stream['codec_type'] == 'video'), None)
                        if float(video_stream['duration']) > settings.MIN_VIDEO_LENGTH:
                            pending_videos.append(file_name)

                elif extention in settings.VIDEO_FORMATS:
                    unsupported_videos.append(file_name)

    return pending_videos, unsupported_videos


def apply_regex(expr, key):
    matches = re.findall(expr, key)
    if matches:
        return matches[0]
    return ""


def convert_seconds(seconds, format_type='days', oneword=False):
    days = seconds // (24 * 3600)
    hours = (seconds % (24 * 3600)) // 3600
    minutes = (seconds % 3600) // 60
    
    if format_type == 'hours':
        if oneword:
            return hours + days*24
        return f"{hours + days*24 } hrs and {minutes} mins"
    else:
        if oneword:
            return days
        return f"{days} days {hours} hrs and {minutes} mins"


def get_cast_videos(cast):
    qs = Video.objects.all().filter(cast__contains = cast)
    return qs


def is_valid_video_url(url):
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        return False

    filename = unquote(parsed.path.split("/")[-1])
    if "." not in filename or filename.endswith("."):
        return False

    resp = requests.head(url, allow_redirects=True, timeout=5)
    ctype = resp.headers.get("Content-Type", "").lower()
    if ctype.startswith("video/"):
        return True

    if urlparse(url).path.lower().endswith(tuple(settings.VIDEO_FORMATS)):
        return True

    cd = resp.headers.get("Content-Disposition", "").lower()
    if any(ext in cd for ext in settings.VIDEO_FORMATS):
        return True


def add_debrid_videos(instance):
    headers = {
            "Authorization": f"Bearer {settings.DEBRID_API_KEY}"
        }

    api_url = f"{settings.DEBRID_API}/torrents/info/{instance.debrid_id}"
    response = requests.get(
        api_url,
        headers=headers
    )
    if response.status_code != 200:
        print(f"Real-Debrid API error {response.status_code}: {response.text}")
        return None
    
    data = response.json()
    video_files = data.get("files", [])
    links = data.get("links", [])
    if not links:
        return

    selected_files = [f for f in video_files if f.get("selected") == 1]
    if len(selected_files) != len(links):
        raise ValueError(f"Mismatch: {len(selected_files)} selected files but {len(links)} links")

    for video_file, link in zip(selected_files, links):
        debrid_object = DebridVideo.objects.create(
            id = shortuuid.ShortUUID().random(length=12),
            title = os.path.splitext(video_file.get("path", "Unknown").split("/")[-1])[0],
            extention = os.path.splitext(video_file.get("path", "Unknown").split("/")[-1])[1].replace(".", ""),
            size = round(int(video_file.get("bytes", 0))/float(1048576),3),
            parent = instance,
            debrid_link = link
        )


def unrestrict_link(link):
    headers = {
            "Authorization": f"Bearer {settings.DEBRID_API_KEY}"
        }
    
    url = f"{settings.DEBRID_API}/unrestrict/link"
    data = {
        "link": link
    }
    response = requests.post(url, headers=headers, data=data)
    if response.status_code == 200:
        return response.json().get("download")
    

def get_debrid_info(stream_url, timeout=30):

    cmd = [
        "ffprobe",
        "-v", "quiet",
        "-print_format", "json",
        "-show_format",
        "-show_streams",
        stream_url
    ]

    try:
        result = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding="utf-8",
            timeout=timeout
        )
    except subprocess.TimeoutExpired:
        return None, None, None, None

    probe = json.loads(result.stdout)
    format_info = probe.get("format", {})
    video_stream = None

    for stream in probe.get("streams", []):
        if stream.get("codec_type") == "video":
            video_stream = stream
            break
    
    width = video_stream.get("width") if video_stream else None
    height = video_stream.get("height") if video_stream else None
    duration = datetime.timedelta(seconds=float(format_info.get("duration", 0))) 
    size = round(int(int(format_info.get("size", 0)))/float(1048576),3)  
    return width, height, duration, size


def generate_poster(video_url, video_id, duration):
    debriddata_dir = os.path.join(settings.MEDIA_ROOT, settings.MEDIA_DIR, "debriddata")
    base_folder = os.path.join(debriddata_dir, video_id[:2].upper())
    poster_path = Path(os.path.join(base_folder, f"{video_id}_poster.jpg"))
    poster_path.parent.mkdir(parents=True, exist_ok=True)
    if duration < 2:
        seek_time = 0
    elif duration < 12:
        seek_time = int(random.uniform(duration * 0.33, duration * 0.66))
    else:
        seek_time = random.randint(10, min(20, int(duration) - 1))

    cmd = [
        "ffmpeg",
        "-ss", str(seek_time),
        "-i", video_url,
        "-vframes", "1",
        "-q:v", "15",
        "-y",
        "-loglevel", "error",
        str(poster_path)
    ]

    subprocess.run(cmd, check=True, timeout=60)
    return poster_path


def delete_debrid_file(debrid_id):
    try:
        r = requests.delete(
            f"{settings.DEBRID_API}/torrents/delete/{debrid_id}",
            headers={"Authorization": f"Bearer {settings.DEBRID_API_KEY}"},
            timeout=15,
        )
        r.raise_for_status()
        return True
    except requests.RequestException as e:
        print(f"✗ Failed to delete {debrid_id}: {e}")
        return False