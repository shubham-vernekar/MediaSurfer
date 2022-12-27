from .serializer import StarSerializer
from .models import Star
from rest_framework import generics
from rest_framework.response import Response
from django.contrib.postgres.search import SearchQuery, SearchRank
from django.db.models import Q, F

class StarListCreateAPIView(generics.ListCreateAPIView):
    queryset = Star.objects.all()
    serializer_class = StarSerializer
    pagination_class = None

    def get_queryset(self, *args, **kwargs):
        qs = super().get_queryset(*args, **kwargs)
        parameters = self.request.GET
        qs = qs.search(parameters)
        return qs

class StarDetailAPIView(generics.RetrieveAPIView):
    queryset = Star.objects.all()
    serializer_class = StarSerializer

class StarUpdateAPIView(generics.UpdateAPIView):
    queryset = Star.objects.all()
    serializer_class = StarSerializer
    lookup_field = "pk"

    def perform_update(self, serializer):
        return super().perform_update(serializer)

class StarDeleteAPIView(generics.DestroyAPIView):
    queryset = Star.objects.all()
    serializer_class = StarSerializer
    lookup_field = "pk"

    def perform_destroy(self, instance):
        return super().perform_destroy(instance)

class StarNamesListAPIView(generics.GenericAPIView):
    def get(self, request):
        query = request.GET.get("query", None)
        get_tags = request.GET.get("tags", False)

        qs = Star.objects.all().order_by("name") 
        if query:
            search_query = SearchQuery(query)
            search_rank = SearchRank(F("search_vector"), search_query)
            qs = qs.annotate(rank=search_rank).filter(Q(search_vector=search_query)|Q(name__icontains=query)).order_by("-rank") 
        
        if get_tags == "true":
            tags = [x.split(",") for x in qs.values_list('tags', flat=True) if x]
            tags = sorted([x for x in set([item for sublist in tags for item in sublist]) if x])
            return Response({
                "names": qs.values_list('name', flat=True),
                "tags": tags
            })
        
        return Response({
            "names": qs.values_list('name', flat=True)
        })