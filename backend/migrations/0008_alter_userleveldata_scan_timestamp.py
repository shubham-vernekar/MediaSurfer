# Generated by Django 4.1.1 on 2022-12-24 10:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0007_userleveldata'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userleveldata',
            name='scan_timestamp',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
