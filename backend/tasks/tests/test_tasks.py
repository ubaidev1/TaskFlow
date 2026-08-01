from datetime import date, timedelta

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from tasks.models import Task


class TaskCRUDTests(APITestCase):
    """Tests for the task CRUD endpoints."""

    def setUp(self):
        self.task = Task.objects.create(
            title="Buy groceries",
            description="Milk, eggs, bread",
            priority="medium",
            due_date=date.today() + timedelta(days=3),
        )

    # --- List ---
    def test_list_tasks(self):
        url = reverse("task-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("results", response.data)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["title"], "Buy groceries")

    def test_list_tasks_pagination(self):
        Task.objects.all().delete()
        for i in range(15):
            Task.objects.create(title=f"Task {i}")
        url = reverse("task-list")
        response = self.client.get(url, {"page": 1})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 15)
        self.assertEqual(len(response.data["results"]), 10)

        response = self.client.get(url, {"page": 2})
        self.assertEqual(len(response.data["results"]), 5)

    # --- Create ---
    def test_create_task(self):
        url = reverse("task-list")
        data = {
            "title": "New task",
            "description": "A test task",
            "priority": "high",
            "due_date": str(date.today() + timedelta(days=7)),
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "New task")
        self.assertEqual(response.data["priority"], "high")
        self.assertFalse(response.data["completed"])

    def test_create_task_empty_title(self):
        url = reverse("task-list")
        data = {"title": "   "}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("title", response.data)

    def test_create_task_invalid_priority(self):
        url = reverse("task-list")
        data = {"title": "Test", "priority": "urgent"}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("priority", response.data)

    # --- Retrieve ---
    def test_retrieve_task(self):
        url = reverse("task-detail", kwargs={"pk": self.task.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Buy groceries")

    def test_retrieve_task_not_found(self):
        url = reverse("task-detail", kwargs={"pk": 99999})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # --- Update ---
    def test_update_task(self):
        url = reverse("task-detail", kwargs={"pk": self.task.pk})
        data = {
            "title": "Buy groceries and flowers",
            "description": "Milk, eggs, bread, roses",
            "priority": "high",
            "due_date": str(date.today() + timedelta(days=5)),
        }
        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Buy groceries and flowers")
        self.assertEqual(response.data["priority"], "high")

    def test_patch_task(self):
        url = reverse("task-detail", kwargs={"pk": self.task.pk})
        data = {"completed": True}
        response = self.client.patch(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["completed"])

    # --- Delete ---
    def test_delete_task(self):
        url = reverse("task-detail", kwargs={"pk": self.task.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Task.objects.filter(pk=self.task.pk).exists())

    def test_delete_task_not_found(self):
        url = reverse("task-detail", kwargs={"pk": 99999})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
