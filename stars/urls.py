from django.urls import path
from . import views 

urlpatterns = [
    path('', views.StarListCreateAPIView.as_view(), name='star-list'),
    path('<str:pk>/', views.StarDetailAPIView.as_view(), name='star-detail')
]