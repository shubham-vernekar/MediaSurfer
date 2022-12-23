from django.contrib import admin
from .models import Star

class StarAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'liked', 'favourite', 'views', 'videos')

admin.site.register(Star, StarAdmin) 
