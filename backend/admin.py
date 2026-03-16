from django.contrib import admin
from .models import Navbar, Category, DashboardHistory, Series, UserLevelData , DebridFiles
# Register your models here.

class NavbarAdmin(admin.ModelAdmin):
    list_display = ('text', 'open_tab', 'weight', 'url')

admin.site.register(Navbar, NavbarAdmin) 

class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'views', 'videos')

admin.site.register(Category, CategoryAdmin) 

class SeriesAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'views')

class DebridFilesAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'debrid_id', 'size', 'is_imported', 'files')

admin.site.register(Series, SeriesAdmin) 

admin.site.register(DashboardHistory) 

admin.site.register(UserLevelData)

admin.site.register(DebridFiles, DebridFilesAdmin)
