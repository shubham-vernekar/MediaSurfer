from .models import Category, Navbar, Series, UserLevelData
from .serializer import CategorySerializer, NavbarSerializer, SeriesSerializer
from .utils import get_pending_videos
from django.utils import timezone
from rest_framework import generics
from django.core.exceptions import FieldError
from django.db.models import Q, F
from videos.models import Video
from stars.models import Star
from videos.serializer import VideoListSerializer
from stars.serializer import StarSerializer
from rest_framework.response import Response
import os
from django.conf import settings
import json
from django.core.management import call_command
from file_read_backwards import FileReadBackwards
from django.contrib.postgres.search import SearchQuery, SearchRank

class CategoryListCreateAPIView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_queryset(self, *args, **kwargs):
        qs = super().get_queryset(*args, **kwargs)
        query = self.request.GET.get("query", None)
        sort_by = self.request.GET.get("sort_by", None)

        if query:
            search_query = SearchQuery(query)
            search_rank = SearchRank(F("search_vector"), search_query)
            qs = qs.annotate(rank=search_rank).filter(Q(search_vector=search_query)|Q(title__icontains=query)).order_by("-rank") 

        if sort_by:
            try:
                qs = qs.order_by(sort_by)
            except (FieldError):
                return qs.none()

        return qs


