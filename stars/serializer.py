from rest_framework import serializers
from .models import Star

class StarSerializer(serializers.ModelSerializer):
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
            'tags'
        ]