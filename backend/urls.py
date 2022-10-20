from django.urls import path
from . import views 

urlpatterns = [
    path('videos', views.VideoListCreateAPIView.as_view(), name='product-list'),
    path('videos/<str:pk>/', views.ProductDetailAPIView.as_view(), name='product-detail')
]