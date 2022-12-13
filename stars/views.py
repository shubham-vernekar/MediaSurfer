from .serializer import StarSerializer
from .models import Star
from rest_framework import generics
from rest_framework.response import Response

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
        qs = Star.objects.all()
        if query:
            qs = qs.filter(name__icontains=query)
        
        return Response(qs.values_list('name', flat=True))