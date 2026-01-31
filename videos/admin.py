from django.contrib import admin
from .models import Video

class VideoAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'is_active', 'duration', 'views', 'cast', 'categories', 'added')

    def get_queryset(self, request):
        return Video.all_objects.get_queryset()

admin.site.register(Video, VideoAdmin) 
