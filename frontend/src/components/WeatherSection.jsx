import { useState } from "react";
import {
  Search,
  Loader2,
  Cloud,
  CloudRain,
  Sun,
  Snowflake,
  CloudDrizzle,
  Wind,
  CloudSun,
  Droplets,
  Gauge,
  Eye,
  Sunrise,
  Sunset,
  MapPin,
  X,
  Cloudy,
} from "lucide-react";
import { fetchWeather } from "../api/weather.js";

const ICON_MAP = {
  "01d": Sun, "01n": Sun,
  "02d": CloudSun, "02n": CloudSun,
  "03d": Cloud, "03n": Cloud,
  "04d": Cloudy, "04n": Cloudy,
  "09d": CloudDrizzle, "09n": CloudDrizzle,
  "10d": CloudRain, "10n": CloudRain,
  "11d": CloudRain, "11n": CloudRain,
  "13d": Snowflake, "13n": Snowflake,
  "50d": Wind, "50n": Wind,
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatTime(unix) {
  if (!unix) return "--";
  return new Date(unix * 1000).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function WeatherSection() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city.trim()) return;
    setLoading(true);
    setError(null);
    setWeather(null);
    try {
      const data = await fetchWeather(city);
      setWeather(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setWeather(null);
    setError(null);
    setCity("");
  };

  const CurrentIcon = weather ? ICON_MAP[weather.current.icon] || Cloud : CloudSun;

  return (
    <div
      className="overflow-hidden rounded-2xl border"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderColor: "var(--border-color)",
        boxShadow: "var(--shadow)",
      }}
    >
      {/* Gradient header with search */}
      <div
        className="relative px-4 pb-4 pt-5 sm:px-5"
        style={{ background: "var(--gradient-accent)" }}
      >
        <div className="mb-3 flex items-center gap-2">
          <CloudSun className="h-5 w-5 text-white" strokeWidth={2.5} />
          <h3 className="text-sm font-bold tracking-wide text-white">WEATHER</h3>
        </div>
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70"
            />
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Search any city..."
              className="w-full rounded-xl border border-white/20 bg-white/15 py-2.5 pl-9 pr-3 text-sm text-white outline-none backdrop-blur-sm placeholder:text-white/60 focus:border-white/40"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !city.trim()}
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-white/20 px-3.5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/30 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" strokeWidth={2.5} />}
          </button>
          {(weather || error) && (
            <button
              onClick={handleClear}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
              aria-label="Clear"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-8 text-center sm:px-5">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: "rgba(239,68,68,0.1)" }}>
            <X className="h-5 w-5" style={{ color: "#ef4444" }} />
          </div>
          <p className="text-sm" style={{ color: "#ef4444" }}>{error}</p>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !weather && (
        <div className="px-4 py-6 sm:px-5">
          <div className="flex flex-col items-center gap-3">
            <div className="h-20 w-20 animate-pulse rounded-full" style={{ backgroundColor: "var(--bg-tertiary)" }} />
            <div className="h-7 w-24 animate-pulse rounded" style={{ backgroundColor: "var(--bg-tertiary)" }} />
            <div className="h-4 w-32 animate-pulse rounded" style={{ backgroundColor: "var(--bg-tertiary)" }} />
          </div>
        </div>
      )}

      {/* Empty state */}
      {!weather && !loading && !error && (
        <div className="px-4 py-8 text-center sm:px-5">
          <div
            className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ background: "var(--accent-light)" }}
          >
            <CloudSun className="h-7 w-7" style={{ color: "var(--accent)" }} strokeWidth={2} />
          </div>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Check the weather
          </p>
          <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
            Search any city to see current conditions and a 5-day forecast
          </p>
        </div>
      )}

      {/* Weather results */}
      {weather && !loading && (
        <div className="px-4 py-4 sm:px-5 sm:py-5">
          {/* Hero current weather */}
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--text-muted)" }} />
              <h4 className="truncate text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                {weather.city}{weather.country ? `, ${weather.country}` : ""}
              </h4>
            </div>
            <div
              className="my-3 flex h-20 w-20 items-center justify-center rounded-full"
              style={{ background: "var(--accent-light)" }}
            >
              <CurrentIcon className="h-10 w-10" style={{ color: "var(--accent)" }} strokeWidth={1.8} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold tracking-tighter" style={{ color: "var(--text-primary)" }}>
                {weather.current.temperature}
              </span>
              <span className="text-xl font-bold" style={{ color: "var(--text-secondary)" }}>°C</span>
            </div>
            <p className="mt-1 text-sm font-medium capitalize" style={{ color: "var(--text-secondary)" }}>
              {weather.current.description}
            </p>
            <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
              Feels like {weather.current.feels_like}°C
            </p>
          </div>

          {/* Detail grid */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <DetailCard icon={Droplets} label="Humidity" value={`${weather.current.humidity}%`} color="#0d9488" />
            <DetailCard icon={Wind} label="Wind" value={`${weather.current.wind_speed} m/s`} color="#0284c7" />
            <DetailCard icon={Gauge} label="Pressure" value={`${weather.current.pressure} hPa`} color="#7c3aed" />
            <DetailCard icon={Eye} label="Visibility" value={`${(weather.current.visibility / 1000).toFixed(1)} km`} color="#0891b2" />
          </div>

          {/* Sun times */}
          <div
            className="mt-3 flex items-center justify-around rounded-xl border py-2.5"
            style={{
              backgroundColor: "var(--bg-tertiary)",
              borderColor: "var(--border-color)",
            }}
          >
            <div className="flex items-center gap-2">
              <Sunrise className="h-4 w-4" style={{ color: "#f59e0b" }} />
              <div>
                <p className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>Sunrise</p>
                <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{formatTime(weather.current.sunrise)}</p>
              </div>
            </div>
            <div className="h-6 w-px" style={{ backgroundColor: "var(--border-color)" }} />
            <div className="flex items-center gap-2">
              <Sunset className="h-4 w-4" style={{ color: "#ef4444" }} />
              <div>
                <p className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>Sunset</p>
                <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{formatTime(weather.current.sunset)}</p>
              </div>
            </div>
          </div>

          {/* 5-day forecast */}
          {weather.forecast.length > 0 && (
            <div className="mt-4">
              <h5 className="mb-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                5-Day Forecast
              </h5>
              <div className="flex justify-between gap-1">
                {weather.forecast.map((day, i) => {
                  const DayIcon = ICON_MAP[day.icon] || Cloud;
                  const date = new Date(day.date * 1000);
                  return (
                    <div
                      key={i}
                      className="flex flex-1 flex-col items-center gap-1.5 rounded-xl border py-2.5"
                      style={{
                        backgroundColor: "var(--bg-tertiary)",
                        borderColor: "var(--border-color)",
                      }}
                    >
                      <span className="text-[10px] font-bold" style={{ color: "var(--text-muted)" }}>
                        {i === 0 ? "Today" : DAY_NAMES[date.getDay()]}
                      </span>
                      <DayIcon className="h-5 w-5" style={{ color: "var(--accent)" }} strokeWidth={2} />
                      <span className="text-xs font-extrabold" style={{ color: "var(--text-primary)" }}>
                        {day.temp_max}°
                      </span>
                      <span className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>
                        {day.temp_min}°
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DetailCard({ icon: Icon, label, value, color }) {
  return (
    <div
      className="flex items-center gap-2.5 rounded-xl border px-3 py-2.5"
      style={{
        backgroundColor: "var(--bg-tertiary)",
        borderColor: "var(--border-color)",
      }}
    >
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="h-4 w-4" style={{ color }} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>{label}</p>
        <p className="truncate text-xs font-bold" style={{ color: "var(--text-primary)" }}>{value}</p>
      </div>
    </div>
  );
}
