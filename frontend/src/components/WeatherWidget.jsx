import { useEffect, useState } from "react";
import { Cloud, CloudRain, Sun, Snowflake, CloudDrizzle, Wind, Loader2, CloudSun } from "lucide-react";
import { fetchWeather } from "../api/weather.js";

const ICON_MAP = {
  "01d": Sun, "01n": Sun,
  "02d": CloudSun, "02n": CloudSun,
  "03d": Cloud, "03n": Cloud,
  "04d": Cloud, "04n": Cloud,
  "09d": CloudDrizzle, "09n": CloudDrizzle,
  "10d": CloudRain, "10n": CloudRain,
  "11d": CloudRain, "11n": CloudRain,
  "13d": Snowflake, "13n": Snowflake,
  "50d": Wind, "50n": Wind,
};

export default function WeatherWidget({ city }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!city) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchWeather(city)
      .then((data) => { if (!cancelled) { setWeather(data); setLoading(false); } })
      .catch((err) => { if (!cancelled) { setError(err.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, [city]);

  if (loading) {
    return (
      <span className="inline-flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
        <Loader2 className="h-3 w-3 animate-spin" />
      </span>
    );
  }

  if (error || !weather) return null;

  const Icon = ICON_MAP[weather.icon] || Cloud;

  return (
    <span className="inline-flex items-center gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
      <Icon className="h-3 w-3" style={{ color: "var(--accent)" }} />
      <span className="font-semibold">{weather.temperature}°</span>
      <span style={{ color: "var(--text-muted)" }}>{weather.description}</span>
    </span>
  );
}
