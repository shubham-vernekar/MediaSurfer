from rest_framework import serializers
from .models import Video

class VideoListSerializer(serializers.ModelSerializer):

    series = serializers.SerializerMethodField(read_only=True)
    badge = serializers.SerializerMethodField(read_only=True)
    special_tag = serializers.SerializerMethodField(read_only=True)
    subtitle_badge = serializers.SerializerMethodField(read_only=True)
    preview_poster = serializers.SerializerMethodField(read_only=True)
    jt_trailer_url = serializers.SerializerMethodField(read_only=True)
    duration_seconds = serializers.SerializerMethodField(read_only=True)

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
            'preview_poster',
            'subtitle_badge',
            'width', 
            'height', 
            'tags', 
            'series', 
            'progress', 
            'watch_time',
            'last_viewed',
            'badge',
            'special_tag',
            'jt_trailer_url',
            'duration_seconds', 
        ]

    def get_series(self, obj):
        if obj.series:
            return {
                "id": obj.series.id,
                "name": obj.series.name,
            }
        else:
            return None

    def get_special_tag(self, obj):
        return obj.get_special_tag()

    def get_badge(self, obj):
        return obj.get_badge()

    def get_subtitle_badge(self, obj):
        return obj.get_subtitle_badge()

    def get_preview_poster(self, obj):
        return obj.get_preview_poster()
    
    def get_jt_trailer_url(self, obj):
        return obj.get_jt_trailer_url()
    
    def get_duration_seconds(self, obj):
        return obj.duration.seconds

class VideoSerializer(serializers.ModelSerializer):

    video_url = serializers.SerializerMethodField(read_only=True)
    subtitle_url = serializers.SerializerMethodField(read_only=True)
    series = serializers.SerializerMethodField(read_only=True)
    badge = serializers.SerializerMethodField(read_only=True)
    special_tag = serializers.SerializerMethodField(read_only=True)
    subtitle_badge = serializers.SerializerMethodField(read_only=True)
    jt_trailer_url = serializers.SerializerMethodField(read_only=True)
    duration = serializers.SerializerMethodField(read_only=True)

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
            'subtitle_badge',
            'scrubber_sprite', 
            'scrubber_vtt', 
            'width', 
            'height', 
            'tags', 
            'series', 
            'progress', 
            'watch_time',
            'last_viewed',
            'badge',
            'special_tag',
            'verfied',
            'jt_trailer_url',
        ]

    def get_video_url(self, obj):
        return obj.get_video_url()

    def get_badge(self, obj):
        return obj.get_badge()

    def get_special_tag(self, obj):
        return obj.get_special_tag()

    def get_subtitle_url(self, obj):
        return obj.get_subtitle_url()

    def get_series(self, obj):
        if obj.series:
            return {
                "id": obj.series.id,
                "name": obj.series.name,
            }
        else:
            return None

    def get_subtitle_badge(self, obj):
        return obj.get_subtitle_badge()
    
    def get_jt_trailer_url(self, obj):
        return obj.get_jt_trailer_url()
    
    def get_duration(self, obj):
        return obj.duration.seconds
