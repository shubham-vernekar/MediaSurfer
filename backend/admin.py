from django.contrib import admin
from .models import Video, Star, Navbar, Category, DashboardHistory
# Register your models here.


class VideoAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'duration', 'views', 'cast', 'categories', 'added')

admin.site.register(Video, VideoAdmin) 

class StarAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'is_favourite', 'is_superstar', 'views', 'videos')

admin.site.register(Star, StarAdmin) 

class NavbarAdmin(admin.ModelAdmin):
    list_display = ('text', 'url', 'open_tab')

admin.site.register(Navbar, NavbarAdmin) 

class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'views', 'videos')

admin.site.register(Category, CategoryAdmin) 

admin.site.register(DashboardHistory) 