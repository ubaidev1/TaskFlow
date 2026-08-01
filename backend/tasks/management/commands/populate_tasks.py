from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from tasks.models import Task


SAMPLE_TASKS = [
    {
        "title": "Review quarterly project roadmap",
        "description": "Go through the Q1 roadmap document and provide feedback on timelines, resource allocation, and potential risks.",
        "priority": "high",
        "completed": False,
        "days_offset": 3,
        "location": "San Francisco",
    },
    {
        "title": "Fix login page responsive issues",
        "description": "The login form breaks on screens smaller than 375px. Need to adjust breakpoints and test on multiple devices.",
        "priority": "high",
        "completed": False,
        "days_offset": 1,
        "location": "",
    },
    {
        "title": "Prepare slides for client demo",
        "description": "Create a 15-slide deck covering features, architecture, and roadmap for next week's client presentation.",
        "priority": "medium",
        "completed": False,
        "days_offset": 5,
        "location": "London",
    },
    {
        "title": "Update API documentation",
        "description": "Add examples for the new pagination and filtering endpoints. Update the OpenAPI spec.",
        "priority": "medium",
        "completed": True,
        "days_offset": -2,
        "location": "",
    },
    {
        "title": "Set up CI/CD pipeline",
        "description": "Configure GitHub Actions for automated testing, linting, and deployment to staging.",
        "priority": "high",
        "completed": False,
        "days_offset": 7,
        "location": "",
    },
    {
        "title": "Refactor user authentication module",
        "description": "Move from session-based auth to JWT. Update middleware and write migration tests.",
        "priority": "medium",
        "completed": False,
        "days_offset": 10,
        "location": "",
    },
    {
        "title": "Design new dashboard widgets",
        "description": "Create mockups for the analytics dashboard — charts, KPI cards, and a recent activity feed.",
        "priority": "low",
        "completed": False,
        "days_offset": 14,
        "location": "New York",
    },
    {
        "title": "Conduct code review for PR #142",
        "description": "Review the payment integration pull request. Check edge cases, error handling, and test coverage.",
        "priority": "high",
        "completed": False,
        "days_offset": 0,
        "location": "",
    },
    {
        "title": "Write unit tests for weather service",
        "description": "Add tests for the OpenWeather API integration covering success, timeout, and invalid city scenarios.",
        "priority": "medium",
        "completed": True,
        "days_offset": -5,
        "location": "",
    },
    {
        "title": "Optimize database queries",
        "description": "Profile slow endpoints and add select_related/prefetch_related where needed. Target: reduce average response time by 40%.",
        "priority": "medium",
        "completed": False,
        "days_offset": -1,
        "location": "",
    },
    {
        "title": "Plan team retrospective meeting",
        "description": "Schedule a 1-hour retro. Prepare a board with 'What went well', 'What could improve', and 'Action items'.",
        "priority": "low",
        "completed": False,
        "days_offset": 6,
        "location": "Tokyo",
    },
    {
        "title": "Migrate static assets to CDN",
        "description": "Move all static files to CloudFront. Update Django storages config and test in staging.",
        "priority": "low",
        "completed": False,
        "days_offset": 20,
        "location": "",
    },
    {
        "title": "Investigate memory leak in worker process",
        "description": "The Celery worker memory grows steadily. Use tracemalloc to identify the source and patch it.",
        "priority": "high",
        "completed": False,
        "days_offset": -3,
        "location": "",
    },
    {
        "title": "Update dependencies to latest LTS",
        "description": "Bump Django to 5.1, DRF to 3.15. Run full test suite and fix any deprecation warnings.",
        "priority": "low",
        "completed": True,
        "days_offset": -10,
        "location": "",
    },
    {
        "title": "Create onboarding guide for new hires",
        "description": "Write a step-by-step guide covering repo setup, coding standards, deployment process, and useful links.",
        "priority": "medium",
        "completed": False,
        "days_offset": 8,
        "location": "Berlin",
    },
]


class Command(BaseCommand):
    help = "Populate the database with sample tasks for development and testing."

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete all existing tasks before populating.",
        )

    def handle(self, *args, **options):
        if options["clear"]:
            deleted, _ = Task.objects.all().delete()
            self.stdout.write(self.style.WARNING(f"Deleted {deleted} existing task(s)."))

        created_count = 0
        for sample in SAMPLE_TASKS:
            due_date = timezone.now().date() + timedelta(days=sample["days_offset"])
            _, created = Task.objects.get_or_create(
                title=sample["title"],
                defaults={
                    "description": sample["description"],
                    "priority": sample["priority"],
                    "completed": sample["completed"],
                    "due_date": due_date,
                    "location": sample["location"],
                },
            )
            if created:
                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Done. Created {created_count} new task(s), "
                f"{len(SAMPLE_TASKS) - created_count} already existed."
            )
        )
