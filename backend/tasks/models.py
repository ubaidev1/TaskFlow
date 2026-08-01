from django.db import models


class Task(models.Model):
    """A single task item with priority, due date, and optional location."""

    PRIORITY_LOW = "low"
    PRIORITY_MEDIUM = "medium"
    PRIORITY_HIGH = "high"
    PRIORITY_CHOICES = [
        (PRIORITY_LOW, "Low"),
        (PRIORITY_MEDIUM, "Medium"),
        (PRIORITY_HIGH, "High"),
    ]

    title = models.CharField(max_length=100)
    description = models.TextField(max_length=500, blank=True, default="")
    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default=PRIORITY_MEDIUM,
    )
    due_date = models.DateField(null=True, blank=True)
    completed = models.BooleanField(default=False)
    location = models.CharField(
        max_length=255,
        blank=True,
        default="",
        help_text="City name for weather lookup (optional)",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title
