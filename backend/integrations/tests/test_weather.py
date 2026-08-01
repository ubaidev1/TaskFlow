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

    @override_settings(OPENWEATHER_API_KEY="test-key")
    @patch("integrations.services.requests.get")
    def test_get_weather_success(self, mock_get):
        mock_get.return_value = self._mock_response({
            "name": "London",
            "main": {"temp": 15.2, "feels_like": 14.0, "humidity": 72},
            "weather": [{"main": "Clouds", "description": "scattered clouds", "icon": "03d"}],
            "wind": {"speed": 3.5},
        })
        url = reverse("weather")
        response = self.client.get(url, {"city": "London"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["city"], "London")
        self.assertEqual(response.data["temperature"], 15)
        self.assertEqual(response.data["condition"], "Clouds")
        self.assertEqual(response.data["icon"], "03d")

    def test_get_weather_missing_city(self):
        url = reverse("weather")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @override_settings(OPENWEATHER_API_KEY="test-key")
    @patch("integrations.services.requests.get")
    def test_get_weather_city_not_found(self, mock_get):
        mock_get.return_value = self._mock_response(
            {"message": "city not found"}, status_code=404
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
