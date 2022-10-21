from django.urls import path
from . import views 

urlpatterns = [
    path('', views.VideoListCreateAPIView.as_view(), name='product-list'),
    path('<str:pk>/', views.VideoDetailAPIView.as_view(), name='product-detail')
]