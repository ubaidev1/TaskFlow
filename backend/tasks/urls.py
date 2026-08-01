from django.urls import path

from .views import task_detail, task_list, task_stats

urlpatterns = [
    path("", task_list, name="task-list"),
    path("stats/", task_stats, name="task-stats"),
    path("<int:pk>/", task_detail, name="task-detail"),
]
