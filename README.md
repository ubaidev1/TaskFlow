# TaskFlow

A full-stack task management application built with **React** (frontend) and **Django + Django REST Framework** (backend). Features a clean, modern UI with dark/light mode, task priorities, due dates with overdue highlighting, pagination, a stats dashboard, and a dedicated weather section powered by the free OpenWeather APIs.

## Tech Stack

- **Backend:** Django 5, Django REST Framework, python-dotenv, requests
- **Frontend:** React 19, Vite, TailwindCSS v4, lucide-react
- **Database:** PostgreSQL

## Project Structure

```
TaskFlow/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── taskflow/              # Django project settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── tasks/                 # Tasks app (CRUD + stats)
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── services.py        # Business logic (stats computation)
│   │   ├── urls.py
│   │   ├── migrations/
│   │   └── tests/
│   │       ├── test_tasks.py  # CRUD endpoint tests
│   │       └── test_stats.py  # Stats endpoint tests
│   └── integrations/          # External API integrations
│       ├── services.py        # OpenWeather API service
│       ├── views.py
│       ├── urls.py
│       └── tests/
│           └── test_weather.py
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx            # Main application component
│       ├── index.css          # TailwindCSS + theme variables
│       ├── api/
│       │   ├── tasks.js       # Task API service layer
│       │   └── weather.js     # Weather API service layer
│       ├── hooks/
│       │   └── useTheme.js    # Dark/light mode hook
│       ├── utils/
│       │   └── date.js        # Date formatting + overdue logic
│       └── components/
│           ├── Header.jsx
│           ├── StatsWidget.jsx
│           ├── TaskCard.jsx
│           ├── TaskForm.jsx
│           ├── Pagination.jsx
│           ├── ConfirmDialog.jsx
│           └── WeatherSection.jsx
└── README.md
```

## Setup Instructions

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- An OpenWeather API key (free tier is sufficient — get one at https://openweathermap.org/api)

### Backend

1. **Create a virtual environment and install dependencies:**

   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Configure environment variables:**

   ```bash
   cp .env.example .env
   ```

   Edit `backend/.env` and set your values:

   ```env
   SECRET_KEY=your-django-secret-key-here
   OPENWEATHER_API_KEY=your-openweather-api-key-here
   DB_NAME=taskflow
   DB_USER=postgres
   DB_PASSWORD=your-postgres-password
   DB_HOST=localhost
   DB_PORT=5432
   ```

3. **Run migrations:**

   ```bash
   python manage.py migrate
   ```

4. **Populate sample data (optional):**

   ```bash
   python manage.py populate_tasks
   ```

   This creates 15 sample tasks with varied priorities, due dates, and locations. Use `--clear` to wipe existing tasks first:

   ```bash
   python manage.py populate_tasks --clear
   ```

5. **Start the development server:**

   ```bash
   python manage.py runserver
   ```

   The API will be available at `http://localhost:8000/api/`.

6. **Run tests:**

   ```bash
   python manage.py test
   ```

### Frontend

1. **Install dependencies:**

   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server:**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173/`.

   The Vite dev server proxies `/api` requests to the Django backend at `localhost:8000`, so both servers must be running simultaneously.

3. **Build for production:**

   ```bash
   npm run build
   ```

## Environment Variables

| Variable               | Required | Description                                      |
|------------------------|----------|--------------------------------------------------|
| `SECRET_KEY`           | Yes      | Django secret key                                |
| `OPENWEATHER_API_KEY`  | Yes      | OpenWeather API key (free tier works)              |
| `DB_NAME`              | Yes      | PostgreSQL database name                         |
| `DB_USER`              | Yes      | PostgreSQL database user                         |
| `DB_PASSWORD`          | Yes      | PostgreSQL database password                     |
| `DB_HOST`              | No       | PostgreSQL host (default: localhost)             |
| `DB_PORT`              | No       | PostgreSQL port (default: 5432)                  |

## API Endpoints

| Method | Endpoint                    | Description                              |
|--------|-----------------------------|------------------------------------------|
| GET    | `/api/tasks/`               | List tasks (paginated, 10 per page)      |
| POST   | `/api/tasks/`               | Create a new task                        |
| GET    | `/api/tasks/<id>/`          | Retrieve a single task                   |
| PUT    | `/api/tasks/<id>/`          | Update a task                            |
| PATCH  | `/api/tasks/<id>/`          | Partially update a task                  |
| DELETE | `/api/tasks/<id>/`          | Delete a task                            |
| GET    | `/api/tasks/stats/`         | Task statistics (total/completed/pending/overdue) |
| GET    | `/api/weather/?city=<name>` | Current weather + 5-day forecast for a city |

## Database Schema

### Task Model

| Field         | Type          | Constraints                              |
|---------------|---------------|------------------------------------------|
| `id`          | BigAutoField  | Primary key                              |
| `title`       | CharField(100)| Required, non-empty, max 100 chars       |
| `description` | TextField(500)| Optional, max 500 chars                 |
| `priority`    | CharField(10) | `low`, `medium`, or `high` (default: medium) |
| `due_date`    | DateField     | Optional, nullable                       |
| `completed`   | BooleanField  | Default: false                           |
| `created_at`  | DateTimeField | Auto-set on creation                     |
| `updated_at`  | DateTimeField | Auto-set on update                       |

## Features

- **Task CRUD:** Create, read, update, and delete tasks
- **Priority levels:** Low (green), Medium (yellow), High (red) with color-coded tags
- **Due dates:** With visual overdue highlighting (red border)
- **Dark/light mode:** Toggle with smooth CSS transitions, persisted via localStorage
- **Pagination:** 10 tasks per page with clean pagination controls
- **Stats dashboard:** Total, completed, pending, and overdue task counts
- **Weather section:** Search any city to see current conditions, details (humidity, wind, pressure, visibility), sun times, and a 5-day forecast — powered by free OpenWeather APIs
- **Responsive design:** Works on mobile, tablet, and desktop
