from django.urls import path
from . import views 

urlpatterns = [
    path('', views.VideoListCreateAPIView.as_view(), name='video-list'),
    path('debrid', views.DebridVideoListCreateAPIView.as_view(), name='debrid-videos-list'),
    path('<str:pk>/', views.VideoDetailAPIView.as_view(), name='video-detail'),
    path('debrid/<str:pk>/', views.DebridVideoDetailAPIView.as_view(), name='debrid-videos-detail'),
    path('<str:pk>/update', views.VideoUpdateAPIView.as_view(), name='video-update'),
    path('<str:pk>/delete', views.VideoDeleteAPIView.as_view(), name='video-delete'),
    path('<str:pk>/open', views.OpenPlayerView.as_view(), name='video-open-player'),
    path('<str:pk>/folder', views.OpenFolderView.as_view(), name='video-open-folder'),
    path('<str:pk>/localdelete', views.LocalDeleteView.as_view(), name='video-local-delete'),
    path('<str:pk>/viewincr', views.VideoIncrementView.as_view(), name='video-view-increment'),
    path('debrid/<str:pk>/update', views.DebridVideoUpdateAPIView.as_view(), name='debrid-update'),
    path('debrid/<str:pk>/viewincr', views.DebridVideoIncrementView.as_view(), name='debrid-view-increment'),
    path('debrid/<str:pk>/delete', views.DebridVideoDeleteAPIView.as_view(), name='debrid-local-delete'),
    path('recommended', views.VideoRecommendedAPIView.as_view(), name='video-recommendation'),
    path('related', views.VideoRelatedAPIView.as_view(), name='video-related'),
]