from typing import Any
from .models import Category, Navbar, Series, UserLevelData
from .serializer import CategorySerializer, NavbarSerializer, SeriesSerializer
from .utils import get_pending_videos, apply_regex
from django.utils import timezone
from rest_framework import generics
from django.core.exceptions import FieldError
from django.db.models import Q, F, ExpressionWrapper, BooleanField
from videos.models import Video, convert_url
from stars.models import Star
from videos.serializer import VideoListSerializer
from stars.serializer import StarSerializer
from rest_framework.response import Response
import os
import shutil
import datetime
from django.conf import settings
import json
from django.core.management import call_command
from file_read_backwards import FileReadBackwards
from django.contrib.postgres.search import SearchQuery, SearchRank
from collections import defaultdict
   
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
            title_match = ExpressionWrapper(Q(title__istartswith=query), output_field=BooleanField())
            qs = qs.annotate(rank=search_rank, starts_with=title_match).filter(Q(search_vector=search_query)|Q(title__icontains=query)).order_by("-rank").order_by('-starts_with') 

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

        qs = qs.filter(Q(videos__gt = 0))

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
            title_match = ExpressionWrapper(Q(title__istartswith=query), output_field=BooleanField())
            name_match = ExpressionWrapper(Q(name__istartswith=query), output_field=BooleanField())

            videos = VideoListSerializer(Video.objects.annotate(rank=search_rank, starts_with=title_match).filter(Q(search_vector=search_query)|Q(search_text__icontains=query)).order_by("-rank").order_by('-starts_with')[:8], many=True).data 
            categories = CategorySerializer(Category.objects.annotate(rank=search_rank, starts_with=title_match).filter(Q(search_vector=search_query)|Q(title__icontains=query)).order_by("-rank").order_by('-starts_with')[:5], many=True).data
            cast = StarSerializer(Star.objects.annotate(rank=search_rank, starts_with=name_match).filter(Q(search_vector=search_query)|Q(name__icontains=query)).order_by("-rank").order_by('-starts_with')[:5], many=True).data

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
            title_match = ExpressionWrapper(Q(title__istartswith=query), output_field=BooleanField())
            qs = qs.annotate(rank=search_rank, starts_with=title_match).filter(Q(search_vector=search_query)|Q(title__icontains=query)).order_by("-rank").order_by('-starts_with') 
        
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


class GetWebScrData(generics.GenericAPIView):

    def __init__(self):
        self.labels_data = json.loads(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "management/commands/labels.json"), 'r').read().lower())
        self.external_sites = self.labels_data.get("external_sites")

        all_thumbs_files = self.get_all_files(self.labels_data.get("tag_folders_thumb"), ["jpg", "jpeg", "png"])
        self.done_bucket = defaultdict(list)
        for i in all_thumbs_files:
            if "\\done\\" in i.lower():
                self.done_bucket["done"].append(i)

        for tag_folder in self.labels_data.get("tag_folders"):
            self.done_bucket["downloaded"] += self.get_all_files(tag_folder, ["mp4", "ts"]) 

    def get_all_files(self, root, extention):
        fileList=[]
        for path, _, files in os.walk(root):
            for name in files:
                name = os.path.join(path, name)
                if name[name.rfind(".")+1:].lower() in extention:
                    fileList.append(name)
        return fileList
    
    def check_match(self, match, search_term):
        for x in self.done_bucket["done"] + self.done_bucket["downloaded"]:
            if match.lower() in x.lower():
                return True
        return False

    def post(self, request):
        file_path = request.data.get('file_path', '') 
        open_folder = request.data.get('open', False) 
        if file_path:
            if open_folder:
                os.system('start %windir%\explorer.exe /select, "{}"'.format(file_path.replace("/", "\\")))
                return Response({
                    "Status": "Success"
                })
            
            new_dir = os.path.join(os.path.dirname(file_path), "Done")
            basename = os.path.basename(file_path)
            if not os.path.exists(new_dir):
                os.makedirs(new_dir)
            
            shutil.move(file_path, os.path.join(new_dir, basename))

            return Response({
                    "status": "success"
                })

    def get(self, request):
        try:
            user_data_object = UserLevelData.objects.latest('websrc_dir')
        except UserLevelData.DoesNotExist:
            user_data_object = UserLevelData()

        key_dir = request.GET.get('key', False)

        if key_dir:
            if os.path.exists(os.path.join(user_data_object.websrc_dir, key_dir, "done")):
                done_count = len(list(os.listdir(os.path.join(user_data_object.websrc_dir, key_dir, "done"))))
            else:
                done_count = 0

            index = int(request.GET.get('index', 0))
            reverse = request.GET.get('reverse', "false").lower() == "true"
            scr_pending = list(os.listdir(os.path.join(user_data_object.websrc_dir, key_dir)))
            scr_pending = [x for x in scr_pending if x.lower()!="done"]

            if reverse:
                scr_pending = scr_pending[::-1]
            total_count = len(scr_pending)
            poster_number = index if index>=0 else total_count-index

            try:
                release_date = datetime.datetime.strptime(apply_regex(r"([\d]{4}-[\d]{2}-[\d]{2})", scr_pending[index]), "%Y-%m-%d").date().strftime("%d %B %Y")
            except:
                release_date = ""

            movie_id = apply_regex(r"([a-zA-Z]{3,5}-\d{3,4})", scr_pending[index])
            is_duplicate = self.check_match(movie_id, key_dir)
            return Response({
                "title": os.path.splitext(scr_pending[index])[0],
                "movie_id": movie_id,
                "release_date": release_date,
                "count": f"Poster No {poster_number}: {done_count} Done, and {total_count} Pending - {round((done_count)*100/(total_count + done_count), 2)} "
                            f"% {' - Possible Duplicate' if is_duplicate else ''}",
                "video": self.external_sites.get("j_vid", "").replace("{key}", movie_id),
                "sub": self.external_sites.get("j_sub", "").replace("{key}", movie_id),
                "trailer": self.external_sites.get("j_trailer", "").replace("{key}", movie_id),
                "file_path": os.path.join(user_data_object.websrc_dir, key_dir, scr_pending[index]),
                "is_duplicate": is_duplicate,
                "url": convert_url(os.path.join(user_data_object.websrc_dir, key_dir, scr_pending[index]).replace("\\","/"))
            })

        else:
            dirs = list(os.listdir(user_data_object.websrc_dir))
            results = []
            for dir in dirs:
                if os.path.exists(os.path.join(user_data_object.websrc_dir, dir, "done")):
                    done_count = len(list(os.listdir(os.path.join(user_data_object.websrc_dir, dir, "done"))))
                else:
                    done_count = 0

                try:
                    star_object = Star.objects.get(name=dir.lower())
                    star_img = star_object.poster.url
                except:
                    star_img = "/static/images/no-profile-pic.jpg"

                results.append({
                    "title": dir,
                    "pending": len([x for x in list(os.listdir(os.path.join(user_data_object.websrc_dir, dir))) if x.lower()!="done"]),
                    "done" : done_count,
                    "img" : star_img
                })
                
            return Response({
                    "dirs": results
                })

        