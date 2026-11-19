
import "./App.css";
import { useEffect, useMemo, useState } from "react";
import AuthPage from "./AuthPage";
import { useAuth } from "./context/AuthContext";
import { supabase } from "./lib/supabaseClient";
import { ticketInformation } from "./data/ticketInformation";
import ProfilePage from "./ProfilePage";
import {
  getUserPreferences,
  saveUserPreferences,
} from "./lib/userPreferences";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import { divIcon } from "leaflet";
import "leaflet/dist/leaflet.css";

import { destinations, type Destination } from "./data/destinations";
import {
  destinationGuides,
  defaultDestinationGuide,
} from "./data/destinationGuides";

type Page =
  | "home"
  | "detail"
  | "favorites"
  | "profile"
  | "map"
  | "for-you"
  | "recently-viewed"
  | "search"
  | "login"
  | "register";

type WeatherData = {
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
};

type Review = {
  id: string;
  user_id: string;
  destination_id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
};

const destinationIcon = divIcon({
  className: "explore-map-marker",
  html: '<div style="background:#23966c;width:18px;height:18px;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px #0005"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

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
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "🌧️";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️";
  if ([95, 96, 99].includes(code)) return "⛈️";

  return "🌡️";
}

function calculateDistance(
  first: [number, number],
  second: [number, number]
) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadius = 6371;

  const latitudeDifference = toRadians(second[0] - first[0]);
  const longitudeDifference = toRadians(second[1] - first[1]);

  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(toRadians(first[0])) *
      Math.cos(toRadians(second[0])) *
      Math.sin(longitudeDifference / 2) ** 2;

  return (
    earthRadius *
    2 *
    Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  );
}

