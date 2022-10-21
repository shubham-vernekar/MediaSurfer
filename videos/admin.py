from django.contrib import admin
from .models import Video

class VideoAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'duration', 'views', 'cast', 'categories', 'added')

admin.site.register(Video, VideoAdmin) 
