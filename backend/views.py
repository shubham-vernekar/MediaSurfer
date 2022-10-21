from .models import Category
from .serializer import CategorySerializer
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
                qs = self.none()

        return qs

class CategoryDetailAPIView(generics.RetrieveAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer