from rest_framework import serializers
from .models import Star

class StarSerializer(serializers.ModelSerializer):
    
    poster = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Star
        fields = [
            'id',
            'name',
            'liked',
            'favourite',
            'views',
            'videos',
            'poster',
            'banner',
            'tags',
            'watchtime',
            'totaltime'
        ]

    def get_poster(self, obj):
        if obj.poster:
            return obj.poster.url
        else:
            return "/static/images/no-profile-pic.jpg"