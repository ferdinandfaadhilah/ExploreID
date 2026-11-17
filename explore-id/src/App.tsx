
import "./App.css";
import { useEffect, useState } from "react";
import AuthPage from "./AuthPage";
import { useAuth } from "./context/AuthContext";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import { divIcon } from "leaflet";
import "leaflet/dist/leaflet.css";

import { destinations, type Destination } from "./data/destinations";

type Page =
  | "home"
  | "detail"
  | "favorites"
  | "profile"
  | "map"
  | "for-you"
  | "recently-viewed"
  | "login"
  | "register";

type WeatherData = {
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
};

const categories = [
  "All",
  "Nature",
  "Culture",
  "Culinary",
  "Entertainment",
  "Adventure",
];

const destinationIcon = divIcon({
  className: "explore-map-marker",
  html: '<div style="background:#23966c;width:18px;height:18px;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px #0005"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

// Mengubah kode cuaca WMO menjadi deskripsi
function getWeatherDescription(code: number) {
  if (code === 0) return "Cerah";
  if (code === 1) return "Cerah berawan";
  if (code === 2) return "Berawan sebagian";
  if (code === 3) return "Mendung";
  if (code === 45 || code === 48) return "Berkabut";
  if ([51, 53, 55].includes(code)) return "Gerimis";
  if ([56, 57].includes(code)) return "Gerimis membeku";
  if ([61, 63, 65].includes(code)) return "Hujan";
  if ([66, 67].includes(code)) return "Hujan membeku";
  if ([71, 73, 75, 77].includes(code)) return "Salju";
  if ([80, 81, 82].includes(code)) return "Hujan deras";
  if ([85, 86].includes(code)) return "Hujan salju";
  if (code === 95) return "Badai petir";
  if ([96, 99].includes(code)) return "Badai petir dan hujan es";
  return "Kondisi tidak diketahui";
}

function getWeatherIcon(code: number) {
  if (code === 0) return "☀️";
  if ([1, 2].includes(code)) return "🌤️";
  if ([3, 45, 48].includes(code)) return "☁️";
  if ([51, 53, 55, 56, 57].includes(code)) return "🌦️";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code))
    return "🌧️";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️";
  if ([95, 96, 99].includes(code)) return "⛈️";
  return "🌡️";
}

