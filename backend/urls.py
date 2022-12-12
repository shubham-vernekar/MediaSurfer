from django.urls import path
from . import views 

urlpatterns = [
    path('categories', views.CategoryListCreateAPIView.as_view(), name='categories-list'),
    path('categories/<str:pk>/', views.CategoryDetailAPIView.as_view(), name='categories-detail'),
    path('categories/<str:pk>/update', views.CategoryUpdateAPIView.as_view(), name='categories-update'),
    path('categories/<str:pk>/delete', views.CategoryDeleteAPIView.as_view(), name='categories-delete'),
    path('navbar', views.NavbarListView.as_view(), name='navbar-list'),
    path('series', views.SeriesListCreateAPIView.as_view(), name='series-list'),
    path('mastersearch', views.MasterSearchView.as_view(), name='master-search'),
    path('scan', views.RunScanView.as_view(), name='scan-videos'),
    path('json', views.UpdateJson.as_view(), name='update-json'),
]