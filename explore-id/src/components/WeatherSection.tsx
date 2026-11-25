import type { Destination } from "../data/destinations";
import { useLanguage } from "../hooks/useLanguage";
import { useWeather } from "../hooks/useWeather";
import { getWeatherCondition, getWeatherIcon } from "../lib/weather";

export default function WeatherSection({
  destination,
}: {
  destination: Destination;
}) {
  const { t } = useLanguage();
  const { weather, loading, hasError, retry } = useWeather(destination);

  return (
    <section className="weather-section">
      <div className="weather-heading">
        <div>
          <span className="eyebrow">{t.weather.eyebrow}</span>
          <h2>{t.weather.title}</h2>
          <p>{t.weather.desc(destination.name)}</p>
        </div>

        <span className="weather-location">⌖ {destination.location}</span>
      </div>

      {loading && (
        <div className="weather-message">
          <div className="weather-loader"></div>
          <p>{t.weather.loading}</p>
        </div>
      )}

      {hasError && !loading && (
        <div className="weather-message weather-error">
          <p>{t.weather.error}</p>
          <button className="weather-retry" onClick={retry}>
            {t.weather.retry}
          </button>
        </div>
      )}

      {weather && !loading && (
        <div className="weather-card">
          <div className="weather-main">
            <span className="weather-icon">
              {getWeatherIcon(weather.weatherCode)}
            </span>

            <div>
              <strong className="weather-temperature">
                {Math.round(weather.temperature)}°C
              </strong>
              <p>{t.weather.codes[getWeatherCondition(weather.weatherCode)]}</p>
            </div>
          </div>

          <div className="weather-details">
            <div className="weather-detail-item">
              <span>💧</span>
              <div>
                <small>{t.weather.humidity}</small>
                <strong>{weather.humidity}%</strong>
              </div>
            </div>

            <div className="weather-detail-item">
              <span>💨</span>
              <div>
                <small>{t.weather.windSpeed}</small>
                <strong>{weather.windSpeed} km/h</strong>
              </div>
            </div>

            <div className="weather-detail-item">
              <span>🌡️</span>
              <div>
                <small>{t.weather.temperature}</small>
                <strong>{weather.temperature}°C</strong>
              </div>
            </div>
          </div>

          <p className="weather-source">{t.weather.source}</p>
        </div>
      )}
    </section>
  );
}
