from django.db import models
from django.utils import timezone
from django.db.models import Q
from django.core.exceptions import FieldError, ValidationError

class StarQuerySet(models.QuerySet):
    def search(self, parameters):
        query = parameters.get("query", None)
        liked = parameters.get("liked", None)
        favourite = parameters.get("favourite", None)
        min_videos = parameters.get("min_videos", None)
        min_views = parameters.get("min_views", None)
        sort_by = parameters.get("sort_by", None)
        filter = parameters.get("filter", "").lower()
        prefix = parameters.get("prefix", None)
        cast = [x for x in parameters.get("cast", "").lower().split(",") if x]

        qs = self

        if cast:
            qs = qs.filter(Q(name__in=cast))
            return qs

        if filter=="liked":
            liked = True
        elif filter=="favourites":
            favourite = True

        if query:
            qs = qs.filter(Q(name__icontains=query))

        if prefix:
            qs = qs.filter(Q(name__istartswith=prefix))

        if liked is not None:
            try:
                qs = qs.filter(Q(liked=liked))
            except ValidationError:
                qs = self.none()

        if favourite is not None:
            try:
                qs = qs.filter(Q(favourite=favourite))
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
                qs = qs.order_by(sort_by.lower())
            except (FieldError):
                qs = self.none()

        return qs


class StarManager(models.Manager):
    def get_queryset(self, *args, **kwargs):
        return StarQuerySet(self.model, using=self._db)

    def search(self, query):
        return self.get_queryset().search(query)


def upload_star_poster(instance, filename):
    return f'MediaSurf/media/stardata/{instance.id}/{instance.id}_poster.jpg'


def upload_star_banner(instance, filename):
    return f'MediaSurf/media/stardata/{instance.id}/{instance.id}_banner.jpg'


class Star(models.Model):
    ''' Model to store actor details '''
    id = models.CharField(max_length=15, primary_key=True)
    name = models.CharField(max_length=64, unique=True)
    liked = models.BooleanField(default=False)
    favourite = models.BooleanField(default=False)
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
