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

class NavbarSerializer(serializers.ModelSerializer):

    target = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = Navbar
        fields = [
            'text',
            'url',
            'target'
        ]

    def get_target(self, obj):
        if obj.open_tab:
            return "_blank"
        else:
            return ""
 

