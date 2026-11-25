export type WeatherData = {
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
};

// Kunci ini dipetakan ke teks di i18n/translations.ts (weather.codes).
export type WeatherCondition =
  | "clear"
  | "mostlyClear"
  | "partlyCloudy"
  | "overcast"
  | "fog"
  | "drizzle"
  | "freezingDrizzle"
  | "rain"
  | "freezingRain"
  | "snow"
  | "showers"
  | "snowShowers"
  | "thunderstorm"
  | "thunderstormHail"
  | "unknown";

export function getWeatherCondition(code: number): WeatherCondition {
  if (code === 0) return "clear";
  if (code === 1) return "mostlyClear";
  if (code === 2) return "partlyCloudy";
  if (code === 3) return "overcast";
  if (code === 45 || code === 48) return "fog";
  if ([51, 53, 55].includes(code)) return "drizzle";
  if ([56, 57].includes(code)) return "freezingDrizzle";
  if ([61, 63, 65].includes(code)) return "rain";
  if ([66, 67].includes(code)) return "freezingRain";
  if ([71, 73, 75, 77].includes(code)) return "snow";
  if ([80, 81, 82].includes(code)) return "showers";
  if ([85, 86].includes(code)) return "snowShowers";
  if (code === 95) return "thunderstorm";
  if ([96, 99].includes(code)) return "thunderstormHail";

  return "unknown";
}

export function getWeatherIcon(code: number) {
  if (code === 0) return "☀️";
  if ([1, 2].includes(code)) return "🌤️";
  if ([3, 45, 48].includes(code)) return "☁️";
  if ([51, 53, 55, 56, 57].includes(code)) return "🌦️";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "🌧️";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️";
  if ([95, 96, 99].includes(code)) return "⛈️";

  return "🌡️";
}