from django.urls import path
from . import views 

urlpatterns = [
    path('categories', views.CategoryListCreateAPIView.as_view(), name='categories-list'),
    path('categories/<str:pk>/', views.CategoryDetailAPIView.as_view(), name='categories-detail')
]