from django.urls import path
from . import views 

urlpatterns = [
    path('categories', views.CategoryListCreateAPIView.as_view(), name='categories-list'),
    path('categories/names', views.CategoryNamesListAPIView.as_view(), name='categories-list-names'),
    path('categories/<str:pk>/', views.CategoryDetailAPIView.as_view(), name='categories-detail'),
    path('categories/<str:pk>/update', views.CategoryUpdateAPIView.as_view(), name='categories-update'),
    path('categories/<str:pk>/delete', views.CategoryDeleteAPIView.as_view(), name='categories-delete'),
    path('navbar', views.NavbarListView.as_view(), name='navbar-list'),
    path('series', views.SeriesListCreateAPIView.as_view(), name='series-list'),
    path('mastersearch', views.MasterSearchView.as_view(), name='master-search'),
    path('scan', views.RunScanView.as_view(), name='scan-videos'),
    path('json', views.UpdateJson.as_view(), name='update-json'),
    path('pending', views.FindPending.as_view(), name='find-pending'),
    path('openfolder', views.OpenFileFolderView.as_view(), name='open-file-folder'),
    path('volume', views.UpdateVolume.as_view(), name='volume'),
    path('debrid/details', views.GetDebridDetails.as_view(), name='debrid-details'),
    path('real-debrid/list', views.ListRealDebrid.as_view(), name='list-real-debrid'),
    path('debrid-files/import', views.DebridFilesImportAPIView.as_view(), name='debrid-import'),
    path('debrid-files', views.DebridFilesCreateAPIView.as_view(), name='debrid-files-add'),
    # path('real-debrid/delete', views.RealDebridDeleteAPIView.as_view(), name='debrid-delete'),
    path('debrid-files/delete', views.DebridFilesDeleteAPIView.as_view(), name='debrid-files-delete'),
    path('scan/logs', views.GetScanLogs.as_view(), name='get-scan-logs'),
    path('webscr', views.GetWebScrData.as_view(), name='get-webscr'),
    path('task-status/<str:task_id>/', views.check_status),
]