import "./App.css";
import { useEffect, useMemo, useState } from "react";
import AuthPage from "./AuthPage";
import ProfilePage from "./ProfilePage";
import { useAuth } from "./context/AuthContext";
import { supabase } from "./lib/supabaseClient";
import { getUserPreferences, saveUserPreferences } from "./lib/userPreferences";
import { destinations, type Destination } from "./data/destinations";

import LanguageProvider from "./context/LanguageProvider";
import DestinationCard from "./components/DestinationCard";
import DestinationDetail from "./components/DestinationDetail";
import MapPage from "./components/MapPage";
import SettingsPage from "./components/SettingsPage";
import IndonesiaPinMap from "./components/IndonesiaPinMap";
import Reveal, { prefersReducedMotion } from "./components/Reveal";
import CommunitySection from "./components/CommunitySection";
import FeaturedReviews from "./components/FeaturedReviews";
import PageHeader from "./components/PageHeader";
import ScribbleUnderline, {
  ScribbleBurst,
} from "./components/ScribbleUnderline";
import StatsBar from "./components/StatsBar";
import { useAppearance } from "./hooks/useAppearance";
import { useLanguage } from "./hooks/useLanguage";
import { usePersistedBoolean } from "./hooks/usePersistedBoolean";
import {
  getForYouRecommendations,
  getHeroRecommendations,
} from "./lib/recommendations";

type Page =
  | "home"
  | "explore"
  | "detail"
  | "favorites"
  | "profile"
  | "map"
  | "for-you"
  | "recently-viewed"
  | "search"
  | "login"
  | "register"
  | "settings";

type ExploreSection = {
  key: string;
  // null = bagian "Popular Destinations"
  category: string | null;
  items: Destination[];
};

