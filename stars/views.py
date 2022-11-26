from .serializer import StarSerializer
from .models import Star
from rest_framework import generics

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
