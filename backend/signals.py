from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import DebridFiles
from .utils import add_debrid_videos


@receiver(post_save, sender=DebridFiles)
def on_debrid_file_created(sender, instance, created, **kwargs):
    if created: 
        add_debrid_videos(instance)