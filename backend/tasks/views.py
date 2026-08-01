from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.pagination import PageNumberPagination
from django.db import models
from django.db.models import F
from rest_framework.response import Response

from .models import Task
from .serializers import TaskSerializer
from .services import get_task_stats


@api_view(["GET", "POST"])
def task_list(request):
    """List all tasks (paginated) or create a new task."""
    if request.method == "GET":
        queryset = Task.objects.all()

        # Search by title or description
        search = request.query_params.get("search", "").strip()
        if search:
            queryset = queryset.filter(
                models.Q(title__icontains=search) | models.Q(description__icontains=search)
            )

        # Filter by priority
        priority = request.query_params.get("priority", "").strip()
        if priority in ("low", "medium", "high"):
            queryset = queryset.filter(priority=priority)

        # Filter by completed status
        completed = request.query_params.get("completed", "").strip()
        if completed == "true":
            queryset = queryset.filter(completed=True)
        elif completed == "false":
            queryset = queryset.filter(completed=False)

        # Ordering
        ordering = request.query_params.get("ordering", "-created_at").strip()
        valid_orderings = {
            "created_at", "-created_at",
            "updated_at", "-updated_at",
            "due_date", "-due_date",
            "priority", "-priority",
            "title", "-title",
        }
        if ordering not in valid_orderings:
            ordering = "-created_at"

        # Handle NULL due dates: push tasks with no due date to the end
        if ordering == "due_date":
            queryset = queryset.order_by(F("due_date").asc(nulls_last=True))
        elif ordering == "-due_date":
            queryset = queryset.order_by(F("due_date").desc(nulls_last=True))
        else:
            queryset = queryset.order_by(ordering)

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
