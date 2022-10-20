from django.http import JsonResponse
from .models import Video, Star, Category
from .serializer import VideoListSerializer, VideoSerializer, StarSerializer, CategorySerializer
from rest_framework.response import Response
from rest_framework import generics

class VideoListCreateAPIView(generics.ListCreateAPIView):
    queryset = Video.objects.all()
    serializer_class = VideoListSerializer

class ProductDetailAPIView(generics.RetrieveAPIView):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer

class StarListCreateAPIView(generics.ListCreateAPIView):
    queryset = Star.objects.all()
    serializer_class = StarSerializer

class StarDetailAPIView(generics.RetrieveAPIView):
    queryset = Star.objects.all()
    serializer_class = StarSerializer

class CategoryListCreateAPIView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class CategoryDetailAPIView(generics.RetrieveAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer