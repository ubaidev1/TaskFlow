from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .services import WeatherServiceError, get_current_weather


@api_view(["GET"])
def weather(request):
    """GET /api/weather/?city=<city_name> — current weather for a city."""
    city = request.query_params.get("city", "").strip()

    if not city:
        return Response(
            {"detail": "The 'city' query parameter is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        weather_data = get_current_weather(city)
        return Response(weather_data)
    except WeatherServiceError as exc:
        return Response(
            {"detail": exc.message},
            status=exc.status_code,
        )
