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

