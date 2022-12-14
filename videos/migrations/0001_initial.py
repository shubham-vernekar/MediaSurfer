# Generated by Django 4.1.1 on 2022-10-21 15:45

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('backend', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Video',
            fields=[
                ('id', models.CharField(max_length=15, primary_key=True, serialize=False)),
                ('file_path', models.CharField(max_length=512, unique=True)),
                ('title', models.CharField(max_length=1024)),
                ('categories', models.CharField(blank=True, default='', max_length=512, null=True)),
                ('views', models.IntegerField(blank=True, default=0, null=True)),
                ('cast', models.CharField(blank=True, default='', max_length=512, null=True)),
                ('favourite', models.BooleanField(default=False)),
                ('description', models.CharField(blank=True, max_length=1024, null=True)),
                ('duration', models.DurationField(blank=True, null=True)),
                ('created', models.DateTimeField(blank=True, null=True)),
                ('size', models.FloatField(blank=True, null=True)),
                ('subtitle', models.CharField(blank=True, max_length=512, null=True)),
                ('poster', models.FileField(blank=True, null=True, upload_to='')),
                ('preview', models.FileField(blank=True, null=True, upload_to='')),
                ('preview_thumbnail', models.FileField(blank=True, null=True, upload_to='')),
                ('retries', models.IntegerField(default=0)),
                ('scrubber_sprite', models.FileField(blank=True, null=True, upload_to='')),
                ('scrubber_vtt', models.FileField(blank=True, null=True, upload_to='')),
                ('added', models.DateTimeField(default=django.utils.timezone.now)),
                ('width', models.IntegerField(blank=True, null=True)),
                ('height', models.IntegerField(blank=True, null=True)),
                ('movie_id', models.CharField(blank=True, max_length=25, null=True)),
                ('search_text', models.CharField(blank=True, max_length=2048, null=True)),
                ('reviewed', models.BooleanField(default=False)),
                ('tags', models.CharField(blank=True, max_length=512, null=True)),
                ('progress', models.IntegerField(blank=True, null=True)),
                ('last_viewed', models.DateTimeField(blank=True, null=True)),
                ('series', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='episodes', to='backend.series')),
            ],
        ),
    ]
