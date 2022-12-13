from django.urls import path
from . import views 

urlpatterns = [
    path('', views.VideoListCreateAPIView.as_view(), name='video-list'),
    path('<str:pk>/', views.VideoDetailAPIView.as_view(), name='video-detail'),
    path('<str:pk>/update', views.VideoUpdateAPIView.as_view(), name='video-update'),
    path('<str:pk>/delete', views.VideoDeleteAPIView.as_view(), name='video-delete'),
    path('<str:pk>/open', views.OpenPlayerView.as_view(), name='video-open-player'),
    path('<str:pk>/folder', views.OpenFolderView.as_view(), name='video-open-folder'),
    path('<str:pk>/localdelete', views.LocalDeleteView.as_view(), name='video-local-delete'),
    path('<str:pk>/viewincr', views.VideoIncrementView.as_view(), name='video-view-increment'),
    path('recommended', views.VideoRecommendedAPIView.as_view(), name='video-recommendation'),
    path('related', views.VideoRelatedAPIView.as_view(), name='video-related'),
]