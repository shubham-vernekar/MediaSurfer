from django.contrib import admin
from .models import Navbar, Category, DashboardHistory, Series, UserLevelData
# Register your models here.

class NavbarAdmin(admin.ModelAdmin):
    list_display = ('text', 'url', 'open_tab', 'weight')

admin.site.register(Navbar, NavbarAdmin) 

class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'views', 'videos')

admin.site.register(Category, CategoryAdmin) 

class SeriesAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'views')

admin.site.register(Series, SeriesAdmin) 

admin.site.register(DashboardHistory) 

admin.site.register(UserLevelData)