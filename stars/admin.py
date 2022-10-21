from django.contrib import admin
from .models import Star

class StarAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'favourite', 'superstar', 'views', 'videos')

admin.site.register(Star, StarAdmin) 
