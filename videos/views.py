from .models import Video, DebridVideo
from stars.models import Star
from backend.models import Category
from .serializer import VideoListSerializer, VideoSerializer, DebridVideoSerializer
from rest_framework import generics
from django.conf import settings
import subprocess
from rest_framework.response import Response
import os
import random
from send2trash import send2trash
from django.utils import timezone

class VideoListCreateAPIView(generics.ListCreateAPIView):
    queryset = Video.objects.all()
    serializer_class = VideoListSerializer

    def get_queryset(self, *args, **kwargs):
        qs = super().get_queryset(*args, **kwargs)
        qs = qs.search(self.request.GET)
        return qs

    def list(self, request, *args, **kwargs):
        response = super().list(request, args, kwargs)
        qs = list(self.get_queryset())
        min_duration, max_duration, all_stars, all_categories = 0, 0, set(), set()
        for records in qs:
            if records.cast:
                all_stars.update([x for x in records.cast.split(",") if x])
            if records.categories:
                all_categories.update([x for x in records.categories.split(",") if x])
            duration = records.duration.seconds
            if min_duration > duration or min_duration == 0:
                min_duration = duration
            if max_duration < duration:
                max_duration = duration

        response.data["min_duration"] = min_duration
        response.data["max_duration"] = max_duration
        response.data["all_stars"] = sorted(list(all_stars))
        response.data["all_categories"] = sorted(list(all_categories))
        response.data["count"] = len(qs)
        response.data["banner_videos"] = VideoListSerializer(random.sample(qs, len(qs))[:15], many=True).data 
        return response

class VideoDetailAPIView(generics.RetrieveAPIView):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer

class DebridVideoDetailAPIView(generics.RetrieveAPIView):
    queryset = DebridVideo.objects.all()
    serializer_class = DebridVideoSerializer

class VideoUpdateAPIView(generics.UpdateAPIView):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer
    lookup_field = "pk"

    def perform_update(self, serializer):
        return super().perform_update(serializer)


class VideoDeleteAPIView(generics.DestroyAPIView):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer
    lookup_field = "pk"

    def perform_destroy(self, instance):
        return super().perform_destroy(instance)
 

class VideoRecommendedAPIView(generics.ListCreateAPIView):
    queryset = Video.objects.all()
    serializer_class = VideoListSerializer
    pagination_class = None

    def get_queryset(self, *args, **kwargs):
        qs = super().get_queryset(*args, **kwargs)
        qs = qs.get_recommendation(self.request.GET)
        return qs

class VideoRelatedAPIView(generics.ListCreateAPIView):
    queryset = Video.objects.all()
    serializer_class = VideoListSerializer
    pagination_class = None

    def get_queryset(self, *args, **kwargs):
        qs = super().get_queryset(*args, **kwargs)
        video_id = self.request.GET.get("videoID", None)
        try:
            master_video = Video.objects.get(id = video_id)
        except Video.DoesNotExist:
            return qs.none()

        return qs.get_related(self.request.GET, master_video)
 
class OpenPlayerView(generics.GenericAPIView):
    def post(self, request, pk):
        try:
            video = Video.objects.get(id = pk)
        except Video.DoesNotExist:
            return Response({
                "Status": "Failed"
            })
        
        video.views = video.views + 1
        video.save()
        _ = subprocess.Popen([settings.LOCAL_MEDIA_PLAYER_PATH, video.file_path])
        return Response({
                "Status": "Success"
            })


class OpenFolderView(generics.GenericAPIView):
    def post(self, request, pk):
        try:
            video = Video.objects.get(id = pk)
        except Video.DoesNotExist:
            return Response({
                "Status": "Failed"
            })
        
        video.views = video.views + 1
        video.save()
        os.system('start %windir%\explorer.exe /select, "{}"'.format(video.file_path.replace("/", "\\")))
        return Response({
                "Status": "Success"
            })

class LocalDeleteView(generics.GenericAPIView):
    def post(self, request, pk):
        try:
            video = Video.objects.get(id = pk)
        except Video.DoesNotExist:
            return Response({
                "Status": "Failed"
            })

        send2trash(video.file_path.replace("/", "\\"))
        video.delete()
        return Response({
                "Status": "Success"
            })

class VideoIncrementView(generics.GenericAPIView):
    def post(self, request, pk):
        try:
            video = Video.objects.get(id = pk)
        except Video.DoesNotExist:
            return Response({
                "Status": "Failed"
            })

        video.views = video.views + 1
        video.last_viewed = timezone.now()
        video.save()

        if video.cast:
            cast = [x for x in video.cast.split(",") if x]
            for star in Star.objects.filter(name__in = cast):
                star.views = star.views + 1
                star.save()

        if video.categories:
            categories = [x for x in video.categories.split(",") if x]
            for category in Category.objects.filter(title__in = categories):
                category.views = category.views + 1
                category.save()
        
        if video.series:
            video.series.views = video.series.views + 1
            video.series.save()
        
        return Response({
                "Status": "Success"
            })
    
class DebridVideoIncrementView(generics.GenericAPIView):
    def post(self, request, pk):
        try:
            debrid_video = DebridVideo.objects.get(id = pk)
        except Video.DoesNotExist:
            return Response({
                "Status": "Failed"
            })

        debrid_video.views = debrid_video.views + 1
        debrid_video.last_viewed = timezone.now()
        debrid_video.save()

        return Response({
                "views": debrid_video.views
            })
    
class DebridVideoUpdateAPIView(generics.UpdateAPIView):
    queryset = DebridVideo.objects.all()
    serializer_class = DebridVideoSerializer
    lookup_field = "pk"

    def perform_update(self, serializer):
        return super().perform_update(serializer)
    

class DebridVideoListCreateAPIView(generics.ListCreateAPIView):
    queryset = DebridVideo.objects.all()
    serializer_class = DebridVideoSerializer

    def get_queryset(self, *args, **kwargs):
        qs = super().get_queryset(*args, **kwargs)
        qs = qs.search(self.request.GET)
        return qs

class DebridVideoDeleteAPIView(generics.DestroyAPIView):
    queryset = DebridVideo.objects.all()
    serializer_class = DebridVideoSerializer
    lookup_field = "pk"

    def perform_destroy(self, instance):
        return super().perform_destroy(instance)