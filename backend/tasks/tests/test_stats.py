from datetime import date, timedelta

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from tasks.models import Task


class TaskStatsTests(APITestCase):
    """Tests for the /api/tasks/stats/ endpoint."""

    def setUp(self):
        today = date.today()

        # Completed task
        Task.objects.create(
            title="Completed task",
            completed=True,
            due_date=today + timedelta(days=5),
        )
        # Pending task (not overdue)
        Task.objects.create(
            title="Pending task",
            completed=False,
            due_date=today + timedelta(days=3),
        )
        # Overdue task (due in the past, not completed)
        Task.objects.create(
            title="Overdue task",
            completed=False,
            due_date=today - timedelta(days=2),
        )
        # Overdue but completed (should NOT count as overdue)
        Task.objects.create(
            title="Completed overdue",
            completed=True,
            due_date=today - timedelta(days=1),
        )

    def test_stats_counts(self):
        url = reverse("task-stats")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total"], 4)
        self.assertEqual(response.data["completed"], 2)
        self.assertEqual(response.data["pending"], 2)
        self.assertEqual(response.data["overdue"], 1)

    def test_stats_empty_database(self):
        Task.objects.all().delete()
        url = reverse("task-stats")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total"], 0)
        self.assertEqual(response.data["completed"], 0)
        self.assertEqual(response.data["pending"], 0)
        self.assertEqual(response.data["overdue"], 0)
