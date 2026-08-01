from rest_framework import serializers

from datetime import date

from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    """Serializer for the Task model with validation."""

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "priority",
            "due_date",
            "completed",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_title(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Title cannot be empty.")
        if len(value) > 100:
            raise serializers.ValidationError("Title cannot exceed 100 characters.")
        return value

    def validate_description(self, value):
        if value and len(value) > 500:
            raise serializers.ValidationError("Description cannot exceed 500 characters.")
        return value

    def validate_priority(self, value):
        valid = [choice[0] for choice in Task.PRIORITY_CHOICES]
        if value not in valid:
            raise serializers.ValidationError(
                f"Priority must be one of: {', '.join(valid)}."
            )
        return value

    def validate_due_date(self, value):
        if value and value < date.today():
            raise serializers.ValidationError("Due date cannot be in the past.")
        return value

