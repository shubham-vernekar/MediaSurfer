from .models import Video
from .serializer import VideoListSerializer, VideoSerializer
from rest_framework import generics

class VideoListCreateAPIView(generics.ListCreateAPIView):
    queryset = Video.objects.all()
    serializer_class = VideoListSerializer

    def get_queryset(self, *args, **kwargs):
        qs = super().get_queryset(*args, **kwargs)
        qs = qs.search(self.request.GET)
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
 