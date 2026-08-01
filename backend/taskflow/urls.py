"""
URL configuration for the taskflow project.

The API routes are:
    GET    /api/tasks/          — list tasks (paginated)
    POST   /api/tasks/          — create a task
    GET    /api/tasks/<id>/     — retrieve a task
    PUT    /api/tasks/<id>/     — update a task
    PATCH  /api/tasks/<id>/     — partially update a task
    DELETE /api/tasks/<id>/     — delete a task
    GET    /api/tasks/stats/    — task statistics
    GET    /api/weather/?city=  — current weather for a city
"""

from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/tasks/", include("tasks.urls")),
    path("api/weather/", include("integrations.urls")),
]
