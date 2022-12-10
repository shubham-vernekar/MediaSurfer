from .models import Category, Navbar, Series
from .serializer import CategorySerializer, NavbarSerializer, SeriesSerializer
from rest_framework import generics
from django.core.exceptions import FieldError
from django.db.models import Q
from videos.models import Video
from videos.serializer import VideoListSerializer

class CategoryListCreateAPIView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_queryset(self, *args, **kwargs):
        qs = super().get_queryset(*args, **kwargs)
        query = self.request.GET.get("query", None)
        sort_by = self.request.GET.get("sort_by", None)

        if query:
            qs = qs.filter(Q(title__icontains=query))

        if sort_by:
            try:
                qs = qs.order_by(sort_by)
            except (FieldError):
                return qs.none()

        return qs

class CategoryDetailAPIView(generics.RetrieveAPIView):
    queryset = Category.objects.all()
    serializer_class = NavbarSerializer


class NavbarListView(generics.ListCreateAPIView):
    queryset = Navbar.objects.all()
    serializer_class = NavbarSerializer

    def get_queryset(self, *args, **kwargs):
        qs = super().get_queryset(*args, **kwargs)
        qs = qs.order_by("-weight")
        return qs

class SeriesListCreateAPIView(generics.ListCreateAPIView):
    queryset = Series.objects.all()
    serializer_class = SeriesSerializer

    def get_queryset(self, *args, **kwargs):
        qs = super().get_queryset(*args, **kwargs)
        query = self.request.GET.get("query", None)
        sort_by = self.request.GET.get("sort_by", None)
        cast = self.request.GET.get("cast", None)
        categories = self.request.GET.get("categories", None)

        if query:
            qs = qs.filter(Q(name__icontains=query))

        if sort_by:
            try:
                qs = qs.order_by(sort_by)
            except (FieldError):
                qs = qs.none()

        if cast:
            qs = qs.filter(Q(cast__icontains=cast))

        if categories:
            qs = qs.filter(Q(categories__icontains=categories))

        return qs

    def list(self, request, *args, **kwargs):
        response = super().list(request, args, kwargs)
        qs = self.get_queryset()
        all_stars = set()

        for records in qs:
            if records.cast:
                all_stars.update([x for x in records.cast.split(",") if x])

        for k, records in enumerate(response.data["results"]):
            video_qs = Video.objects.filter(series__id=records["id"])
            video_data = VideoListSerializer(video_qs, many=True).data 
            response.data["results"][k]["video_data"] = video_data
            
        response.data["all_stars"] = sorted(list(all_stars))
        return response
