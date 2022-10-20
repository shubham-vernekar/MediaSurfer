from django.http import JsonResponse
from .models import Video
from .serializer import VideoListSerializer, VideoSerializer
from rest_framework.response import Response
from rest_framework import generics

class VideoListCreateAPIView(generics.ListCreateAPIView):
    queryset = Video.objects.all()
    serializer_class = VideoListSerializer

class ProductDetailAPIView(generics.RetrieveAPIView):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer