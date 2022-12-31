from django.db import models
from django.utils import timezone
import json
import os
from django.db.models import Q, F, ExpressionWrapper, BooleanField
import datetime
from django.core.exceptions import FieldError, ValidationError
from django.contrib.postgres.search import SearchQuery, SearchRank, SearchVectorField
from django.contrib.postgres.indexes import GinIndex
from backend.models import Series
from stars.models import Star
from backend.models import Category
from functools import reduce
import operator
from MediaSurfer.constants import CATEGORIES_EXCLUDE_LIST
import difflib
import urllib.parse
import re

def text2int (textnum, numwords={}):
    if not numwords:
        units = [
        "zero", "one", "two", "three", "four", "five", "six", "seven", "eight",
        "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
        "sixteen", "seventeen", "eighteen", "nineteen",
        ]

        tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"]

        scales = ["hundred", "thousand", "million", "billion", "trillion"]

        numwords["and"] = (1, 0)
        for idx, word in enumerate(units):  numwords[word] = (1, idx)
        for idx, word in enumerate(tens):       numwords[word] = (1, idx * 10)
        for idx, word in enumerate(scales): numwords[word] = (10 ** (idx * 3 or 2), 0)

    ordinal_words = {'first':1, 'second':2, 'third':3, 'fifth':5, 'eighth':8, 'ninth':9, 'twelfth':12}
    ordinal_endings = [('ieth', 'y'), ('th', '')]

    textnum = textnum.replace('-', ' ')

    current = result = 0
    curstring = ""
    onnumber = False
    for word in textnum.split():
        if word in ordinal_words:
            scale, increment = (1, ordinal_words[word])
            current = current * scale + increment
            if scale > 100:
                result += current
                current = 0
            onnumber = True
        else:
            for ending, replacement in ordinal_endings:
                if word.endswith(ending):
                    word = "%s%s" % (word[:-len(ending)], replacement)

            if word not in numwords:
                if onnumber:
                    curstring += repr(result + current) + " "
                curstring += word + " "
                result = current = 0
                onnumber = False
            else:
                scale, increment = numwords[word]

                current = current * scale + increment
                if scale > 100:
                    result += current
                    current = 0
                onnumber = True

    if onnumber:
        curstring += repr(result + current)

    return curstring

def sort_related_videos(vids):
    episodes_found = []
    episodes_not_found = []
    for i in vids:
        episode_name = re.sub(r"\D", " ", text2int(i.title.lower()))
        episode_number = re.sub(r"\s+", " ", text2int(episode_name)).strip()
        if episode_number:
            episodes_found.append([int(episode_number.split(" ")[0]), i])
        else:
            episodes_not_found.append(i)
    
    episodes_found.sort(key=lambda x: x[0])
    episodes_found = [x[1] for x in episodes_found]
    return episodes_found + episodes_not_found

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

        qs = self.order_by('-created')

        if filter=="favourites":
            favourite = True

        if filter=="unverfied":
            qs = qs.filter(Q(verfied=False))
        
        if query:
            search_query = SearchQuery(query)
            search_rank = SearchRank(F("search_vector"), search_query)
            title_match = ExpressionWrapper(Q(title__istartswith=query), output_field=BooleanField())
            qs = qs.annotate(rank=search_rank, starts_with=title_match).filter(Q(search_vector=search_query)|Q(search_text__icontains=query)).order_by("-rank").order_by('-starts_with')  

        if cast:
            qs = qs.filter(Q(cast__icontains=cast))

        if series:
            qs = qs.filter(Q(series__id=series))
            return sort_related_videos(qs)

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
                if int(duration_min)>1:
                    qs = qs.filter(duration__gte=datetime.timedelta(
                        seconds=int(duration_min)-1)).order_by('-duration')
            except (ValueError, ValidationError):
                qs = self.none()

        if sort_by:
            if "last_viewed" in sort_by:
                qs = qs.filter(Q(progress__gte = 1) & Q(last_viewed__isnull = False))

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

            if master_video.series:
                related_vids = list(qs.filter(Q(series__id=master_video.series.id)).order_by('title'))
            else:
                titles = list(qs.values_list('title', flat=True))
                relatives = difflib.get_close_matches(master_video.title, titles, n=6, cutoff=0.75)
                related_vids = list(qs.filter(Q(title__in = relatives)).order_by('title'))[:limit]
            
            related_vids = sort_related_videos(related_vids)

            for i in related_vids:
                if master_video in related_vids:
                    master_index = related_vids.index(master_video)
                    related_vids = related_vids[master_index+1:] + related_vids[:master_index] 
            
            if master_video.series:
                return related_vids

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
            return qs.filter(Q(progress__gte = 1) & Q(last_viewed__isnull = False)).order_by("-last_viewed")[:limit]
        
        if recommendation_type == "recommended":
            return query_special_tag(qs, "?", ["RECOMMENDED"], limit, [])

        if recommendation_type == "new":
            return query_special_tag(qs, "?", ["NEW"], limit, [])

        if recommendation_type == "favourites":
            return query_special_tag(qs, "?", ["FAVOURITE"], limit, [])

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
    recommended = models.BooleanField(default=False)
    verfied = models.BooleanField(default=False)
    tags = models.CharField(max_length=512, blank=True, null=True)
    series = models.ForeignKey(
        Series, on_delete=models.SET_NULL, related_name="episodes", blank=True, null=True)
    progress = models.IntegerField(default=0, blank=True, null=True)
    watch_time = models.IntegerField(default=0, blank=True, null=True)
    last_viewed = models.DateTimeField(blank=True, null=True)
    search_vector = SearchVectorField(null=True)

    class Meta:
        indexes = [
            GinIndex(fields=["search_vector"]),
        ]

    objects = VideoManager()

    def __str__(self):
        return self.title

    def get_video_url(self):
        return convert_url(self.file_path)

    def get_subtitle_url(self):
        return convert_url(self.subtitle)

    def get_preview_poster(self):
        if self.poster:
            return self.poster.url
        else:
            return self.preview_thumbnail.url

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

        if (timezone.now()-self.created).days <15:
            special_tag = "NEW"

        if self.recommended:
            special_tag = "RECOMMENDED"

        if self.progress:
            if self.progress > self.duration.seconds * 0.9 or self.watch_time > 600:
                special_tag = "WATCHED"
        
        if self.favourite:
            special_tag = "FAVOURITE"

        return special_tag


