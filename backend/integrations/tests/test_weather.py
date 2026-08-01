from unittest.mock import patch, MagicMock

from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class WeatherAPITests(APITestCase):
    """Tests for the /api/weather/ endpoint."""

    def _mock_response(self, json_data, status_code=200):
        mock = MagicMock()
        mock.status_code = status_code
        mock.json.return_value = json_data
        return mock

    def _mock_current(self):
        return self._mock_response({
            "name": "London",
            "sys": {"country": "GB", "sunrise": 1777437375, "sunset": 1777490344},
            "coord": {"lat": 51.5085, "lon": -0.1257},
            "timezone": 0,
            "main": {"temp": 15.2, "feels_like": 14.0, "humidity": 58, "pressure": 1024},
            "wind": {"speed": 3.5, "deg": 70},
            "clouds": {"all": 0},
            "visibility": 10000,
            "weather": [{"id": 800, "main": "Clear", "description": "sky is clear", "icon": "01d"}],
        })

    def _mock_forecast(self):
        return self._mock_response({
            "list": [
                {
                    "dt": 1777460400,
                    "dt_txt": "2026-04-29 12:00:00",
                    "main": {"temp": 17.0},
                    "weather": [{"main": "Clear", "description": "sky is clear", "icon": "01d"}],
                },
                {
                    "dt": 1777471200,
                    "dt_txt": "2026-04-29 15:00:00",
                    "main": {"temp": 16.0},
                    "weather": [{"main": "Clear", "description": "sky is clear", "icon": "01d"}],
                },
                {
                    "dt": 1777546800,
                    "dt_txt": "2026-04-30 12:00:00",
                    "main": {"temp": 15.0},
                    "weather": [{"main": "Rain", "description": "light rain", "icon": "10d"}],
                },
                {
                    "dt": 1777557600,
                    "dt_txt": "2026-04-30 15:00:00",
                    "main": {"temp": 13.0},
                    "weather": [{"main": "Rain", "description": "light rain", "icon": "10d"}],
                },
            ],
        })

    @override_settings(OPENWEATHER_API_KEY="test-key")
    @patch("integrations.services.requests.get")
    def test_get_weather_success(self, mock_get):
        mock_get.side_effect = [self._mock_current(), self._mock_forecast()]
        url = reverse("weather")
        response = self.client.get(url, {"city": "London"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["city"], "London")
        self.assertEqual(response.data["country"], "GB")
        self.assertEqual(response.data["current"]["temperature"], 15)
        self.assertEqual(response.data["current"]["condition"], "Clear")
        self.assertEqual(response.data["current"]["icon"], "01d")
        self.assertEqual(len(response.data["forecast"]), 2)
        self.assertEqual(response.data["forecast"][0]["temp_max"], 17)
        self.assertEqual(response.data["forecast"][0]["temp_min"], 16)
        self.assertEqual(response.data["forecast"][1]["condition"], "Rain")

    def test_get_weather_missing_city(self):
        url = reverse("weather")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @override_settings(OPENWEATHER_API_KEY="test-key")
    @patch("integrations.services.requests.get")
    def test_get_weather_city_not_found(self, mock_get):
        mock_get.return_value = self._mock_response(
            {"cod": "404", "message": "city not found"}, status_code=404
        )
        url = reverse("weather")
        response = self.client.get(url, {"city": "NonexistentCity"})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("not found", response.data["detail"].lower())

    @override_settings(OPENWEATHER_API_KEY="")
    def test_get_weather_no_api_key(self):
        url = reverse("weather")
        response = self.client.get(url, {"city": "London"})
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    @override_settings(OPENWEATHER_API_KEY="test-key")
    @patch("integrations.services.requests.get")
    def test_get_weather_auth_failure(self, mock_get):
        mock_get.return_value = self._mock_response(
            {"cod": 401, "message": "Invalid API key"}, status_code=401
        )
        url = reverse("weather")
        response = self.client.get(url, {"city": "London"})
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
