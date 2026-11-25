import { useEffect, useState } from "react";
import type { Destination } from "../data/destinations";
import type { WeatherData } from "../lib/weather";

export function useWeather(destination: Destination) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const [latitude, longitude] = destination.position;

  useEffect(() => {
    const controller = new AbortController();

    async function fetchWeather() {
      setWeather(null);
      setHasError(false);
      setLoading(true);

      try {
        const url =
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}` +
          `&longitude=${longitude}` +
          "&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m" +
          "&timezone=auto";

        const response = await fetch(url, { signal: controller.signal });

        if (!response.ok) throw new Error("Weather request failed.");

        const data = await response.json();

        if (!data.current) throw new Error("Weather data unavailable.");

        setWeather({
          temperature: data.current.temperature_2m,
          humidity: data.current.relative_humidity_2m,
          windSpeed: data.current.wind_speed_10m,
          weatherCode: data.current.weather_code,
        });
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;

        setHasError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchWeather();

    return () => controller.abort();
  }, [latitude, longitude, retryCount]);

  return {
    weather,
    loading,
    hasError,
    retry: () => setRetryCount((count) => count + 1),
  };
}