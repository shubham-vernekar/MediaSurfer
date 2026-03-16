


from celery import Celery
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'MediaSurfer.settings')

app = Celery('MediaSurfer')
app.config_from_object('django.conf:settings', namespace='CELERY')  # make sure this line exists
app.autodiscover_tasks()