class CategoryDetailAPIView(generics.RetrieveAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class CategoryUpdateAPIView(generics.UpdateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = "pk"

    def perform_update(self, serializer):
        return super().perform_update(serializer)

class CategoryDeleteAPIView(generics.DestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = "pk"

    def perform_destroy(self, instance):
        return super().perform_destroy(instance)


class NavbarListView(generics.ListCreateAPIView):
    queryset = Navbar.objects.all()
    serializer_class = NavbarSerializer

    def get_queryset(self, *args, **kwargs):
        qs = super().get_queryset(*args, **kwargs)
        qs = qs.order_by("-weight")
        return qs


class SeriesListCreateAPIView(generics.ListCreateAPIView):
    queryset = Series.objects.all()
    serializer_class = SeriesSerializer

    def get_queryset(self, *args, **kwargs):
        qs = super().get_queryset(*args, **kwargs)
        query = self.request.GET.get("query", None)
        sort_by = self.request.GET.get("sort_by", None)
        cast = self.request.GET.get("cast", None)
        categories = self.request.GET.get("categories", None)

        if query:
            qs = qs.filter(Q(name__icontains=query))

        if sort_by:
            try:
                qs = qs.order_by(sort_by)
            except (FieldError):
                qs = qs.none()

        if cast:
            qs = qs.filter(Q(cast__icontains=cast))

        if categories:
            qs = qs.filter(Q(categories__icontains=categories))

        return qs

    def list(self, request, *args, **kwargs):
        response = super().list(request, args, kwargs)
        qs = self.get_queryset()
        all_stars = set()

        for records in qs:
            if records.cast:
                all_stars.update([x for x in records.cast.split(",") if x])

        for k, records in enumerate(response.data["results"]):
            video_qs = Video.objects.filter(series__id=records["id"])
            video_data = VideoListSerializer(video_qs, many=True).data 
            response.data["results"][k]["video_data"] = video_data
            
        response.data["all_stars"] = sorted(list(all_stars))
        return response


class MasterSearchView(generics.GenericAPIView):
    def get(self, request):
        query = request.GET.get("query", None)
        videos, cast, categories = [], [], []

        if query:
            search_query = SearchQuery(query)
            search_rank = SearchRank(F("search_vector"), search_query)
            videos = VideoListSerializer(Video.objects.annotate(rank=search_rank).filter(Q(search_vector=search_query)|Q(search_text__icontains=query)).order_by("-rank")[:8], many=True).data 
            cast = StarSerializer(Star.objects.annotate(rank=search_rank).filter(Q(search_vector=search_query)|Q(name__icontains=query)).order_by("-rank")[:5], many=True).data
            categories = CategorySerializer(Category.objects.annotate(rank=search_rank).filter(Q(search_vector=search_query)|Q(title__icontains=query)).order_by("-rank")[:5], many=True).data

        return Response({
            "videos": videos,
            "cast": cast,
            "categories": categories,
        })

class RunScanView(generics.GenericAPIView):
    def post(self, request):
        try:
            user_data_object = UserLevelData.objects.latest('update_timestamp')
        except UserLevelData.DoesNotExist:
            user_data_object = UserLevelData()

        time_delta = timezone.now() - user_data_object.scan_timestamp
        time_delta_minutes = (time_delta.days*3600*24 + time_delta.seconds)/60

        if not user_data_object.scanning or time_delta_minutes>10:
            call_command('scan')
            return Response({"Status": "Scanning Complete"})
        else:
            return Response({"Status": "Scanning already in progress"})


class UpdateJson(generics.GenericAPIView):

    def get(self, request):
        labels_data = open(os.path.join(settings.BASE_DIR, 'backend/management/commands/labels.json'),'r').read()
        seeds_data = open(os.path.join(settings.BASE_DIR, 'backend/management/commands/directories.json'),'r').read()

        return Response({
                "labels_data" : labels_data,
                "seeds_data" : seeds_data
            })
    
    def post(self, request, *args, **kwargs):
        filename = request.data.get('filename', False)
        data = request.data.get('data', '') 

        if filename:
            try:
                _ = json.loads(data)
                data_file = open(os.path.join(settings.BASE_DIR, f'backend/management/commands/{filename}.json'),'w')
                data_file.write(data)
                data_file.close()
                return Response({
                        "status": "OK",
                        "message": f"{filename} Updated Successfully",
                    })
            except:
                return Response({
                        "status": "Failed",
                        "message": f"{filename} Update Failed",
                    })

        return Response({
                "status": "Failed",
                "message": f"{filename} Not found"
            })

class CategoryNamesListAPIView(generics.GenericAPIView):
    def get(self, request):
        query = request.GET.get("query", None)
        qs = Category.objects.all().order_by("title") 
        if query:
            search_query = SearchQuery(query)
            search_rank = SearchRank(F("search_vector"), search_query)
            qs = qs.annotate(rank=search_rank).filter(Q(search_vector=search_query)|Q(title__icontains=query)).order_by("-rank") 
        
        return Response(qs.values_list('title', flat=True))

class FindPending(generics.GenericAPIView):

    def get(self, request):
        get_data = request.GET.get("get_data", False)

        if get_data == "true":
            pending_videos, unsupported_videos = get_pending_videos()
            return Response({
                "pending" : len(pending_videos),
                "pending_videos" : pending_videos,
                "unsupported" : len(unsupported_videos),
                "unsupported_videos" : unsupported_videos
            })
        else:
            try:
                user_data_object = UserLevelData.objects.latest('update_timestamp')
            except UserLevelData.DoesNotExist:
                user_data_object = UserLevelData()

            if user_data_object.scan_timestamp:
                time_delta = timezone.now() - user_data_object.scan_timestamp
                time_delta_minutes = (time_delta.days*3600*24 + time_delta.seconds)/60

                if time_delta_minutes>10:
                    user_data_object.scanning = False
                    user_data_object.save()

                if time_delta_minutes<60:
                    scan_text = "Scanning, " if user_data_object.scanning else ""
                    return Response({
                        "pending" : f"{scan_text}{user_data_object.pending_videos} videos pending",
                        "pending_count" : user_data_object.pending_videos,
                        "unsupported" : f"{user_data_object.unsupported_videos} unsupported videos",
                        "unsupported_count" : user_data_object.unsupported_videos,
                        "scanning" : user_data_object.scanning
                    })

            pending_videos, unsupported_videos = get_pending_videos()
            user_data_object.pending_videos = len(pending_videos)
            user_data_object.unsupported_videos = len(unsupported_videos)
            user_data_object.scan_timestamp = timezone.now()
            user_data_object.update_timestamp = timezone.now()
            user_data_object.save()
            scan_text = "Scanning, " if user_data_object.scanning else ""
            return Response({
                "pending" : f"{scan_text}{len(pending_videos)} videos pending", 
                "pending_count" : len(pending_videos),
                "unsupported" : f"{len(unsupported_videos)} unsupported videos",
                "unsupported_count" : len(unsupported_videos),
                "scanning" : user_data_object.scanning
            })

class OpenFileFolderView(generics.GenericAPIView):
    def post(self, request):
        file_path = request.data.get('file', '') 
        if file_path:
            os.system('start %windir%\explorer.exe /select, "{}"'.format(file_path.replace("/", "\\")))

        return Response({
                "Status": "Success"
            })

class UpdateVolume(generics.GenericAPIView):

    def get(self, request):
        try:
            user_data_object = UserLevelData.objects.latest('update_timestamp')
        except UserLevelData.DoesNotExist:
            user_data_object = UserLevelData()

        return Response({
                "volume_level" : user_data_object.volume_level
            })

    def post(self, request):
        volume = request.data.get('volume', False)

        try:
            user_data_object = UserLevelData.objects.latest('update_timestamp')
        except UserLevelData.DoesNotExist:
            user_data_object = UserLevelData()

        if volume:
            try:
                volume = float(volume)
                if volume>=0 and volume<=1:
                    user_data_object.volume_level = float(volume)
                    user_data_object.save()
            except ValueError:
                pass

        return Response({
                "volume_level" : user_data_object.volume_level
            })

class GetScanLogs(generics.GenericAPIView):
    log_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), r"..\logs\scan.log")
    
    def get(self, request):
        max_lines = request.GET.get("lines", False)
        if max_lines:
            max_lines = int(max_lines)

        log_lines=[]
        with FileReadBackwards(self.log_file) as frb:
            while True:
                try:
                    log_line = frb.readline()
                except UnicodeDecodeError:
                    continue

                if not log_line:
                    break

                log_lines.append(log_line)

                if max_lines and len(log_lines) > max_lines:
                    break

                if "Starting processing ..." in log_line:
                    break

        log_lines.reverse()                 
        return Response({
            "data" : "\n".join(log_lines)
        })

