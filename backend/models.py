from sqlite3 import Timestamp
from django.db import models
from django.utils import timezone

def upload_poster(instance, filename):
    return f'MediaSurf/media/stardata/{instance.star_id}/{instance.star_id}_poster.jpg'

def upload_banner(instance, filename):
    return f'MediaSurf/media/stardata/{instance.star_id}/{instance.star_id}_banner.jpg'

# Create your models here.
class Video(models.Model):
    ''' Model to store video details '''
    id = models.CharField(max_length=15, primary_key=True)
    file_path = models.CharField(max_length=512, unique=True)
    title = models.CharField(max_length=1024)
    categories = models.CharField(max_length=512, blank=True, null=True)
    views = models.IntegerField(default=0, blank=True, null=True)
    cast = models.CharField(max_length=512, blank=True, null=True)
    favourite = models.BooleanField(default=False, blank=True, null=True)
    description = models.CharField(max_length=1024, blank=True, null=True)
    duration = models.DurationField(blank=True, null=True)
    created = models.DateTimeField(blank=True, null=True)
    size = models.FloatField(blank=True, null=True)
    poster = models.FileField(blank=True, null=True)
    subtitle = models.FileField(blank=True, null=True)
    preview = models.FileField(blank=True, null=True)
    scrubber = models.FileField(blank=True, null=True)
    added = models.DateTimeField(default=timezone.now)
    resolution = models.CharField(max_length=30, blank=True, null=True)
    search_text = models.CharField(max_length=1024, blank=True, null=True)
    reviewed = models.BooleanField(default=False)
    tags = models.CharField(max_length=512, blank=True, null=True)
    series = models.CharField(max_length=512, blank=True, null=True)
    episode = models.IntegerField(blank=True, null=True)
    progress = models.IntegerField(blank=True, null=True)
    last_viewed = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return self.title


class Star(models.Model):
    ''' Model to store actor details '''
    id = models.CharField(max_length=15, primary_key=True)
    name = models.CharField(max_length=64, unique=True)
    is_favourite = models.BooleanField(default=False, blank=True, null=True)
    bio = models.CharField(max_length=1024, blank=True, null= True)
    views = models.IntegerField(default=0, blank=True, null=True)
    videos = models.IntegerField(default=0, blank=True, null=True)
    added = models.DateTimeField(default=timezone.now)
    poster = models.ImageField(upload_to=upload_poster, blank=True, null=True)
    banner = models.ImageField(upload_to=upload_banner, blank=True, null=True)
    tags = models.CharField(max_length=512, blank=True, null=True)

    def __str__(self):
        return self.name


class Navbar(models.Model):
    ''' Store navbar elements '''
    text = models.CharField(max_length=64, unique=True)
    url = models.URLField(max_length=300)
    open_tab = models.BooleanField(default=False)

    def __str__(self):
        return self.text


class Category(models.Model):
    ''' Model to store genre details '''
    id = models.CharField(max_length=15, primary_key=True)
    title = models.CharField(max_length=64, unique=True)
    poster = models.ImageField(upload_to="MediaSurf/media/categorydata", blank=True, null=True)
    views = models.IntegerField(default=0, blank=True, null=True)
    videos = models.IntegerField(default=0, blank=True, null=True)
    added = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title


class DashboardHistory(models.Model):
    ''' Model to store history of random videos shown on dashboard '''
    time = models.DateTimeField(default=timezone.now)
    recommended_videos = models.CharField(max_length=1024, blank=True, null=True)
    new_videos = models.CharField(max_length=1024, blank=True, null=True)
    favorite_videos = models.CharField(max_length=1024, blank=True, null=True)

    def __str__(self):
        return self.time.strftime("%m/%d/%Y, %H:%M:%S")

