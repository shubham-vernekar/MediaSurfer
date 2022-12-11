from django.urls import path
from . import views 

urlpatterns = [
    path('categories', views.CategoryListCreateAPIView.as_view(), name='categories-list'),
    path('categories/<str:pk>/', views.CategoryDetailAPIView.as_view(), name='categories-detail'),
    path('navbar', views.NavbarListView.as_view(), name='navbar-list'),
    path('series', views.SeriesListCreateAPIView.as_view(), name='series-list'),
    path('mastersearch', views.MasterSearchView.as_view(), name='master-search'),
]