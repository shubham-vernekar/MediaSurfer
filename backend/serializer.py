from rest_framework import serializers
from .models import Navbar, Category, DashboardHistory, Series, DebridFiles
from videos.models import Video, DebridVideo
import random
from celery.result import AsyncResult

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            'id',
            'title',
            'poster',
            'views',
            'videos'
        ]

class NavbarSerializer(serializers.ModelSerializer):

    target = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = Navbar
        fields = [
            'text',
            'url',
            'weight',
            'target'
        ]

    def get_target(self, obj):
        if obj.open_tab:
            return "_blank"
        else:
            return ""
 

class SeriesSerializer(serializers.ModelSerializer):

    class Meta:
        model = Series
        fields = [
            'id',
            'name',
            'added',
            'videos',
            'views',
            'created',
            'updated',
            'cast',
            'categories',
        ]


class DebridFilesSerializer(serializers.ModelSerializer):
    videos = serializers.SerializerMethodField(read_only=True)
    posters = serializers.SerializerMethodField(read_only=True)
    task_id = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = DebridFiles
        fields = [
            'id',
            'debrid_id',
            'title',
            'hash',
            'size',
            'status',
            'is_imported',
            'import_timestamp',
            'files',
            'importing',
            'videos',
            'posters',
            'task_id',
            'favourite',
        ]
        read_only_fields = ["id"]

    
    def get_videos(self, obj):
        return obj.videos.all().count()
    
    def get_posters(self, obj):
        poster_urls = list(
            obj.videos.all()
            .exclude(poster='')
            .values_list('poster', flat=True)
        )
        posters = ["/media/" + p.replace("\\", "/") for p in random.sample(poster_urls, min(10, len(poster_urls)))]
        return posters
    
    def get_task_id(self, obj):
        if not obj.task_id:
            return ''
        result = AsyncResult(obj.task_id)
        if result.status in ['PENDING', 'STARTED', 'FAILURE', 'RECEIVED']:
            return obj.task_id
        return ''