function AppContent() {
  const { t } = useLanguage();

  // Pesan sambutan dipilih acak sekali; teksnya mengikuti bahasa aktif.
  const [welcomeIndex] = useState(() =>
    Math.floor(Math.random() * t.home.welcomeMessages.length)
  );
  const homeWelcome = t.home.welcomeMessages[welcomeIndex];

  const [page, setPage] = useState<Page>("home");
  const [activeHomeSection, setActiveHomeSection] = useState<
    "home" | "explore"
  >("home");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [location, setLocation] = useState("All");
  const [maxBudget, setMaxBudget] = useState("All");
  const [sortOrder, setSortOrder] = useState("default");
  const [selected, setSelected] = useState<Destination | null>(null);
  const [detailPhase, setDetailPhase] = useState<"exit" | "enter" | null>(
    null
  );

  const [appearanceTheme, setAppearanceTheme] = useAppearance();
  const [personalizedContent, setPersonalizedContent] = usePersistedBoolean(
    "exploreid-personalized-content",
    true
  );

  useEffect(() => {
    const updateActiveSection = () => {
      if (page !== "home") {
        setActiveHomeSection("home");
        return;
      }

      const exploreSection = document.getElementById("explore-catalog");

      if (!exploreSection) {
        setActiveHomeSection("home");
        return;
      }

      setActiveHomeSection(
        exploreSection.getBoundingClientRect().top <= 140 ? "explore" : "home"
      );
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [page]);

  const { user, loading: authLoading, signOut } = useAuth();

  // Parallax hero: foto latar dan teks bergeser pelan saat halaman di-scroll.
  useEffect(() => {
    if (page !== "home" || authLoading || prefersReducedMotion()) {
      return undefined;
    }

    const hero = document.querySelector<HTMLElement>(".hero-discover");

    if (!hero) return undefined;

    let frame = 0;

    const update = () => {
      frame = 0;
      hero.style.setProperty(
        "--hero-scroll",
        String(Math.min(window.scrollY, 1400))
      );
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
      hero.style.removeProperty("--hero-scroll");
    };
  }, [page, authLoading]);

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

  // Rekomendasi hero & halaman For You mengikuti riwayat lihat dan
  // pengaturan "Konten Personal".
  const recommendedHeroDestinations = useMemo(
    () => getHeroRecommendations(recentlyViewed, personalizedContent),
    [recentlyViewed, personalizedContent]
  );

  const forYou = useMemo(
    () => getForYouRecommendations(recentlyViewed, personalizedContent),
    [recentlyViewed, personalizedContent]
  );

  const [cloudReady, setCloudReady] = useState(false);

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
      localStorage.setItem("exploreid-favorites", JSON.stringify(favorites));
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

  // FILTER DESTINATIONS
  const filteredDestinations = useMemo(() => {
    return destinations
      .filter((item) => {
        const matchesCategory = category === "All" || item.category === category;
        const matchesSearch =
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.location.toLowerCase().includes(search.toLowerCase());
        const matchesLocation =
          location === "All" || item.location.includes(location);
        const matchesBudget =
          maxBudget === "All" || item.budget <= Number(maxBudget);

        return (
          matchesCategory && matchesSearch && matchesLocation && matchesBudget
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

  // EXPLORE CATEGORY SECTIONS
  const exploreSections = useMemo<ExploreSection[]>(() => {
    const categories = Array.from(
      new Set(filteredDestinations.map((item) => item.category))
    );

    return [
      {
        key: "__popular__",
        category: null,
        items: filteredDestinations.slice(0, 6),
      },
      ...categories.map((name) => ({
        key: name,
        category: name,
        items: filteredDestinations.filter((item) => item.category === name),
      })),
    ].filter((section) => section.items.length > 0);
  }, [filteredDestinations]);

  const favoriteDestinations = destinations.filter((item) =>
    favorites.includes(item.id)
  );

  const recentlyViewedDestinations = recentlyViewed
    .map((id) => destinations.find((item) => item.id === id))
    .filter((item): item is Destination => item !== undefined);

  function resetFilters() {
    setCategory("All");
    setSearch("");
    setLocation("All");
    setMaxBudget("All");
    setSortOrder("default");
  }

  function navigate(nextPage: Page) {
    if (nextPage === "explore") {
      setPage("home");
      window.setTimeout(() => {
        document.getElementById("explore-catalog")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 0);
      return;
    }

    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleLogout() {
    const { error } = await signOut();

    if (error) {
      window.alert(`${t.common.logoutFailed}: ${error}`);
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
      window.alert(t.common.favoriteSaveFailed);
    }
  }

  // OPEN DETAIL AND SAVE RECENTLY VIEWED
  async function openDetail(item: Destination, withTransition = false) {
    const nextRecentlyViewed = [
      item.id,
      ...recentlyViewed.filter((id) => id !== item.id),
    ].slice(0, 6);

    setRecentlyViewed(nextRecentlyViewed);

    // Animasi keluar hanya digunakan saat memilih Nearby Destinations.
    if (withTransition) {
      setDetailPhase("exit");
      await new Promise((resolve) => setTimeout(resolve, 300));
    } else {
      setDetailPhase(null);
    }

    setSelected(item);
    navigate("detail");

    // Simpan riwayat ke Supabase tanpa menahan perpindahan halaman.
    if (user && cloudReady) {
      saveUserPreferences(user.id, {
        favorites,
        recently_viewed: nextRecentlyViewed,
      }).catch((error) => {
        console.error("Gagal menyimpan riwayat:", error);
      });
    }

    if (withTransition) {
      setDetailPhase("enter");
    }
  }

  // DESTINATION CARD
  function renderDestinationCard(item: Destination) {
    return (
      <DestinationCard
        key={item.id}
        item={item}
        saved={favorites.includes(item.id)}
        onOpen={openDetail}
        onToggleFavorite={toggleFavorite}
      />
    );
  }

  if (authLoading) {
    return <div className="auth-loading">{t.common.sessionChecking}</div>;
  }

  return (
    <div className="app">
      <header className={`navbar ${page === "home" ? "navbar-transparent" : ""}`}>
        <button className="logo" onClick={() => navigate("home")}>
          Explore<span>ID.</span>
        </button>

        <nav className="nav-links">
          <button
            className={
              page === "home" && activeHomeSection === "home"
                ? "nav-active"
                : ""
            }
            onClick={() => navigate("home")}
          >
            {t.nav.home}
          </button>

          <button
            className={
              page === "home" && activeHomeSection === "explore"
                ? "nav-active"
                : ""
            }
            onClick={() => navigate("explore")}
          >
            {t.nav.explore}
          </button>

          <button
            className={page === "map" ? "nav-active" : ""}
            onClick={() => navigate("map")}
          >
            {t.nav.map}
          </button>

          <button
            className={page === "for-you" ? "nav-active" : ""}
            onClick={() => navigate("for-you")}
          >
            {t.nav.forYou}
          </button>

          <button
            className={page === "recently-viewed" ? "nav-active" : ""}
            onClick={() => navigate("recently-viewed")}
          >
            {t.nav.recent}
          </button>

          <div
            className={`nav-search-wrap ${searchOpen ? "search-open" : ""}`}
            onMouseEnter={() => setSearchOpen(true)}
            onMouseLeave={() => {
              if (!search.trim()) {
                setSearchOpen(false);
              }
            }}
          >
            <button
              className="nav-search"
              aria-label={t.nav.searchAria}
              onClick={() => setSearchOpen(true)}
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
                placeholder={t.nav.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    setSearchOpen(false);
                    navigate("explore");
                  }

                  if (e.key === "Escape") {
                    setSearchOpen(false);
                  }
                }}
                autoFocus
              />
            )}
          </div>
        </nav>

        <div className="nav-actions">
          <button
            className="settings-nav"
            onClick={() => navigate("settings")}
            title={t.nav.settingsTitle}
          >
            ⚙
          </button>

          {user ? (
            <button
              className="profile-nav"
              onClick={() => navigate("profile")}
              title={t.nav.openProfile}
            >
              {profileAvatar ? (
                <img
                  src={profileAvatar}
                  alt={t.nav.profilePhotoAlt}
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
                {t.nav.login}
              </button>

              <button
                className="auth-nav-button auth-nav-primary"
                onClick={() => navigate("register")}
              >
                {t.nav.register}
              </button>
            </>
          )}
        </div>
      </header>

      <main>
        {(page === "login" || page === "register") && (
          <AuthPage mode={page} onNavigate={(nextPage) => navigate(nextPage)} />
        )}

        {page === "home" && (
          <>
            {/* HERO */}
            <section className="hero hero-discover">
              <img
                className="hero-background"
                src="https://images.unsplash.com/photo-1650445332429-75ceee3f3226?auto=format&fit=crop&w=2400&q=95"
                alt={t.hero.imageAlt}
              />

              <div className="hero-overlay" />
              <div className="hero-warm-glow" />

              <div className="hero-content">
                <span className="hero-eyebrow">{t.hero.eyebrow}</span>

                <h1
                  className="hero-interactive-title"
                  aria-label={`${t.hero.wordTop} ${t.hero.wordBottom}`}
                  style={{
                    display: "block",
                    visibility: "visible",
                    color: "#ffffff",
                    opacity: 1,
                    position: "relative",
                    zIndex: 4,
                    margin: "18px 0",
                    fontSize: "clamp(3.5rem, 9vw, 8.5rem)",
                    lineHeight: 0.88,
                    letterSpacing: "-0.065em",
                    fontWeight: 800,
                  }}
                >
                  <span className="hero-scribble-wrap">
                    <span className="hero-interactive-word" aria-hidden="true">
                      {Array.from(t.hero.wordTop).map((letter, index) => (
                        <span className="hero-title-letter" key={`top-${index}`}>
                          {letter}
                        </span>
                      ))}
                    </span>

                    <ScribbleBurst delay={700} />
                  </span>

                  <br />

                  <span className="hero-scribble-wrap">
                    <span className="hero-interactive-word" aria-hidden="true">
                      {Array.from(t.hero.wordBottom).map((letter, index) => (
                        <span
                          className="hero-title-letter"
                          key={`bottom-${index}`}
                        >
                          {letter}
                        </span>
                      ))}
                    </span>

                    <ScribbleUnderline delay={1000} />
                  </span>
                </h1>

                <p>{homeWelcome.description}</p>

                <button
                  className="hero-button"
                  onClick={() => navigate("explore")}
                >
                  {t.hero.button} <span>→</span>
                </button>
              </div>

              <div className="hero-destination-rail" aria-label={t.hero.railAria}>
                {recommendedHeroDestinations.map((item) => (
                  <button
                    className="hero-destination-card"
                    key={item.id}
                    onClick={() => openDetail(item)}
                    title={t.hero.viewDestination(item.name)}
                  >
                    <img src={item.image} alt={item.name} loading="lazy" />

                    <span className="hero-card-location">{item.location}</span>

                    <strong>{item.name}</strong>

                    <span className="hero-card-arrow">↗</span>
                  </button>
                ))}
              </div>

              <div className="hero-scroll">
                {t.hero.scrollHint} <span>↓</span>
              </div>
            </section>

            {/* STATS */}
            <StatsBar />

            {/* HOME INTRODUCTION */}
            <Reveal
              as="section"
              className="explore-section home-intro-section"
              id="home-introduction"
              style={{ paddingTop: "72px", paddingBottom: "76px" }}
            >
              <div
                className="section-top"
                style={{
                  display: "block",
                  maxWidth: "1240px",
                  margin: "0 auto",
                }}
              >
                <div style={{ maxWidth: "1180px" }}>
                  <span className="eyebrow">{t.home.aboutEyebrow}</span>

                  <h2
                    style={{
                      maxWidth: "900px",
                      margin: "18px 0 38px",
                      lineHeight: 1.15,
                    }}
                  >
                    <span className="scribble-heading-wrap">
                      {homeWelcome.introTitle}

                      <ScribbleUnderline
                        className="scribble-heading"
                        delay={200}
                      />
                    </span>
                  </h2>

                  {/* Warna teks diatur lewat CSS (.home-intro-copy) agar ikut dark mode */}
                  <div
                    className="home-intro-copy"
                    style={{
                      maxWidth: "1120px",
                      fontSize: "17px",
                      lineHeight: 1.85,
                    }}
                  >
                    {t.home.introParagraphs.map((paragraph, index, all) => (
                      <Reveal
                        as="p"
                        key={index}
                        delay={index * 90}
                        style={{
                          margin: index === all.length - 1 ? "0" : "0 0 14px",
                        }}
                      >
                        {paragraph}
                      </Reveal>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>

            {/* PETA TITIK DENGAN PIN FOTO */}
            <IndonesiaPinMap onOpen={openDetail} />

            {/* EXPLORE CATALOG */}
            <section
              id="explore-catalog"
              className="inner-page explore-page explore-catalog-section"
              style={{ scrollMarginTop: "100px" }}
            >
              <div className="section-top">
                <div>
                  <span className="eyebrow">{t.explore.eyebrow}</span>
                  <h1 className="page-title">{t.explore.title}</h1>
                  <p className="page-subtitle">{t.explore.subtitle}</p>
                </div>

                <span className="result-count">
                  {t.explore.resultCount(filteredDestinations.length)}
                </span>
              </div>

              {/* SEARCH */}
              <div className="search-page-input">
                <input
                  type="text"
                  placeholder={t.explore.searchPlaceholder}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              {/* FILTER */}
              <div className="filter-row">
                <select
                  className="filter-select"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  aria-label={t.explore.categoryFilterAria}
                >
                  <option value="All">{t.explore.allCategories}</option>

                  {Array.from(new Set(destinations.map((item) => item.category)))
                    .sort((a, b) => a.localeCompare(b, "id"))
                    .map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                </select>

                <select
                  className="filter-select"
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                  aria-label={t.explore.sortAria}
                >
                  <option value="default">{t.explore.sortDefault}</option>
                  <option value="price-low">{t.explore.sortPriceLow}</option>
                  <option value="price-high">{t.explore.sortPriceHigh}</option>
                  <option value="name-az">{t.explore.sortNameAz}</option>
                  <option value="name-za">{t.explore.sortNameZa}</option>
                </select>

                <button className="reset-filter" onClick={resetFilters}>
                  {t.explore.resetFilters}
                </button>
              </div>

              {/* CATEGORY CAROUSELS */}
              {filteredDestinations.length > 0 ? (
                <div className="explore-category-list">
                  {exploreSections.map((section, index) => (
                    <Reveal
                      as="section"
                      className="explore-category-section"
                      key={section.key}
                    >
                      <div className="explore-category-heading">
                        <div>
                          <span className="eyebrow">
                            {index === 0
                              ? t.explore.handpicked
                              : t.explore.byCategory}
                          </span>

                          <h2>{section.category ?? t.explore.popularTitle}</h2>

                          <p>{t.explore.toDiscover(section.items.length)}</p>
                        </div>
                      </div>

                      <div className="explore-horizontal-wrap">
                        <div className="explore-horizontal-track">
                          {section.items.map((item) =>
                            renderDestinationCard(item)
                          )}
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <h3>{t.explore.emptyTitle}</h3>
                  <p>{t.explore.emptyDesc}</p>

                  <button className="primary-button" onClick={resetFilters}>
                    {t.explore.resetSearch}
                  </button>
                </div>
              )}
            </section>

            {/* KOMUNITAS */}
            <CommunitySection
              loggedIn={Boolean(user)}
              avatarUrl={profileAvatar}
              initials={accountInitials}
              onJoin={() => navigate(user ? "explore" : "register")}
            />

            {/* ULASAN PILIHAN */}
            <FeaturedReviews onOpen={openDetail} />
          </>
        )}

        {/* DESTINATION DETAIL */}
        {page === "detail" && selected && (
          <DestinationDetail
            key={selected.id}
            destination={selected}
            phase={detailPhase}
            isFavorite={favorites.includes(selected.id)}
            user={user}
            onBack={() => navigate("explore")}
            onToggleFavorite={toggleFavorite}
            onOpenNearby={(item) => openDetail(item, true)}
            onRequireLogin={() => navigate("login")}
          />
        )}

        {/* FAVORITES */}
        {page === "favorites" && (
          <section className="inner-page">
            <PageHeader
              eyebrow={t.favorites.eyebrow}
              title={t.favorites.title}
              subtitle={t.favorites.subtitle}
            />

            <Reveal className="destination-grid" threshold={0.05}>
              {favoriteDestinations.length > 0 ? (
                favoriteDestinations.map((item) => renderDestinationCard(item))
              ) : (
                <div className="empty-state">
                  <div className="empty-heart">♡</div>
                  <h3>{t.favorites.emptyTitle}</h3>
                  <p>{t.favorites.emptyDesc}</p>

                  <button
                    className="primary-button"
                    onClick={() => navigate("home")}
                  >
                    {t.favorites.cta}
                  </button>
                </div>
              )}
            </Reveal>
          </section>
        )}

        {/* RECENTLY VIEWED */}
        {page === "recently-viewed" && (
          <section className="inner-page">
            <PageHeader
              eyebrow={t.recent.eyebrow}
              title={t.recent.title}
              subtitle={t.recent.subtitle}
            />

            <Reveal className="destination-grid" threshold={0.05}>
              {recentlyViewedDestinations.length > 0 ? (
                recentlyViewedDestinations.map((item) =>
                  renderDestinationCard(item)
                )
              ) : (
                <div className="empty-state">
                  <h3>{t.recent.emptyTitle}</h3>
                  <p>{t.recent.emptyDesc}</p>

                  <button
                    className="primary-button"
                    onClick={() => navigate("home")}
                  >
                    {t.recent.cta}
                  </button>
                </div>
              )}
            </Reveal>
          </section>
        )}

        {/* SEARCH PAGE */}
        {page === "search" && (
          <section className="inner-page search-page">
            <PageHeader
              eyebrow={t.search.eyebrow}
              title={t.search.title}
              subtitle={t.search.subtitle}
            />

            <div className="search-page-input">
              <input
                type="text"
                placeholder={t.search.placeholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Reveal className="destination-grid" threshold={0.05}>
              {filteredDestinations.length > 0 ? (
                filteredDestinations.map((item) => renderDestinationCard(item))
              ) : (
                <div className="empty-state">
                  <h3>{t.search.emptyTitle}</h3>
                  <p>{t.search.emptyDesc}</p>
                </div>
              )}
            </Reveal>
          </section>
        )}

        {/* PROFILE */}
        {page === "profile" && <ProfilePage onLogout={handleLogout} />}

        {/* SETTINGS */}
        {page === "settings" && (
          <SettingsPage
            user={user}
            profileAvatar={profileAvatar}
            accountInitials={accountInitials}
            favoriteDestinations={favoriteDestinations}
            renderCard={renderDestinationCard}
            personalizedContent={personalizedContent}
            onPersonalizedContentChange={setPersonalizedContent}
            appearanceTheme={appearanceTheme}
            onAppearanceChange={setAppearanceTheme}
            onNavigate={navigate}
          />
        )}

        {/* MAP */}
        {page === "map" && (
          <MapPage
            onOpen={openDetail}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        )}

        {/* FOR YOU */}
        {page === "for-you" && (
          <section className="inner-page">
            <PageHeader
              eyebrow={t.forYou.eyebrow}
              title={t.forYou.title}
              subtitle={
                forYou.isPersonalized
                  ? t.forYou.subtitlePersonal
                  : t.forYou.subtitleDefault
              }
            />

            <Reveal className="destination-grid compact-destination-grid" threshold={0.05}>
              {forYou.items.map((item) => renderDestinationCard(item))}
            </Reveal>
          </section>
        )}
      </main>

      <footer className="footer">
        <button className="footer-logo" onClick={() => navigate("home")}>
          ExploreID.
        </button>

        <p>{t.footer.tagline}</p>

        <small>{t.footer.copyright}</small>
      </footer>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
