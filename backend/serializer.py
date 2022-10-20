from dataclasses import fields
from rest_framework import serializers
from .models import Video, Star, Navbar, Category, DashboardHistory, Series

class VideoListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = [
            'id',
            'title', 
            'categories', 
            'cast', 
            'views', 
            'favourite', 
            'duration', 
            'created', 
            'size', 
            'preview',
            'preview_thumbnail', 
            'width', 
            'height', 
            'tags', 
            'series', 
            'progress', 
            'last_viewed'
        ]


class VideoSerializer(serializers.ModelSerializer):
    video_url = serializers.SerializerMethodField(read_only=True)
    subtitle_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Video
        fields = [
            'id',
            'title', 
            'video_url',
            'categories', 
            'cast', 
            'views', 
            'favourite', 
            'description', 
            'duration', 
            'created', 
            'size',  
            'poster',
            'subtitle_url',
            'scrubber_sprite', 
            'scrubber_vtt', 
            'width', 
            'height', 
            'tags', 
            'series', 
            'progress', 
            'last_viewed'
        ]

    def get_video_url(self, obj):
        return obj.get_video_url()

    def get_subtitle_url(self, obj):
        return obj.get_subtitle_url()