function App() {
  const [page, setPage] = useState<Page>("home");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [location, setLocation] = useState("All");
  const [maxBudget, setMaxBudget] = useState("All");
  const [sortOrder, setSortOrder] = useState("default");
  const [selected, setSelected] = useState<Destination | null>(null);

  const { user, loading: authLoading, signOut } = useAuth();
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);
useEffect(() => {
  if (!user) {
    setProfileAvatar(null);
    return;
  }

  const userId = user.id;
  let active = true;

  async function loadAvatar() {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("avatar_url")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Gagal mengambil foto profil:", error);
      return;
    }

    if (active) {
      setProfileAvatar(data?.avatar_url || null);
    }
  }

  loadAvatar();

  return () => {
    active = false;
  };
}, [user]);

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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem("exploreid-favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [recentlyViewed, setRecentlyViewed] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem("exploreid-recently-viewed");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [cloudReady, setCloudReady] = useState(false);

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState("");
  const [weatherRetry, setWeatherRetry] = useState(0);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  // LOAD PREFERENCES FROM SUPABASE
  useEffect(() => {
    let active = true;

    async function loadCloudData() {
      setCloudReady(false);

      if (!user) {
        setCloudReady(true);
        return;
      }

      try {
        const preferences = await getUserPreferences(user.id);

        if (!active) return;

        setFavorites(preferences.favorites);
        setRecentlyViewed(preferences.recently_viewed);
      } catch (error) {
        console.error("Gagal mengambil preferences:", error);
      } finally {
        if (active) {
          setCloudReady(true);
        }
      }
    }

    loadCloudData();

    return () => {
      active = false;
    };
  }, [user]);

  // SAVE LOCAL BACKUP
  useEffect(() => {
    try {
      localStorage.setItem(
        "exploreid-favorites",
        JSON.stringify(favorites)
      );
    } catch (error) {
      console.error("Gagal menyimpan favorite lokal:", error);
    }
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "exploreid-recently-viewed",
        JSON.stringify(recentlyViewed)
      );
    } catch (error) {
      console.error("Gagal menyimpan riwayat lokal:", error);
    }
  }, [recentlyViewed]);

  // WEATHER
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

  // LOAD REVIEWS
  useEffect(() => {
    if (page !== "detail" || !selected) return;

    let active = true;

    async function loadReviews() {
      setReviews([]);
      setReviewError("");
      setReviewSuccess("");

      const { data, error } = await supabase
        .from("destination_reviews")
        .select("*")
        .eq("destination_id", selected!.id)
        .order("created_at", { ascending: false });

      if (!active) return;

      if (error) {
        setReviewError("Review belum dapat dimuat.");
        console.error("Review:", error.message);
        return;
      }

      setReviews((data || []) as Review[]);
    }

    loadReviews();

    return () => {
      active = false;
    };
  }, [page, selected]);

  // FILTER DESTINATIONS
  const filteredDestinations = useMemo(() => {
    return destinations
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
  }, [category, search, location, maxBudget, sortOrder]);

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

  const selectedGuide = selected
    ? destinationGuides[selected.id] || defaultDestinationGuide
    : defaultDestinationGuide;

  const nearbyDestinations = useMemo(() => {
    if (!selected) return [];

    return destinations
      .filter((item) => item.id !== selected.id)
      .map((item) => ({
        item,
        distance: calculateDistance(
          selected.position,
          item.position
        ),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);
  }, [selected]);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((total, review) => total + review.rating, 0) /
        reviews.length
      : 0;

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

  // TOGGLE FAVORITE AND SYNC WITH SUPABASE
  async function toggleFavorite(id: number) {
    if (user && !cloudReady) return;

    const isSaved = favorites.includes(id);

    const nextFavorites = isSaved
      ? favorites.filter((item) => item !== id)
      : [...favorites, id];

    setFavorites(nextFavorites);

    if (!user) return;

    try {
      await saveUserPreferences(user.id, {
        favorites: nextFavorites,
        recently_viewed: recentlyViewed,
      });
    } catch (error) {
      console.error("Gagal menyimpan favorite:", error);
      window.alert("Favorite gagal disimpan ke Supabase.");
    }
  }

  // OPEN DETAIL AND SAVE RECENTLY VIEWED
  async function openDetail(item: Destination) {
    const nextRecentlyViewed = [
      item.id,
      ...recentlyViewed.filter((id) => id !== item.id),
    ].slice(0, 6);

    setRecentlyViewed(nextRecentlyViewed);

    if (user && cloudReady) {
      try {
        await saveUserPreferences(user.id, {
          favorites,
          recently_viewed: nextRecentlyViewed,
        });
      } catch (error) {
        console.error("Gagal menyimpan riwayat:", error);
      }
    }

    setSelected(item);
    setWeather(null);
    setWeatherError("");
    setReviews([]);
    setReviewError("");
    setReviewSuccess("");
    setReviewComment("");
    setReviewRating(5);

    navigate("detail");
  }

  // SUBMIT REVIEW
  async function submitReview() {
    if (!user) {
      navigate("login");
      return;
    }

    if (!selected) return;

    if (!reviewComment.trim()) {
      setReviewError("Tulis ulasan terlebih dahulu.");
      return;
    }

    setReviewLoading(true);
    setReviewError("");
    setReviewSuccess("");

    const userName =
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "Explorer";

    const { data, error } = await supabase
      .from("destination_reviews")
      .upsert(
        {
          user_id: user.id,
          user_name: userName,
          destination_id: selected.id,
          rating: reviewRating,
          comment: reviewComment.trim(),
        },
        {
          onConflict: "destination_id,user_id",
        }
      )
      .select()
      .single();

    setReviewLoading(false);

    if (error) {
      setReviewError("Gagal mengirim review. Coba lagi.");
      console.error("Review error:", error.message);
      return;
    }

    setReviews((current) => {
      const filtered = current.filter(
        (review) => review.user_id !== user.id
      );

      return [data as Review, ...filtered];
    });

    setReviewComment("");
    setReviewRating(5);
    setReviewSuccess("Review berhasil disimpan!");
  }

  // DELETE REVIEW
  async function deleteReview(reviewId: string) {
    if (!user) return;

    const { error } = await supabase
      .from("destination_reviews")
      .delete()
      .eq("id", reviewId)
      .eq("user_id", user.id);

    if (error) {
      window.alert("Review gagal dihapus.");
      console.error(error.message);
      return;
    }

    setReviews((current) =>
      current.filter((review) => review.id !== reviewId)
    );

    setReviewSuccess("Review berhasil dihapus.");
  }

  // DESTINATION CARD
  function renderDestinationCard(item: Destination) {
    const saved = favorites.includes(item.id);

    return (
      <article className="destination-card" key={item.id}>
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
      <header className={`navbar ${page === "home" ? "navbar-transparent" : ""}`}>
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
            className={page === "recently-viewed" ? "nav-active" : ""}
            onClick={() => navigate("recently-viewed")}
          >
            Recent
          </button>

          <div className="nav-search-wrap">
            <button
              className="nav-search"
              aria-label="Search"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
            </button>

            {searchOpen && (
              <input
                className="nav-search-input"
                type="text"
                placeholder="Cari destinasi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    setSearchOpen(false);

                    if (page !== "home") {
                      navigate("home");

                      setTimeout(() => {
                        document
                          .getElementById("explore")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }, 150);
                    } else {
                      document
                        .getElementById("explore")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }
                  }
                }}
                autoFocus
              />
            )}
          </div>
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
  {profileAvatar ? (
    <img
      src={profileAvatar}
      alt="Foto profil"
      className="profile-nav-image"
    />
  ) : (
    accountInitials
  )}
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
            <section className="hero">
              <img
                className="hero-background"
                src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=2400&q=90"
                alt="Pemandangan alam Indonesia"
              />

              <div className="hero-overlay" />

              <div className="hero-content">
                <span className="hero-eyebrow">
                  EXPLORE THE BEAUTY OF INDONESIA
                </span>

                <h1>
                  Every Place
                  <br />
                  Has a <span>Story.</span>
                </h1>

                <p>
                  From breathtaking landscapes to hidden cultural gems,
                  discover the places that make Indonesia extraordinary.
                </p>

                <form
                  className="hero-search-panel hero-search-transparent"
                  onSubmit={(event) => {
                    event.preventDefault();
                    document
                      .getElementById("explore")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    width: "100%",
                    maxWidth: "650px",
                    padding: "12px",
                    marginTop: "32px",
                    background: "rgba(255,255,255,0.10)",
                    backdropFilter: "blur(18px)",
                    WebkitBackdropFilter: "blur(18px)",
                    border: "1px solid rgba(255,255,255,0.3)",
                    borderRadius: "14px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: "7px",
                      paddingLeft: "12px",
                    }}
                  >
                    <label
                      htmlFor="hero-destination-search"
                      style={{
                        color: "#ffffff",
                        fontSize: "10px",
                        fontWeight: 700,
                        letterSpacing: "2px",
                      }}
                    >
                      DESTINATION
                    </label>

                    <input
                      id="hero-destination-search"
                      type="search"
                      placeholder="Where do you want to explore?"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      style={{
                        width: "100%",
                        minWidth: 0,
                        padding: "8px 0",
                        background: "transparent",
                        color: "#ffffff",
                        border: "none",
                        outline: "none",
                        fontSize: "14px",
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      flexShrink: 0,
                      padding: "15px 24px",
                      background: "#456477",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "9px",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "0.3s ease",
                    }}
                  >
                    Search ↗
                  </button>
                </form>
              </div>

              <div className="hero-scroll">
                SCROLL TO EXPLORE <span>↓</span>
              </div>
            </section>

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

              <div className="filter-row">
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
                  currentDestinations.map((item) =>
                    renderDestinationCard(item)
                  )
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

            {/* DESTINATION OVERVIEW */}
            <section className="destination-info-section">
              <div className="section-top">
                <div>
                  <span className="eyebrow">DESTINATION OVERVIEW</span>
                  <h2>Get to know this place</h2>
                  <p>
                    Kenali informasi penting tentang {selected.name}
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
                    <p>Kategori pengalaman destinasi.</p>
                  </div>
                </article>

                <article className="destination-info-card">
                  <span className="info-card-icon">◷</span>
                  <div>
                    <small>Estimated Budget</small>
                    <h3>{selected.price}</h3>
                    <p>
                      Perkiraan biaya berdasarkan katalog ExploreID,
                      bukan harga tiket resmi.
                    </p>
                  </div>
                </article>
              </div>

              <div className="destination-coordinate">
                <div>
                  <span className="eyebrow">LOCATION COORDINATES</span>
                  <h3>Find this destination</h3>
                  <p>
                    Latitude: {selected.position[0]}°
                    <br />
                    Longitude: {selected.position[1]}°
                  </p>
                </div>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${selected.position[0]},${selected.position[1]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="detail-map-link"
                >
                  View on Google Maps ↗
                </a>
              </div>
            </section>


{/* TICKET INFORMATION */}
<section className="ticket-information-section">
  <div className="section-top">
    <div>
      <span className="eyebrow">TICKET INFORMATION</span>
      <h2>Plan your visit</h2>
      <p>
        Informasi tiket untuk {selected.name}.
        Periksa informasi terbaru sebelum berkunjung.
      </p>
    </div>
  </div>

  <div className="ticket-information-card">
    <div className="ticket-information-icon">
      🎟️
    </div>

    <div className="ticket-information-content">
      <span>OFFICIAL TICKET INFORMATION</span>

      <h3>
        {ticketInformation[selected.id]?.ticketPrice ||
          "Informasi tiket belum tersedia"}
      </h3>

      <p>
        {ticketInformation[selected.id]?.ticketNote ||
          "Kanal pembelian tiket resmi untuk destinasi ini belum tersedia di ExploreID."}
      </p>

      {ticketInformation[selected.id]?.ticketUrl && (
        <a
          href={ticketInformation[selected.id].ticketUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="primary-button"
        >
          Check Official Tickets ↗
        </a>
      )}

      <p className="ticket-unavailable">
        Harga dan ketersediaan tiket mengikuti informasi dari pengelola.
      </p>
    </div>
  </div>
</section>


            {/* TICKET INFORMATION */}
            <section className="ticket-information-section">
              <div className="section-top">
                <div>
                  <span className="eyebrow">TICKET INFORMATION</span>
                  <h2>Plan your visit</h2>
                  <p>
                    Informasi tiket untuk {selected.name}.
                    Periksa informasi terbaru sebelum berkunjung.
                  </p>
                </div>
              </div>

              <div className="ticket-information-card">
                <div className="ticket-information-icon">
                  🎟️
                </div>

                <div className="ticket-information-content">
                  <span>OFFICIAL TICKET PRICE</span>

                  <h3>
                    {selected.ticketPrice ||
                      "Informasi belum tersedia"}
                  </h3>

                  <p>
                    {selected.ticketNote ||
                      "Harga tiket belum tersedia dalam katalog ExploreID. Harga dapat berubah sesuai kebijakan pengelola."}
                  </p>

                  {selected.ticketUrl ? (
                    <a
                      href={selected.ticketUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="primary-button"
                    >
                      View Official Ticket Info ↗
                    </a>
                  ) : (
                    <p className="ticket-unavailable">
                      Tautan tiket resmi belum tersedia.
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* TICKET INFORMATION */}
            <section className="ticket-information-section">
              <div className="section-top">
                <div>
                  <span className="eyebrow">TICKET INFORMATION</span>
                  <h2>Plan your visit</h2>
                  <p>
                    Informasi tiket untuk {selected.name}.
                    Periksa informasi terbaru sebelum berkunjung.
                  </p>
                </div>
              </div>

              <div className="ticket-information-card">
                <div className="ticket-information-icon">
                  🎟️
                </div>

                <div className="ticket-information-content">
                  <span>OFFICIAL TICKET PRICE</span>

                  <h3>
                    {selected.ticketPrice ||
                      "Informasi belum tersedia"}
                  </h3>

                  <p>
                    {selected.ticketNote ||
                      "Harga tiket belum tersedia dalam katalog ExploreID. Harga dapat berubah sesuai kebijakan pengelola."}
                  </p>

                  {selected.ticketUrl ? (
                    <a
                      href={selected.ticketUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="primary-button"
                    >
                      Check Official Tickets ↗
                    </a>
                  ) : (
                    <p className="ticket-unavailable">
                      Tautan tiket resmi belum tersedia.
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* TICKET INFORMATION */}
            <section className="ticket-information-section">
              <div className="section-top">
                <div>
                  <span className="eyebrow">TICKET INFORMATION</span>
                  <h2>Plan your visit</h2>
                  <p>
                    Informasi tiket untuk {selected.name}.
                    Periksa informasi terbaru sebelum berkunjung.
                  </p>
                </div>
              </div>

              <div className="ticket-information-card">
                <div className="ticket-information-icon">
                  🎟️
                </div>

                <div className="ticket-information-content">
                  <span>OFFICIAL TICKET PRICE</span>

                  <h3>
                    {selected.ticketPrice ||
                      "Informasi belum tersedia"}
                  </h3>

                  <p>
                    {selected.ticketNote ||
                      "Harga tiket belum tersedia dalam katalog ExploreID. Harga dapat berubah sesuai kebijakan pengelola."}
                  </p>

                  {selected.ticketUrl ? (
                    <a
                      href={selected.ticketUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="primary-button"
                    >
                      Check Official Tickets ↗
                    </a>
                  ) : (
                    <p className="ticket-unavailable">
                      Tautan tiket resmi belum tersedia.
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* TRAVEL GUIDE */}
            <section className="visit-guide-section">
              <div className="visit-guide-content">
                <div>
                  <span className="eyebrow">TRAVEL GUIDE</span>
                  <h2>Plan your visit</h2>
                  <p>
                    Panduan singkat untuk membantu kamu mengenal{" "}
                    {selected.name} sebelum berkunjung.
                  </p>
                </div>

                <div className="visit-guide-list">
                  <div className="visit-guide-item">
                    <span>01</span>
                    <div>
                      <strong>Destination Highlights</strong>
                      <p>
                        Hal menarik yang menjadi daya tarik utama
                        destinasi ini.
                      </p>
                      <ul>
                        {selectedGuide.highlights.map((text, index) => (
                          <li key={index}>{text}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="visit-guide-item">
                    <span>02</span>
                    <div>
                      <strong>Things to Do</strong>
                      <p>
                        Aktivitas yang dapat kamu pertimbangkan
                        saat berkunjung.
                      </p>
                      <ul>
                        {selectedGuide.activities.map((text, index) => (
                          <li key={index}>{text}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="visit-guide-item">
                    <span>03</span>
                    <div>
                      <strong>How to Get There</strong>
                      <p>{selectedGuide.access}</p>
                    </div>
                  </div>

                  <div className="visit-guide-item">
                    <span>04</span>
                    <div>
                      <strong>Available Facilities</strong>
                      <p>{selectedGuide.facilities}</p>
                    </div>
                  </div>

                  <div className="visit-guide-item">
                    <span>05</span>
                    <div>
                      <strong>Travel Tips</strong>
                      <p>
                        Beberapa hal yang perlu diperhatikan
                        sebelum dan selama perjalanan.
                      </p>
                      <ul>
                        {selectedGuide.tips.map((text, index) => (
                          <li key={index}>{text}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* PHOTO GALLERY */}
            <section className="photo-gallery-section">
              <div className="section-top">
                <div>
                  <span className="eyebrow">PHOTO PREVIEW</span>
                  <h2>Destination Gallery</h2>
                  <p>
                    Foto utama destinasi dari katalog ExploreID.
                  </p>
                </div>
              </div>

              <div className="photo-gallery-grid">
                <a
                  href={selected.image}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gallery-photo gallery-photo-main"
                >
                  <img src={selected.image} alt={selected.name} />
                  <span>{selected.name}</span>
                </a>
              </div>
            </section>

            {/* NEARBY DESTINATIONS */}
            <section className="nearby-section">
              <div className="section-top">
                <div>
                  <span className="eyebrow">EXPLORE MORE</span>
                  <h2>Nearby destinations</h2>
                  <p>
                    Destinasi lain dengan koordinat terdekat dari{" "}
                    {selected.name}.
                  </p>
                </div>
              </div>

              <div className="destination-grid">
                {nearbyDestinations.map(({ item, distance }) => (
                  <article className="destination-card" key={item.id}>
                    <div className="card-image">
                      <img src={item.image} alt={item.name} />
                    </div>

                    <div className="card-content">
                      <span className="tag">{item.category}</span>
                      <h3>{item.name}</h3>
                      <p className="location">⌖ {item.location}</p>
                      <p className="nearby-distance">
                        Sekitar {distance.toFixed(1)} km berdasarkan
                        jarak koordinat.
                      </p>

                      <button
                        className="detail-link"
                        onClick={() => openDetail(item)}
                      >
                        Explore destination ↗
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* WEATHER */}
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
                      <p>{getWeatherDescription(weather.weatherCode)}</p>
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

            {/* REVIEWS */}
            <section className="reviews-section">
              <div className="section-top">
                <div>
                  <span className="eyebrow">COMMUNITY EXPERIENCE</span>
                  <h2>Reviews & Ratings</h2>
                  <p>
                    Lihat penilaian dan pengalaman pengguna lainnya.
                  </p>
                </div>
              </div>

              <div className="review-summary">
                <strong>
                  {reviews.length > 0 ? averageRating.toFixed(1) : "—"}
                </strong>

                <span className="review-stars">
                  {"★".repeat(Math.round(averageRating))}
                  {"☆".repeat(5 - Math.round(averageRating))}
                </span>

                <small>
                  {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                </small>
              </div>

              <div className="review-form">
                <h3>Share your experience</h3>

                {user ? (
                  <>
                    <label htmlFor="review-rating">Your rating</label>

                    <div className="rating-picker" id="review-rating">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          className={
                            rating <= reviewRating ? "rating-active" : ""
                          }
                          onClick={() => setReviewRating(rating)}
                          aria-label={`${rating} stars`}
                        >
                          ★
                        </button>
                      ))}
                    </div>

                    <textarea
                      value={reviewComment}
                      onChange={(event) =>
                        setReviewComment(event.target.value)
                      }
                      placeholder="Ceritakan pengalamanmu tentang destinasi ini..."
                      rows={4}
                      maxLength={1000}
                    />

                    <button
                      className="primary-button"
                      onClick={submitReview}
                      disabled={reviewLoading}
                    >
                      {reviewLoading ? "Submitting..." : "Submit Review"}
                    </button>

                    <small className="review-hint">
                      Satu akun hanya dapat memiliki satu review per destinasi.
                      Review berikutnya akan memperbarui review sebelumnya.
                    </small>
                  </>
                ) : (
                  <p>
                    Silakan{" "}
                    <button
                      className="inline-link"
                      onClick={() => navigate("login")}
                    >
                      login
                    </button>{" "}
                    untuk memberikan rating dan ulasan.
                  </p>
                )}

                {reviewError && (
                  <p className="review-error">{reviewError}</p>
                )}

                {reviewSuccess && (
                  <p className="review-success">{reviewSuccess}</p>
                )}
              </div>

              <div className="review-list">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <article className="review-card" key={review.id}>
                      <div className="review-card-top">
                        <div>
                          <strong>
                            {review.user_id === user?.id
                              ? "You"
                              : review.user_name || "Explorer"}
                          </strong>

                          <span className="review-stars">
                            {"★".repeat(review.rating)}
                            {"☆".repeat(5 - review.rating)}
                          </span>
                        </div>

                        <small>
                          {new Date(review.created_at).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </small>
                      </div>

                      <p>{review.comment}</p>

                      {user?.id === review.user_id && (
                        <button
                          className="review-delete"
                          onClick={() => deleteReview(review.id)}
                        >
                          Delete review
                        </button>
                      )}
                    </article>
                  ))
                ) : (
                  <div className="empty-review">
                    Belum ada ulasan untuk destinasi ini.
                    Jadilah yang pertama memberikan review!
                  </div>
                )}
              </div>
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
                favoriteDestinations.map((item) =>
                  renderDestinationCard(item)
                )
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
            <span className="eyebrow">YOUR JOURNEY</span>
            <h1 className="page-title">Recently Viewed</h1>
            <p className="page-subtitle">
              Destinasi yang terakhir kamu lihat.
            </p>

            <div className="destination-grid">
              {recentlyViewedDestinations.length > 0 ? (
                recentlyViewedDestinations.map((item) =>
                  renderDestinationCard(item)
                )
              ) : (
                <div className="empty-state">
                  <h3>No recent destinations</h3>
                  <p>
                    Destinasi yang kamu buka akan muncul di sini.
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

        {/* SEARCH PAGE */}
        {page === "search" && (
          <section className="inner-page search-page">
            <span className="eyebrow">DISCOVER INDONESIA</span>
            <h1 className="page-title">Find Your Destination</h1>
            <p className="page-subtitle">
              Temukan destinasi menarik untuk perjalananmu.
            </p>

            <div className="search-page-input">
              <input
                type="text"
                placeholder="Cari nama destinasi atau lokasi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="destination-grid">
              {filteredDestinations.length > 0 ? (
                filteredDestinations.map((item) =>
                  renderDestinationCard(item)
                )
              ) : (
                <div className="empty-state">
                  <h3>Destinasi tidak ditemukan</h3>
                  <p>Coba gunakan kata kunci lainnya.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* PROFILE */}
        {page === "profile" && (
          <ProfilePage onLogout={handleLogout} />
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
              {destinations.map((item) =>
                renderDestinationCard(item)
              )}
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
                .map((item) => renderDestinationCard(item))}
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
