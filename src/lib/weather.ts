export interface WeatherData {
  temperature: number;
  feelsLike: number;
  wind: number;
  rainProbability: number;
  humidity: number;
  uvIndex: number;
  sunrise: string;
  sunset: string;
  condition: string;
  icon: string;
  hourly: { time: string; temperature: number; rainProbability: number }[];
  provider: "openweathermap" | "open-meteo";
}

const WMO_CONDITIONS: Record<number, { label: string; icon: string }> = {
  0: { label: "Clear sky", icon: "sun" },
  1: { label: "Mostly clear", icon: "sun" },
  2: { label: "Partly cloudy", icon: "cloud-sun" },
  3: { label: "Overcast", icon: "cloud" },
  45: { label: "Fog", icon: "cloud-fog" },
  48: { label: "Icy fog", icon: "cloud-fog" },
  51: { label: "Light drizzle", icon: "cloud-drizzle" },
  53: { label: "Drizzle", icon: "cloud-drizzle" },
  55: { label: "Heavy drizzle", icon: "cloud-drizzle" },
  61: { label: "Light rain", icon: "cloud-rain" },
  63: { label: "Rain", icon: "cloud-rain" },
  65: { label: "Heavy rain", icon: "cloud-rain-wind" },
  71: { label: "Light snow", icon: "cloud-snow" },
  73: { label: "Snow", icon: "cloud-snow" },
  75: { label: "Heavy snow", icon: "cloud-snow" },
  80: { label: "Rain showers", icon: "cloud-rain" },
  81: { label: "Rain showers", icon: "cloud-rain" },
  82: { label: "Violent showers", icon: "cloud-rain-wind" },
  95: { label: "Thunderstorm", icon: "cloud-lightning" },
  96: { label: "Thunderstorm + hail", icon: "cloud-lightning" },
  99: { label: "Thunderstorm + hail", icon: "cloud-lightning" },
};

/**
 * Fetches today's forecast. Uses OpenWeatherMap when OPENWEATHER_API_KEY is
 * configured (richer data), otherwise falls back to Open-Meteo, which needs
 * no API key at all — this keeps local dev and demos working out of the box.
 */
export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (apiKey) {
    try {
      return await fetchFromOpenWeatherMap(lat, lon, apiKey);
    } catch {
      // fall through to Open-Meteo
    }
  }
  return fetchFromOpenMeteo(lat, lon);
}

async function fetchFromOpenWeatherMap(lat: number, lon: number, apiKey: string): Promise<WeatherData> {
  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=minutely,alerts&appid=${apiKey}`;
  const res = await fetch(url, { next: { revalidate: 1800 } });
  if (!res.ok) throw new Error(`OpenWeatherMap error ${res.status}`);
  const data = await res.json();
  const current = data.current;
  const today = data.daily?.[0];

  return {
    temperature: Math.round(current.temp),
    feelsLike: Math.round(current.feels_like),
    wind: Math.round(current.wind_speed * 3.6),
    rainProbability: Math.round((today?.pop ?? 0) * 100),
    humidity: current.humidity,
    uvIndex: Math.round(current.uvi),
    sunrise: new Date(current.sunrise * 1000).toISOString(),
    sunset: new Date(current.sunset * 1000).toISOString(),
    condition: current.weather?.[0]?.description ?? "Unknown",
    icon: current.weather?.[0]?.main?.toLowerCase() ?? "cloud",
    hourly: (data.hourly ?? []).slice(0, 12).map((h: { dt: number; temp: number; pop: number }) => ({
      time: new Date(h.dt * 1000).toISOString(),
      temperature: Math.round(h.temp),
      rainProbability: Math.round(h.pop * 100),
    })),
    provider: "openweathermap",
  };
}

async function fetchFromOpenMeteo(lat: number, lon: number): Promise<WeatherData> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code` +
    `&hourly=temperature_2m,precipitation_probability,weather_code` +
    `&daily=uv_index_max,sunrise,sunset,precipitation_probability_max` +
    `&timezone=auto&forecast_days=1`;
  const res = await fetch(url, { next: { revalidate: 1800 } });
  if (!res.ok) throw new Error(`Open-Meteo error ${res.status}`);
  const data = await res.json();
  const code = data.current.weather_code as number;
  const meta = WMO_CONDITIONS[code] ?? { label: "Unknown", icon: "cloud" };

  const nowIndex = data.hourly.time.findIndex((t: string) => t === data.current.time?.slice(0, 13) + ":00");
  const startIndex = Math.max(nowIndex, 0);

  return {
    temperature: Math.round(data.current.temperature_2m),
    feelsLike: Math.round(data.current.apparent_temperature),
    wind: Math.round(data.current.wind_speed_10m),
    rainProbability: data.daily.precipitation_probability_max?.[0] ?? 0,
    humidity: data.current.relative_humidity_2m,
    uvIndex: Math.round(data.daily.uv_index_max?.[0] ?? 0),
    sunrise: data.daily.sunrise?.[0],
    sunset: data.daily.sunset?.[0],
    condition: meta.label,
    icon: meta.icon,
    hourly: data.hourly.time.slice(startIndex, startIndex + 12).map((t: string, i: number) => ({
      time: t,
      temperature: Math.round(data.hourly.temperature_2m[startIndex + i]),
      rainProbability: data.hourly.precipitation_probability[startIndex + i] ?? 0,
    })),
    provider: "open-meteo",
  };
}

export async function geocodeLocation(query: string) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Geocoding failed");
  const data = await res.json();
  const result = data.results?.[0];
  if (!result) return null;
  return {
    name: [result.name, result.admin1, result.country].filter(Boolean).join(", "),
    latitude: result.latitude as number,
    longitude: result.longitude as number,
    timezone: result.timezone as string,
  };
}
