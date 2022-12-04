from django.urls import path
from . import views 

urlpatterns = [
    path('', views.VideoListCreateAPIView.as_view(), name='video-list'),
    path('<str:pk>/', views.VideoDetailAPIView.as_view(), name='video-detail'),
    path('recommended', views.VideoRecommendedAPIView.as_view(), name='video-recommendation'),
    path('related', views.VideoRelatedAPIView.as_view(), name='video-related'),
]