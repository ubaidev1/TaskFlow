"""Business logic for tasks, kept separate from views."""

from datetime import date

from django.db.models import Count, Q

from .models import Task


def get_task_stats():
    """Return aggregate counts for total, completed, pending, and overdue tasks."""
    today = date.today()
    queryset = Task.objects.all()

    total = queryset.count()
    completed = queryset.filter(completed=True).count()
    pending = queryset.filter(completed=False).count()
    overdue = queryset.filter(
        completed=False,
        due_date__lt=today,
    ).count()

    return {
        "total": total,
        "completed": completed,
        "pending": pending,
        "overdue": overdue,
    }
