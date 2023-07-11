import json
import os
from videos.models import Video
import ffmpeg
import re

def get_pending_videos():

    pending_videos = []
    unsupported_videos = []

    MIN_VIDEO_LENGTH = 200
    SUPPORTED_VIDEO_FORMATS = [".mp4"]
    VIDEO_FORMATS = [".webm", ".mpg", ".mp2", ".mpeg", ".mpe", ".mpv", ".ogg",
                     ".m4p", ".m4v", ".avi", ".wmv", ".mov", ".qt", ".mp4",
                     ".flv", ".swf", ".ts", ".mkv"]

    directories = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "management/commands/directories.json"), 'r'))

    all_videos = [x.lower() for x in Video.objects.all().values_list('file_path', flat=True)]
    for directory in directories:
        for path, _, all_files in os.walk(directory):
            for file_name in all_files:
                file_name = os.path.join(path, file_name).replace("\\","/")
                extention = file_name[file_name.rfind("."):].lower()
                if extention in SUPPORTED_VIDEO_FORMATS:
                    if not file_name.lower() in all_videos:
                        probe = ffmpeg.probe(file_name)
                        video_stream = next((stream for stream in probe['streams'] if stream['codec_type'] == 'video'), None)
                        if float(video_stream['duration']) > MIN_VIDEO_LENGTH:
                            pending_videos.append(file_name)

                elif extention in VIDEO_FORMATS:
                    unsupported_videos.append(file_name)

    return pending_videos, unsupported_videos


def apply_regex(expr, key):
    matches = re.findall(expr, key)
    if matches:
        return matches[0]
    return ""
