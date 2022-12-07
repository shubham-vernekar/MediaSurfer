from .models import Category, Navbar, Series
from .serializer import CategorySerializer, NavbarSerializer, SeriesSerializer
from rest_framework import generics
from django.core.exceptions import FieldError
from django.db.models import Q

class CategoryListCreateAPIView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_queryset(self, *args, **kwargs):
        qs = super().get_queryset(*args, **kwargs)
        query = self.request.GET.get("query", None)
        sort_by = self.request.GET.get("sort_by", None)

        if query:
            qs = qs.filter(Q(title__icontains=query))

        if sort_by:
            try:
                qs = qs.order_by(sort_by)
            except (FieldError):
                return qs.none()

        return qs

class CategoryDetailAPIView(generics.RetrieveAPIView):
    queryset = Category.objects.all()
    serializer_class = NavbarSerializer


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

        if query:
            qs = qs.filter(Q(name__icontains=query))

        if sort_by:
            try:
                qs = qs.order_by(sort_by)
            except (FieldError):
                qs = qs.none()

        return qs
