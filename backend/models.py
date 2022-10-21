from sqlite3 import Timestamp
from turtle import width
from django.db import models
from django.utils import timezone
import json
import os
from django.db.models import Q
import datetime
from django.core.exceptions import FieldError, ValidationError


class VideoQuerySet(models.QuerySet):
    def search(self, parameters):
        query = parameters.get("query", None)
        cast = parameters.get("cast", None)
        series = parameters.get("series", None)
        categories = parameters.get("categories", None)
        favourite = parameters.get("favourite", None)
        duration_max = parameters.get("duration_max", None)
        duration_min = parameters.get("duration_min", None)
        sort_by = parameters.get("sort_by", None)

        qs = self
        if query:
            qs = qs.filter(Q(search_text__icontains=query))

        if cast:
            qs = qs.filter(Q(cast__icontains=cast))

        if series:
            qs = qs.filter(Q(series__id=series))

        if categories:
            qs = qs.filter(Q(categories__icontains=categories))

        if favourite is not None:
            try:
                qs = qs.filter(Q(favourite=favourite))
            except ValidationError:
                qs = self.none()

        if duration_max is not None:
            try:
                qs = qs.filter(duration__lte=datetime.timedelta(
                    seconds=int(duration_max))).order_by('-duration')
            except (ValueError, ValidationError):
                qs = self.none()

        if duration_min is not None:
            try:
                qs = qs.filter(duration__gte=datetime.timedelta(
                    seconds=int(duration_min))).order_by('-duration')
            except (ValueError, ValidationError):
                qs = self.none()

        if sort_by:
            try:
                qs = qs.order_by(sort_by)
            except (FieldError):
                qs = self.none()

        return qs


class StarQuerySet(models.QuerySet):
    def search(self, parameters):
        query = parameters.get("query", None)
        favourite = parameters.get("favourite", None)
        superstar = parameters.get("superstar", None)
        min_videos = parameters.get("min_videos", None)
        min_views = parameters.get("min_views", None)
        sort_by = parameters.get("sort_by", None)

        qs = self
        if query:
            qs = qs.filter(Q(name__icontains=query))

        if favourite is not None:
            try:
                qs = qs.filter(Q(favourite=favourite))
            except ValidationError:
                qs = self.none()

        if superstar is not None:
            try:
                qs = qs.filter(Q(superstar=superstar))
            except ValidationError:
                qs = self.none()

        if min_videos is not None:
            try:
                qs = qs.filter(Q(videos__gte=int(min_videos))).order_by('-videos')
            except (ValueError, ValidationError):
                qs = self.none()

        if min_views is not None:
            try:
                qs = qs.filter(Q(views__gte=int(min_views))).order_by('-views')
            except (ValueError, ValidationError):
                qs = self.none()

        if sort_by:
            try:
                qs = qs.order_by(sort_by)
            except (FieldError):
                qs = self.none()

        return qs


class VideoManager(models.Manager):
    def get_queryset(self, *args, **kwargs):
        return VideoQuerySet(self.model, using=self._db)

    def search(self, query):
        return self.get_queryset().search(query)

class StarManager(models.Manager):
    def get_queryset(self, *args, **kwargs):
        return StarQuerySet(self.model, using=self._db)

    def search(self, query):
        return self.get_queryset().search(query)


def upload_star_poster(instance, filename):
    return f'MediaSurf/media/stardata/{instance.id}/{instance.id}_poster.jpg'


def upload_star_banner(instance, filename):
    return f'MediaSurf/media/stardata/{instance.id}/{instance.id}_banner.jpg'


def upload_category_poster(instance, filename):
    return f'MediaSurf/media/categorydata/{instance.id}/{instance.id}_banner.jpg'


def convert_url(file_path):
    if file_path:
        portmap = {}
        try:
            portmap = json.load(open(os.path.join(os.path.dirname(
                os.path.abspath(__file__)), "portmap.json"), 'r'))
        except FileNotFoundError:
            return file_path
        url_prefix = portmap.get(file_path[0], "")
        if url_prefix:
            return f"{url_prefix}/{file_path[3:]}"
    return file_path

# Create your models here.


class Series(models.Model):
    ''' Model to store Series '''
    id = models.CharField(max_length=15, primary_key=True)
    name = models.CharField(max_length=64, unique=True)
    added = models.DateTimeField(default=timezone.now)
    videos = models.IntegerField(default=0, blank=True, null=True)
    views = models.IntegerField(default=0, blank=True, null=True)

    def __str__(self):
        return self.name


class Video(models.Model):
    ''' Model to store video details '''
    id = models.CharField(max_length=15, primary_key=True)
    file_path = models.CharField(max_length=512, unique=True)
    title = models.CharField(max_length=1024)
    categories = models.CharField(
        max_length=512, default="", blank=True, null=True)
    views = models.IntegerField(default=0, blank=True, null=True)
    cast = models.CharField(max_length=512, default="", blank=True, null=True)
    favourite = models.BooleanField(default=False)
    description = models.CharField(max_length=1024, blank=True, null=True)
    duration = models.DurationField(blank=True, null=True)
    created = models.DateTimeField(blank=True, null=True)
    size = models.FloatField(blank=True, null=True)
    subtitle = models.CharField(max_length=512, blank=True, null=True)
    poster = models.FileField(blank=True, null=True)
    preview = models.FileField(blank=True, null=True)
    preview_thumbnail = models.FileField(blank=True, null=True)
    retries = models.IntegerField(default=0)
    scrubber_sprite = models.FileField(blank=True, null=True)
    scrubber_vtt = models.FileField(blank=True, null=True)
    added = models.DateTimeField(default=timezone.now)
    width = models.IntegerField(blank=True, null=True)
    height = models.IntegerField(blank=True, null=True)
    movie_id = models.CharField(max_length=25, blank=True, null=True)
    search_text = models.CharField(max_length=2048, blank=True, null=True)
    reviewed = models.BooleanField(default=False)
    tags = models.CharField(max_length=512, blank=True, null=True)
    series = models.ForeignKey(
        Series, on_delete=models.SET_NULL, related_name="episodes", blank=True, null=True)
    progress = models.IntegerField(blank=True, null=True)
    last_viewed = models.DateTimeField(blank=True, null=True)

    objects = VideoManager()

    def __str__(self):
        return self.title

    def get_video_url(self):
        return convert_url(self.file_path)

    def get_subtitle_url(self):
        return convert_url(self.subtitle)


class Star(models.Model):
    ''' Model to store actor details '''
    id = models.CharField(max_length=15, primary_key=True)
    name = models.CharField(max_length=64, unique=True)
    favourite = models.BooleanField(default=False)
    superstar = models.BooleanField(default=False)
    bio = models.CharField(max_length=1024, blank=True, null=True)
    views = models.IntegerField(default=0, blank=True, null=True)
    videos = models.IntegerField(default=0, blank=True, null=True)
    added = models.DateTimeField(default=timezone.now)
    poster = models.ImageField(
        upload_to=upload_star_poster, blank=True, null=True)
    banner = models.ImageField(
        upload_to=upload_star_banner, blank=True, null=True)
    tags = models.CharField(max_length=512, blank=True, null=True)

    objects = StarManager()

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
    poster = models.ImageField(
        upload_to=upload_category_poster, blank=True, null=True)
    views = models.IntegerField(default=0, blank=True, null=True)
    videos = models.IntegerField(default=0, blank=True, null=True)
    added = models.DateTimeField(default=timezone.now)

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
