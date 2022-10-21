from rest_framework import serializers
from .models import Navbar, Category, DashboardHistory, Series


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


