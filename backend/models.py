from django.db import models
from django.utils import timezone


def upload_category_poster(instance, filename):
    return f'MediaSurf/media/categorydata/{instance.id}/{instance.id}_banner.jpg'

class Series(models.Model):
    ''' Model to store Series '''
    id = models.CharField(max_length=15, primary_key=True)
    name = models.CharField(max_length=64, unique=True)
    added = models.DateTimeField(default=timezone.now)
    videos = models.IntegerField(default=0, blank=True, null=True)
    views = models.IntegerField(default=0, blank=True, null=True)
    created = models.DateTimeField(blank=True, null=True)
    updated = models.DateTimeField(blank=True, null=True)
    cast = models.CharField(max_length=512, default="", blank=True, null=True)
    categories = models.CharField(max_length=512, default="", blank=True, null=True)

    def __str__(self):
        return self.name

class Navbar(models.Model):
    ''' Store navbar elements '''
    text = models.CharField(max_length=64, unique=True)
    url = models.CharField(max_length=300)
    open_tab = models.BooleanField(default=False)
    weight = models.FloatField(default=0, blank=True, null=True)

    def __str__(self):
        return self.text


class Category(models.Model):
    ''' Model to store genre details '''
    id = models.CharField(max_length=15, primary_key=True)
    title = models.CharField(max_length=64, unique=True)
    poster = models.ImageField(
        upload_to=upload_category_poster, blank=True, null=True)
    views = models.IntegerField(default=0, blank=True, null=True)
    videos = models.IntegerField(default=0, blank=True, null=True)
    added = models.DateTimeField(default=timezone.now)
    favourite = models.BooleanField(default=False)

    def __str__(self):
        return self.title


class DashboardHistory(models.Model):
    ''' Model to store history of random videos shown on dashboard '''
    time = models.DateTimeField(default=timezone.now)
    recommended_videos = models.CharField(
        max_length=1024, blank=True, null=True)
    new_videos = models.CharField(max_length=1024, blank=True, null=True)
    favorite_videos = models.CharField(max_length=1024, blank=True, null=True)

    def __str__(self):
        return self.time.strftime("%m/%d/%Y, %H:%M:%S")
