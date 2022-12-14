from rest_framework import serializers
from .models import Navbar, Category, DashboardHistory, Series
from videos.models import Video


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

