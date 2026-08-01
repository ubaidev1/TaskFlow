const API_BASE = "/api";

export async function fetchWeather(city) {
  const response = await fetch(
    `${API_BASE}/weather/?city=${encodeURIComponent(city)}`
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.detail || "Weather lookup failed");
  }

  return data;
}
