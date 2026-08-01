"""Service layer for external API integrations.

Currently supports OpenWeather API for current weather lookups by city name.
"""

import logging

import requests
from django.conf import settings

logger = logging.getLogger(__name__)


class WeatherServiceError(Exception):
    """Raised when the weather service encounters an error."""

    def __init__(self, message, status_code=500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


def get_current_weather(city):
    """Fetch current weather for a city from OpenWeather API.

    Returns a dict with temperature, condition, icon, and description.
    Raises WeatherServiceError on failure.
    """
    if not city or not city.strip():
        raise WeatherServiceError("City name is required.", 400)

    api_key = settings.OPENWEATHER_API_KEY
    if not api_key:
        raise WeatherServiceError(
            "Weather API key is not configured.", 500
        )

    params = {
        "q": city.strip(),
        "appid": api_key,
        "units": "metric",
    }

    try:
        response = requests.get(
            settings.OPENWEATHER_API_URL,
            params=params,
            timeout=10,
        )
    except requests.RequestException as exc:
        logger.error("OpenWeather request failed: %s", exc)
        raise WeatherServiceError(
            "Unable to reach weather service.", 503
        ) from exc

    if response.status_code == 404:
        raise WeatherServiceError(
            f"City '{city}' not found.", 404
        )

    if response.status_code == 401:
        logger.error("OpenWeather API key is invalid.")
        raise WeatherServiceError(
            "Weather service authentication failed.", 500
        )

    if response.status_code != 200:
        logger.error(
            "OpenWeather API error: status=%s body=%s",
            response.status_code,
            response.text,
        )
        raise WeatherServiceError(
            "Weather service returned an error.", 502
        )

    data = response.json()

    return {
        "city": data.get("name", city),
        "temperature": round(data["main"]["temp"]),
        "feels_like": round(data["main"]["feels_like"]),
        "condition": data["weather"][0]["main"],
        "description": data["weather"][0]["description"],
        "icon": data["weather"][0]["icon"],
        "humidity": data["main"]["humidity"],
        "wind_speed": round(data["wind"]["speed"], 1),
    }
