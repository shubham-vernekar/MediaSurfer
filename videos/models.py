from django.db import models
from django.utils import timezone
import json
import os
from django.db.models import Q
import datetime
from django.core.exceptions import FieldError, ValidationError
from backend.models import Series
from stars.models import Star
from backend.models import Category
from functools import reduce
import operator
from MediaSurfer.constants import CATEGORIES_EXCLUDE_LIST
import difflib
import urllib.parse

def convert_url(file_path):

    if file_path:
        portmap = {}
        try:
            portmap = json.load(open(os.path.join(os.path.dirname(
                os.path.abspath(__file__)), "portmap.json"), 'r'))
        except FileNotFoundError:
            return urllib.parse.quote(file_path).replace("\\","/").replace("#","%23")

        url_prefix = portmap.get(file_path[0], "")
        if url_prefix:
            x = urllib.parse.quote(file_path[3:]).replace("\\","/").replace("#","%23")
            file_path = f"{url_prefix}/{x}"

    return file_path


def query_special_tag(qs, order_by, query, limit, vids_to_exclude):
    ids_to_exclude = [x.id for x in vids_to_exclude]
    result = []

    for vid in qs.order_by(order_by):
        if vid.get_special_tag() in query and not vid.id in ids_to_exclude:
            result.append(vid)
        if len(result)>=limit:
            break

    return result


def get_cast_videos(qs, video, limit, order_by, vids_to_exclude):
    ids_to_exclude = [x.id for x in vids_to_exclude]
    cast = []

    if video.cast:
        cast = [x for x in video.cast.split(",") if x]

    if cast:
        return list(qs.filter(~Q(id__in = ids_to_exclude)).filter(reduce(operator.or_, (Q(cast__contains=x) for x in cast))).order_by(order_by)[:limit])
    else:
        return []


def get_categories_videos(qs, video, limit, order_by, vids_to_exclude):
    ids_to_exclude = [x.id for x in vids_to_exclude]
    categories = []

    if video.categories:
        categories = [x for x in video.categories.split(",") if x and not x in CATEGORIES_EXCLUDE_LIST]

    if categories:
        return list(qs.filter(~Q(id__in = ids_to_exclude)).filter(reduce(operator.or_, (Q(categories__contains=x) for x in categories))).order_by(order_by)[:limit])
    else:
        return []

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
        filter = parameters.get("filter", "").lower()

        qs = self

        if filter=="favourites":
            favourite = True
        
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
                if int(duration_max)>1:
                    qs = qs.filter(duration__lte=datetime.timedelta(
                        seconds=int(duration_max)+1)).order_by('-duration')
            except (ValueError, ValidationError):
                qs = self.none()

        if duration_min is not None:
            try:
                qs = qs.filter(duration__gte=datetime.timedelta(
                    seconds=int(duration_min)-1)).order_by('-duration')
            except (ValueError, ValidationError):
                qs = self.none()

        if sort_by:
            try:
                qs = qs.order_by(sort_by)
            except (FieldError):
                qs = self.none()

        if filter=="recommended":
            qs = [x for x in qs if x.get_special_tag()=="RECOMMENDED"]
        elif filter=="new":
            qs = [x for x in qs if x.get_special_tag()=="NEW"]

        return qs


    def get_related(self, parameters, master_video):
        limit = int(parameters.get("limit", 0))
        recommendation_type = parameters.get("type", None)
        exclude_ids = parameters.get("exclude", "").split(",")
        exclude_ids = [x for x in exclude_ids if x]
        exclude_ids.append(master_video)

        qs = self
        
        if recommendation_type == "watch next":
            titles = list(qs.values_list('title', flat=True))
            titles.remove(master_video.title)
            relatives = difflib.get_close_matches(master_video.title, titles, n=6, cutoff=0.75)
            related_vids = list(qs.filter(Q(title__in = relatives) & ~Q(id__in = exclude_ids)).order_by('title'))[:limit]

            if len(related_vids) < limit:
                related_vids += get_cast_videos(qs, master_video, limit - len(related_vids), "?", related_vids + exclude_ids)

            # if len(related_vids) < limit:
            #     related_vids += get_categories_videos(qs, master_video, limit - len(related_vids), "?", related_vids + exclude_ids)

            if len(related_vids) < limit:
                related_vids += query_special_tag(qs, "?", ["RECOMMENDED", "FAVOURITE"], limit - len(related_vids), related_vids + exclude_ids)

            return related_vids

        if recommendation_type == "similar":
            related_vids = get_categories_videos(qs, master_video, limit, "?", exclude_ids)

            if len(related_vids) < limit:
                related_vids += query_special_tag(qs, "?", ["RECOMMENDED", "FAVOURITE"], limit - len(related_vids), related_vids + exclude_ids)

            return related_vids

        return self.none()

    
    def get_recommendation(self, parameters):
        limit = int(parameters.get("limit", 0))
        recommendation_type = parameters.get("type", None)
        qs = self

        if recommendation_type == "banner":
            return qs.filter().order_by("?")[:limit]

        if recommendation_type == "discover":
            return qs.filter().order_by("?")[:limit]
        
        if recommendation_type == "continue":
            return qs.filter(Q(progress__gte = 1)).order_by("-last_viewed")[:limit]
        
        if recommendation_type == "recommended":
            return query_special_tag(qs, "?", ["RECOMMENDED"], limit, [])

        if recommendation_type == "new":
            return query_special_tag(qs, "?", ["NEW"], limit, [])

        if recommendation_type == "favourites":
            return query_special_tag(qs, "?", ["FAVOURITE"], limit, [])

        # qs = qs.filter(Q(search_text__icontains="len"))
        return qs
        

class VideoManager(models.Manager):
    def get_queryset(self, *args, **kwargs):
        return VideoQuerySet(self.model, using=self._db)

    def search(self, query):
        return self.get_queryset().search(query)

    def get_recommendation(self, query):
        return self.get_queryset().get_recommendation(query)

    def get_related(self, query, master_video):
        return self.get_queryset().get_related(query, master_video)


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

    def get_subtitle_badge(self):
        if self.subtitle or "subbed" in self.categories:
            return True
        return False

    def get_badge(self):
        if  self.width < self.height:
            return "VERTICAL"
        if "vr" in self.categories.lower().split(","):
            return "VR"
        if self.height > 2100 or self.width >3800:
            return "4K UHD"
        elif self.height > 1400 or self.width >2500:
            return "2K QHD"
        elif self.height > 1050 or self.width > 1900:
            return "HD"
        elif self.height > 700 or self.width > 1200:
            return "720P"
        elif self.height > 400 or self.width > 600:
            return "SD"
        elif self.height > 300 or self.width > 400:
            return "360P"
        else:
            return "240P"

    def get_special_tag(self):
        special_tag = ""
        if self.cast:
            for cast in self.cast.split(","):
                star_object = Star.objects.get(name = cast)
                if star_object.favourite:
                    special_tag = "RECOMMENDED"

        if self.categories:
            for category in self.categories.split(","):
                category_object = Category.objects.get(title = category)
                if category_object.favourite:
                    special_tag = "RECOMMENDED"

        if (timezone.now()-self.created).days <15:
            special_tag = "NEW"

        if self.progress:
            if self.progress > self.duration.seconds * 0.9:
                special_tag = "WATCHED"
        
        if self.favourite:
            special_tag = "FAVOURITE"

        return special_tag


