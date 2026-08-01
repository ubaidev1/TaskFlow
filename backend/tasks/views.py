from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from .models import Task
from .serializers import TaskSerializer
from .services import get_task_stats


@api_view(["GET", "POST"])
def task_list(request):
    """List all tasks (paginated) or create a new task."""
    if request.method == "GET":
        queryset = Task.objects.all()
        paginator = PageNumberPagination()
        paginator.page_size = 10
        page = paginator.paginate_queryset(queryset, request)
        if page is not None:
            serializer = TaskSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        serializer = TaskSerializer(queryset, many=True)
        return Response(serializer.data)

    if request.method == "POST":
        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
def task_detail(request, pk):
    """Retrieve, update, or delete a single task."""
    try:
        task = Task.objects.get(pk=pk)
    except Task.DoesNotExist:
        return Response(
            {"detail": "Task not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    if request.method == "GET":
        serializer = TaskSerializer(task)
        return Response(serializer.data)

    if request.method in ("PUT", "PATCH"):
        partial = request.method == "PATCH"
        serializer = TaskSerializer(task, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == "DELETE":
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
def task_stats(request):
    """Return aggregate statistics for all tasks."""
    stats = get_task_stats()
    return Response(stats)
