from django.urls import path
from . import views 

urlpatterns = [
    path('', views.StarListCreateAPIView.as_view(), name='star-list'),
    path('names', views.StarNamesListAPIView.as_view(), name='star-list-mini'),
    path('<str:pk>/', views.StarDetailAPIView.as_view(), name='star-detail'),
    path('<str:pk>/update', views.StarUpdateAPIView.as_view(), name='star-update'),
    path('<str:pk>/delete', views.StarDeleteAPIView.as_view(), name='star-delete'),
]