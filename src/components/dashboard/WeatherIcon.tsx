import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudRainWind,
  CloudSnow,
  CloudLightning,
  type LucideProps,
} from "lucide-react";

const ICONS: Record<string, typeof Sun> = {
  sun: Sun,
  "cloud-sun": CloudSun,
  cloud: Cloud,
  "cloud-fog": CloudFog,
  "cloud-drizzle": CloudDrizzle,
  "cloud-rain": CloudRain,
  "cloud-rain-wind": CloudRainWind,
  "cloud-snow": CloudSnow,
  "cloud-lightning": CloudLightning,
  clouds: Cloud,
  clear: Sun,
  rain: CloudRain,
  drizzle: CloudDrizzle,
  thunderstorm: CloudLightning,
  snow: CloudSnow,
  mist: CloudFog,
  fog: CloudFog,
};

export function WeatherIcon({ icon, ...props }: { icon: string } & LucideProps) {
  const Icon = ICONS[icon] ?? Cloud;
  return <Icon {...props} />;
}
