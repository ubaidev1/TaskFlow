"""Service layer for external API integrations.

Uses the free OpenWeather APIs:
  - Current Weather API (/data/2.5/weather) for current conditions
  - 5-day / 3-hour Forecast API (/data/2.5/forecast) for daily forecasts
Both accept city name directly — no geocoding or paid subscription required.
"""

import logging
from collections import defaultdict

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

CURRENT_WEATHER_URL = f"{settings.OPENWEATHER_API_BASE_URL}/data/2.5/weather"
FORECAST_URL = f"{settings.OPENWEATHER_API_BASE_URL}/data/2.5/forecast"


class WeatherServiceError(Exception):
    """Raised when the weather service encounters an error."""

    def __init__(self, message, status_code=500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


def _api_get(url, params):
    """Make a GET request to an OpenWeather API endpoint.

    Returns parsed JSON on success.
    Raises WeatherServiceError on failure.
    """
    try:
        response = requests.get(url, params=params, timeout=10)
    except requests.RequestException as exc:
        logger.error("OpenWeather request failed: %s", exc)
        raise WeatherServiceError("Unable to reach weather service.", 503) from exc

    if response.status_code == 401:
        raise WeatherServiceError("Invalid OpenWeather API key.", 500)

    if response.status_code == 404:
        raise WeatherServiceError("City not found.", 404)

    if response.status_code == 429:
        raise WeatherServiceError("Weather API rate limit exceeded. Try again later.", 429)

    if response.status_code != 200:
        logger.error("OpenWeather API error: status=%s body=%s", response.status_code, response.text)
        raise WeatherServiceError("Weather service returned an error.", 502)

    return response.json()


def _aggregate_forecast(forecast_list):
    """Aggregate 3-hour forecast entries into daily summaries (max 5 days).

    Each entry in forecast_list has a 'dt' timestamp, 'main' dict with temps,
    and a 'weather' list. We group by date and pick the midday entry's weather,
    plus the overall min/max temps for the day.
    """
    daily = defaultdict(lambda: {"temps": [], "entries": []})

    for entry in forecast_list:
        date_key = entry["dt_txt"][:10]  # YYYY-MM-DD
        daily[date_key]["temps"].append(entry["main"]["temp"])
        daily[date_key]["entries"].append(entry)

    forecast = []
    for date_key, data in list(daily.items())[:5]:
        # Pick the entry closest to midday (12:00) for weather description
        midday_entry = min(
            data["entries"],
            key=lambda e: abs(int(e["dt_txt"][11:13]) - 12),
        )
        weather_info = midday_entry["weather"][0]
        forecast.append({
            "date": midday_entry["dt"],
            "temp_max": round(max(data["temps"])),
            "temp_min": round(min(data["temps"])),
            "condition": weather_info.get("main", ""),
            "description": weather_info.get("description", ""),
            "icon": weather_info.get("icon", ""),
        })

    return forecast


def get_weather(city):
    """Fetch current weather and 5-day forecast for a city.

    Uses the free Current Weather API and 5-day Forecast API.
    Both accept city name directly — no geocoding or paid subscription needed.

    Returns a dict with current weather and forecast data.
    Raises WeatherServiceError on failure.
    """
    if not city or not city.strip():
        raise WeatherServiceError("City name is required.", 400)

    api_key = settings.OPENWEATHER_API_KEY
    if not api_key:
        raise WeatherServiceError("Weather API key is not configured.", 500)

    base_params = {"q": city.strip(), "appid": api_key, "units": "metric"}

    # Step 1: Fetch current weather
    current_data = _api_get(CURRENT_WEATHER_URL, base_params)

    # Step 2: Fetch 5-day / 3-hour forecast
    forecast_data = _api_get(FORECAST_URL, base_params)

    # Step 3: Aggregate 3-hour entries into daily summaries
    forecast = _aggregate_forecast(forecast_data.get("list", []))

    weather_info = current_data.get("weather", [{}])[0]
    sys_data = current_data.get("sys", {})

    return {
        "city": current_data.get("name", city),
        "country": sys_data.get("country", ""),
        "lat": current_data.get("coord", {}).get("lat"),
        "lon": current_data.get("coord", {}).get("lon"),
        "timezone": current_data.get("timezone", 0),
        "current": {
            "temperature": round(current_data["main"]["temp"]),
            "feels_like": round(current_data["main"]["feels_like"]),
            "humidity": current_data["main"].get("humidity", 0),
            "pressure": current_data["main"].get("pressure", 0),
            "wind_speed": round(current_data.get("wind", {}).get("speed", 0), 1),
            "wind_deg": current_data.get("wind", {}).get("deg", 0),
            "clouds": current_data.get("clouds", {}).get("all", 0),
            "visibility": current_data.get("visibility", 0),
            "condition": weather_info.get("main", ""),
            "description": weather_info.get("description", ""),
            "icon": weather_info.get("icon", ""),
            "sunrise": sys_data.get("sunrise"),
            "sunset": sys_data.get("sunset"),
        },
        "forecast": forecast,
    }
