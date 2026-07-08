import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { WeatherIcon } from "./WeatherIcon";
import { Wind, Droplets, Sun as SunIcon, Sunrise, Sunset } from "lucide-react";
import type { WeatherData } from "@/lib/weather";

export function WeatherCard({ weather, locationName }: { weather: WeatherData | null; locationName: string | null }) {
  if (!weather) {
    return (
      <Card className="animate-fade-in-up">
        <CardHeader>
          <CardTitle>Weather</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--muted)]">Add your location in Settings to see today’s forecast.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <CardTitle>Weather{locationName ? ` · ${locationName}` : ""}</CardTitle>
        <WeatherIcon icon={weather.icon} className="size-5 text-[var(--accent)]" />
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2">
          <span className="text-4xl font-semibold tracking-tight">{weather.temperature}°</span>
          <span className="mb-1 text-sm text-[var(--muted)]">feels {weather.feelsLike}°</span>
        </div>
        <p className="mt-1 text-sm capitalize text-[var(--muted)]">{weather.condition}</p>

        <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-[var(--muted)]">
          <div className="flex items-center gap-1.5">
            <Droplets className="size-3.5" /> {weather.rainProbability}% rain
          </div>
          <div className="flex items-center gap-1.5">
            <Wind className="size-3.5" /> {weather.wind} km/h
          </div>
          <div className="flex items-center gap-1.5">
            <SunIcon className="size-3.5" /> UV {weather.uvIndex}
          </div>
          <div className="flex items-center gap-1.5">
            <Droplets className="size-3.5" /> {weather.humidity}% humidity
          </div>
          <div className="flex items-center gap-1.5">
            <Sunrise className="size-3.5" />{" "}
            {new Date(weather.sunrise).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
          </div>
          <div className="flex items-center gap-1.5">
            <Sunset className="size-3.5" />{" "}
            {new Date(weather.sunset).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