function App() {
  const [page, setPage] = useState<Page>("home");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All");
  const [maxBudget, setMaxBudget] = useState("All");
  const [sortOrder, setSortOrder] = useState("default");
  const [selected, setSelected] = useState<Destination | null>(null);

  const { user, loading: authLoading, signOut } = useAuth();

  const accountName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Account";

  const accountInitials =
    accountName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part: string) => part[0]?.toUpperCase())
      .join("") || "ME";

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  // Favorites
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem("exploreid-favorites");
      return saved ? (JSON.parse(saved) as number[]) : [];
    } catch {
      return [];
    }
  });

  // Recently Viewed
  const [recentlyViewed, setRecentlyViewed] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem("exploreid-recently-viewed");
      return saved ? (JSON.parse(saved) as number[]) : [];
    } catch {
      return [];
    }
  });

  // Weather
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState("");
  const [weatherRetry, setWeatherRetry] = useState(0);

  // Simpan Favorites
  useEffect(() => {
    localStorage.setItem(
      "exploreid-favorites",
      JSON.stringify(favorites)
    );
  }, [favorites]);

  // Simpan Recently Viewed
  useEffect(() => {
    localStorage.setItem(
      "exploreid-recently-viewed",
      JSON.stringify(recentlyViewed)
    );
  }, [recentlyViewed]);

  // Ambil data cuaca ketika destinasi detail berubah
  useEffect(() => {
    if (page !== "detail" || !selected) return;

    const controller = new AbortController();

    async function fetchWeather() {
      setWeather(null);
      setWeatherError("");
      setWeatherLoading(true);

      try {
        const [latitude, longitude] = selected!.position;

        const url =
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}` +
          `&longitude=${longitude}` +
          "&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m" +
          "&timezone=auto";

        const response = await fetch(url, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil data cuaca.");
        }

        const data = await response.json();

        if (!data.current) {
          throw new Error("Data cuaca tidak tersedia.");
        }

        setWeather({
          temperature: data.current.temperature_2m,
          humidity: data.current.relative_humidity_2m,
          windSpeed: data.current.wind_speed_10m,
          weatherCode: data.current.weather_code,
        });
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        setWeatherError(
          "Data cuaca belum dapat dimuat. Silakan coba lagi."
        );
      } finally {
        if (!controller.signal.aborted) {
          setWeatherLoading(false);
        }
      }
    }

    fetchWeather();

    return () => controller.abort();
  }, [page, selected, weatherRetry]);

  // Filter dan sorting
  const filteredDestinations = destinations
    .filter((item) => {
      const matchesCategory =
        category === "All" || item.category === category;

      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.location.toLowerCase().includes(search.toLowerCase());

      const matchesLocation =
        location === "All" || item.location.includes(location);

      const matchesBudget =
        maxBudget === "All" || item.budget <= Number(maxBudget);

      return (
        matchesCategory &&
        matchesSearch &&
        matchesLocation &&
        matchesBudget
      );
    })
    .sort((a, b) => {
      switch (sortOrder) {
        case "price-low":
          return a.budget - b.budget;
        case "price-high":
          return b.budget - a.budget;
        case "name-az":
          return a.name.localeCompare(b.name, "id");
        case "name-za":
          return b.name.localeCompare(a.name, "id");
        default:
          return a.id - b.id;
      }
    });

  // Reset pagination saat filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, location, maxBudget, sortOrder]);

  const totalPages = Math.ceil(
    filteredDestinations.length / itemsPerPage
  );

  const startIndex = (currentPage - 1) * itemsPerPage;

  const currentDestinations = filteredDestinations.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const favoriteDestinations = destinations.filter((item) =>
    favorites.includes(item.id)
  );

  const recentlyViewedDestinations = recentlyViewed
    .map((id) => destinations.find((item) => item.id === id))
    .filter((item): item is Destination => item !== undefined);

  function navigate(nextPage: Page) {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleLogout() {
    const { error } = await signOut();

    if (error) {
      window.alert(`Gagal logout: ${error}`);
      return;
    }

    navigate("home");
  }

  function toggleFavorite(id: number) {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function openDetail(item: Destination) {
    setRecentlyViewed((current) =>
      [item.id, ...current.filter((id) => id !== item.id)].slice(0, 6)
    );

    setSelected(item);
    setWeather(null);
    setWeatherError("");
    navigate("detail");
  }

  // Destination Card
  function DestinationCard({ item }: { item: Destination }) {
    const saved = favorites.includes(item.id);

    return (
      <article className="destination-card">
        <div className="card-image">
          <img src={item.image} alt={item.name} />

          <button
            className={`heart-button ${saved ? "saved" : ""}`}
            onClick={() => toggleFavorite(item.id)}
            aria-label="Save favorite"
          >
            {saved ? "♥" : "♡"}
          </button>
        </div>

        <div className="card-content">
          <span className="tag">{item.category}</span>
          <h3>{item.name}</h3>
          <p className="location">⌖ {item.location}</p>
          <p className="card-description">{item.description}</p>

          <div className="card-bottom">
            <strong>{item.price}</strong>

            <button
              className="detail-link"
              onClick={() => openDetail(item)}
            >
              Details ↗
            </button>
          </div>
        </div>
      </article>
    );
  }

  if (authLoading) {
    return (
      <div className="auth-loading">
        Memeriksa sesi akun...
      </div>
    );
  }

  return (
    <div className="app">
      <header className="navbar">
        <button className="logo" onClick={() => navigate("home")}>
          Explore<span>ID.</span>
        </button>

        <nav className="nav-links">
          <button
            className={page === "home" ? "nav-active" : ""}
            onClick={() => navigate("home")}
          >
            Home
          </button>

          <button onClick={() => navigate("home")}>Explore</button>
          <button onClick={() => navigate("map")}>Map</button>
          <button onClick={() => navigate("for-you")}>For You</button>

          <button
            className={
              page === "recently-viewed" ? "nav-active" : ""
            }
            onClick={() => navigate("recently-viewed")}
          >
            Recent
          </button>
        </nav>

        <div className="nav-actions">
          <button
            className="favorite-nav"
            onClick={() => navigate("favorites")}
          >
            ♡ <span>{favorites.length}</span>
          </button>

          {user ? (
            <button
              className="profile-nav"
              onClick={() => navigate("profile")}
              title="Open profile"
            >
              {accountInitials}
            </button>
          ) : (
            <>
              <button
                className="auth-nav-button"
                onClick={() => navigate("login")}
              >
                Login
              </button>

              <button
                className="auth-nav-button auth-nav-primary"
                onClick={() => navigate("register")}
              >
                Register
              </button>
            </>
          )}
        </div>
      </header>

      <main>
        {(page === "login" || page === "register") && (
          <AuthPage
            mode={page}
            onNavigate={(nextPage) => navigate(nextPage)}
          />
        )}

        {page === "home" && (
          <>
            {/* HERO */}
            <section className="hero">
              <div className="hero-copy">
                <span className="eyebrow">DISCOVER INDONESIA</span>

                <h1>
                  Explore Indonesia,
                  <br />
                  <span>Beyond the Ordinary.</span>
                </h1>

                <p>
                  From breathtaking landscapes to hidden cultural
                  treasures, discover remarkable places and experiences
                  across Indonesia.
                </p>

                <button
                  className="primary-button"
                  onClick={() =>
                    document
                      .getElementById("explore")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Explore destinations <span>↗</span>
                </button>
              </div>

              <div className="hero-visual">
                <img
                  src="https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=1400"
                  alt="Beautiful travel landscape"
                />

                <div className="hero-caption">
                  <span>YOUR NEXT JOURNEY STARTS HERE</span>
                  <strong>Explore the extraordinary.</strong>
                </div>
              </div>
            </section>

            {/* EXPLORE DESTINATIONS */}
            <section className="explore-section" id="explore">
              <div className="section-top">
                <div>
                  <span className="eyebrow">FIND YOUR PLACE</span>
                  <h2>Explore destinations</h2>
                  <p>
                    Temukan tempat menarik untuk perjalanan berikutnya.
                  </p>
                </div>

                <span className="result-count">
                  {filteredDestinations.length} destinations
                </span>
              </div>

              <input
                className="search-input"
                type="search"
                placeholder="Search destinations or locations..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              <div className="category-list">
                {categories.map((item) => (
                  <button
                    key={item}
                    className={
                      category === item
                        ? "category-chip selected"
                        : "category-chip"
                    }
                    onClick={() => setCategory(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="filter-row">
                <select
                  className="filter-select"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                >
                  <option value="All">All Locations</option>
                  {[...new Set(destinations.map((item) => item.location))]
                    .sort((a, b) => a.localeCompare(b, "id"))
                    .map((place) => (
                      <option key={place} value={place}>
                        {place}
                      </option>
                    ))}
                </select>

                <select
                  className="filter-select"
                  value={maxBudget}
                  onChange={(event) => setMaxBudget(event.target.value)}
                >
                  <option value="All">Any Budget</option>
                  <option value="50000">Max Rp50.000</option>
                  <option value="100000">Max Rp100.000</option>
                  <option value="200000">Max Rp200.000</option>
                  <option value="500000">Max Rp500.000</option>
                </select>

                <select
                  className="filter-select"
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                >
                  <option value="default">Default Order</option>
                  <option value="price-low">Cheapest First</option>
                  <option value="price-high">Most Expensive First</option>
                  <option value="name-az">Name A–Z</option>
                  <option value="name-za">Name Z–A</option>
                </select>

                <button
                  className="reset-filter"
                  onClick={() => {
                    setCategory("All");
                    setSearch("");
                    setLocation("All");
                    setMaxBudget("All");
                    setSortOrder("default");
                  }}
                >
                  Reset Filters
                </button>
              </div>

              <div className="destination-grid">
                {filteredDestinations.length > 0 ? (
                  currentDestinations.map((item) => (
                    <DestinationCard key={item.id} item={item} />
                  ))
                ) : (
                  <div className="empty-state">
                    <h3>No destinations found</h3>
                    <p>Coba kata kunci atau kategori lainnya.</p>

                    <button
                      className="primary-button"
                      onClick={() => {
                        setSearch("");
                        setCategory("All");
                        setLocation("All");
                        setMaxBudget("All");
                        setSortOrder("default");
                      }}
                    >
                      Reset search
                    </button>
                  </div>
                )}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-button"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                  >
                    ← Previous
                  </button>

                  <div className="pagination-numbers">
                    {Array.from(
                      { length: totalPages },
                      (_, index) => index + 1
                    ).map((number) => (
                      <button
                        key={number}
                        className={
                          currentPage === number
                            ? "pagination-number active"
                            : "pagination-number"
                        }
                        onClick={() => setCurrentPage(number)}
                      >
                        {number}
                      </button>
                    ))}
                  </div>

                  <button
                    className="pagination-button"
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(totalPages, prev + 1)
                      )
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next →
                  </button>
                </div>
              )}
            </section>
          </>
        )}

        {/* DESTINATION DETAIL */}
        {page === "detail" && selected && (
          <section className="inner-page destination-detail-page">
            <button
              className="back-button"
              onClick={() => navigate("home")}
            >
              ← Back to Explore
            </button>

            <div className="detail-layout">
              <img
                className="detail-photo"
                src={selected.image}
                alt={selected.name}
              />

              <div className="detail-copy">
                <span className="eyebrow">{selected.category}</span>
                <h1>{selected.name}</h1>
                <p className="location">⌖ {selected.location}</p>
                <p>{selected.description}</p>

                <div className="price-panel">
                  <span>Estimated price</span>
                  <strong>{selected.price}</strong>
                  <small>
                    Estimasi biaya dapat berubah sesuai kebijakan
                    pengelola dan kebutuhan perjalanan.
                  </small>
                </div>

                <div className="detail-actions">
                  <button
                    className="primary-button"
                    onClick={() => toggleFavorite(selected.id)}
                  >
                    {favorites.includes(selected.id)
                      ? "♥ Remove from Favorites"
                      : "♡ Add to Favorites"}
                  </button>

                  <a
                    className="detail-map-link"
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${selected.name}, ${selected.location}, Indonesia`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open Google Maps ↗
                  </a>
                </div>
              </div>
            </div>

            {/* DESTINATION INFORMATION */}
            <section className="destination-info-section">
              <div className="section-top">
                <div>
                  <span className="eyebrow">DESTINATION OVERVIEW</span>
                  <h2>Get to know this place</h2>
                  <p>
                    Informasi singkat untuk membantumu mengenal destinasi
                    sebelum merencanakan perjalanan.
                  </p>
                </div>
              </div>

              <div className="destination-info-grid">
                <article className="destination-info-card">
                  <span className="info-card-icon">⌖</span>
                  <div>
                    <small>Location</small>
                    <h3>{selected.location}</h3>
                    <p>Lokasi destinasi di Indonesia.</p>
                  </div>
                </article>

                <article className="destination-info-card">
                  <span className="info-card-icon">✦</span>
                  <div>
                    <small>Category</small>
                    <h3>{selected.category}</h3>
                    <p>Kategori pengalaman destinasi ini.</p>
                  </div>
                </article>

                <article className="destination-info-card">
                  <span className="info-card-icon">◷</span>
                  <div>
                    <small>Estimated Budget</small>
                    <h3>{selected.price}</h3>
                    <p>Perkiraan biaya berdasarkan data ExploreID.</p>
                  </div>
                </article>
              </div>
            </section>

            {/* BEFORE YOU VISIT */}
            <section className="visit-guide-section">
              <div className="visit-guide-content">
                <div>
                  <span className="eyebrow">TRAVEL CHECKLIST</span>
                  <h2>Before you visit</h2>
                  <p>
                    Beberapa hal yang sebaiknya kamu perhatikan sebelum
                    berangkat ke {selected.name}.
                  </p>
                </div>

                <div className="visit-guide-list">
                  <div className="visit-guide-item">
                    <span>01</span>
                    <div>
                      <strong>Check the latest information</strong>
                      <p>
                        Cari tahu jam operasional, aturan kunjungan,
                        dan informasi terbaru dari pengelola destinasi.
                      </p>
                    </div>
                  </div>

                  <div className="visit-guide-item">
                    <span>02</span>
                    <div>
                      <strong>Prepare your travel budget</strong>
                      <p>
                        Sesuaikan anggaran dengan biaya perjalanan,
                        tiket masuk, transportasi, dan kebutuhan lainnya.
                      </p>
                    </div>
                  </div>

                  <div className="visit-guide-item">
                    <span>03</span>
                    <div>
                      <strong>Check the weather</strong>
                      <p>
                        Perhatikan kondisi cuaca agar kamu bisa
                        mempersiapkan perjalanan dengan lebih baik.
                      </p>
                    </div>
                  </div>

                  <div className="visit-guide-item">
                    <span>04</span>
                    <div>
                      <strong>Respect the destination</strong>
                      <p>
                        Jaga kebersihan, ikuti aturan setempat,
                        dan hormati lingkungan serta budaya sekitar.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* WEATHER INFORMATION */}
            <section className="weather-section">
              <div className="weather-heading">
                <div>
                  <span className="eyebrow">LOCAL WEATHER</span>
                  <h2>Weather Information</h2>
                  <p>
                    Kondisi cuaca terkini di {selected.name}.
                  </p>
                </div>

                <span className="weather-location">
                  ⌖ {selected.location}
                </span>
              </div>

              {weatherLoading && (
                <div className="weather-message">
                  <div className="weather-loader"></div>
                  <p>Loading weather information...</p>
                </div>
              )}

              {weatherError && !weatherLoading && (
                <div className="weather-message weather-error">
                  <p>{weatherError}</p>
                  <button
                    className="weather-retry"
                    onClick={() => setWeatherRetry((prev) => prev + 1)}
                  >
                    Try again
                  </button>
                </div>
              )}

              {weather && !weatherLoading && (
                <div className="weather-card">
                  <div className="weather-main">
                    <span className="weather-icon">
                      {getWeatherIcon(weather.weatherCode)}
                    </span>

                    <div>
                      <strong className="weather-temperature">
                        {Math.round(weather.temperature)}°C
                      </strong>
                      <p>
                        {getWeatherDescription(weather.weatherCode)}
                      </p>
                    </div>
                  </div>

                  <div className="weather-details">
                    <div className="weather-detail-item">
                      <span>💧</span>
                      <div>
                        <small>Humidity</small>
                        <strong>{weather.humidity}%</strong>
                      </div>
                    </div>

                    <div className="weather-detail-item">
                      <span>💨</span>
                      <div>
                        <small>Wind Speed</small>
                        <strong>{weather.windSpeed} km/h</strong>
                      </div>
                    </div>

                    <div className="weather-detail-item">
                      <span>🌡️</span>
                      <div>
                        <small>Temperature</small>
                        <strong>{weather.temperature}°C</strong>
                      </div>
                    </div>
                  </div>

                  <p className="weather-source">
                    Weather data provided by Open-Meteo
                  </p>
                </div>
              )}
            </section>
          </section>
        )}

        {/* FAVORITES */}
        {page === "favorites" && (
          <section className="inner-page">
            <span className="eyebrow">YOUR COLLECTION</span>
            <h1 className="page-title">My Favorites</h1>
            <p className="page-subtitle">
              Destinasi yang kamu simpan.
            </p>

            <div className="destination-grid">
              {favoriteDestinations.length > 0 ? (
                favoriteDestinations.map((item) => (
                  <DestinationCard key={item.id} item={item} />
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-heart">♡</div>
                  <h3>Your list is waiting</h3>
                  <p>
                    Tekan ikon hati pada destinasi untuk menyimpannya.
                  </p>

                  <button
                    className="primary-button"
                    onClick={() => navigate("home")}
                  >
                    Explore destinations
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* RECENTLY VIEWED */}
        {page === "recently-viewed" && (
          <section className="inner-page">
            <span className="eyebrow">YOUR ACTIVITY</span>
            <h1 className="page-title">Recently Viewed</h1>
            <p className="page-subtitle">
              Destinasi yang terakhir kamu lihat.
            </p>

            {recentlyViewedDestinations.length > 0 ? (
              <>
                <div className="destination-grid">
                  {recentlyViewedDestinations.map((item) => (
                    <DestinationCard key={item.id} item={item} />
                  ))}
                </div>

                <button
                  className="clear-history"
                  onClick={() => setRecentlyViewed([])}
                >
                  Clear History
                </button>
              </>
            ) : (
              <div className="empty-state">
                <h3>No recent destinations yet</h3>
                <p>
                  Destinasi yang kamu buka akan muncul di sini.
                </p>

                <button
                  className="primary-button"
                  onClick={() => navigate("home")}
                >
                  Explore Destinations
                </button>
              </div>
            )}
          </section>
        )}

        {/* PROFILE */}
        {page === "profile" && (
          <section className="profile-page">
            <div className="profile-card">
              <div className="avatar">{accountInitials}</div>
              <span className="eyebrow">YOUR PROFILE</span>

              <h1>{user ? accountName : "Guest Account"}</h1>

              <p className="profile-role">
                {user ? user.email : "Login untuk melihat profil akun"}
              </p>

              {user ? (
                <div className="profile-info">
                  <div>
                    <span>Account Name</span>
                    <strong>{accountName}</strong>
                  </div>

                  <div>
                    <span>Email Address</span>
                    <strong>{user.email}</strong>
                  </div>

                  <div>
                    <span>Account Status</span>
                    <strong>Signed in</strong>
                  </div>
                </div>
              ) : (
                <p>
                  Masuk atau buat akun untuk menggunakan profil ExploreID.
                </p>
              )}

              <div className="profile-actions">
                <button
                  className="primary-button"
                  onClick={() => navigate("home")}
                >
                  Back to Explore
                </button>

                {user ? (
                  <button
                    className="auth-nav-button"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                ) : (
                  <button
                    className="auth-nav-button auth-nav-primary"
                    onClick={() => navigate("login")}
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {/* MAP */}
        {page === "map" && (
          <section className="inner-page">
            <span className="eyebrow">DISCOVER BY LOCATION</span>
            <h1 className="page-title">Explore the map</h1>
            <p className="page-subtitle">
              Temukan berbagai destinasi menarik di Indonesia.
              Klik marker untuk melihat detail tempat.
            </p>

            <MapContainer
              center={[-2.5, 118]}
              zoom={5}
              scrollWheelZoom={true}
              className="map-container"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {destinations.map((item) => (
                <Marker
                  key={item.id}
                  position={item.position}
                  icon={destinationIcon}
                >
                  <Popup>
                    <div className="map-popup">
                      <strong>{item.name}</strong>
                      <p>{item.location}</p>
                      <button onClick={() => openDetail(item)}>
                        View details ↗
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            <div className="destination-grid map-list">
              {destinations.map((item) => (
                <DestinationCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* FOR YOU */}
        {page === "for-you" && (
          <section className="inner-page">
            <span className="eyebrow">MADE FOR YOUR JOURNEY</span>
            <h1 className="page-title">Picked for you</h1>
            <p className="page-subtitle">
              Beberapa tempat untuk mulai merencanakan petualanganmu.
            </p>

            <div className="destination-grid">
              {destinations
                .filter(
                  (item) =>
                    item.category === "Nature" ||
                    item.category === "Adventure"
                )
                .map((item) => (
                  <DestinationCard key={item.id} item={item} />
                ))}
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <button
          className="footer-logo"
          onClick={() => navigate("home")}
        >
          ExploreID.
        </button>

        <p>Discover more, explore Indonesia.</p>
        <small>© 2026 ExploreID. Made for curious travelers.</small>
      </footer>
    </div>
  );
}

export default App;
