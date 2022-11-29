from .models import Video
from .serializer import VideoListSerializer, VideoSerializer
from rest_framework import generics
from rest_framework.response import Response


class VideoListCreateAPIView(generics.ListCreateAPIView):
    queryset = Video.objects.all()
    serializer_class = VideoListSerializer

    def get_queryset(self, *args, **kwargs):
        qs = super().get_queryset(*args, **kwargs)
        parameters = self.request.GET
        qs = qs.search(parameters)
        return qs

    def list(self, request, *args, **kwargs):
        response = super().list(request, args, kwargs)
        qs = self.get_queryset()
        min_duration, max_duration, all_stars, all_categories = 0, 0, set(), set()
        for records in qs:
            all_stars.update([x for x in records.cast.split(",") if x])
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
        return response

class VideoDetailAPIView(generics.RetrieveAPIView):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer