from django.urls import path
from . import views 

urlpatterns = [
    path('videos', views.VideoListCreateAPIView.as_view(), name='product-list'),
    path('videos/<str:pk>/', views.ProductDetailAPIView.as_view(), name='product-detail'),
    path('stars', views.StarListCreateAPIView.as_view(), name='star-list'),
    path('stars/<str:pk>/', views.StarDetailAPIView.as_view(), name='star-detail'),
    path('categories', views.CategoryListCreateAPIView.as_view(), name='categories-list'),
    path('categories/<str:pk>/', views.CategoryDetailAPIView.as_view(), name='categories-detail')
]