
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

const homeWelcomeMessages = [
  {
    description:
      "Dari pegunungan hingga pantai tersembunyi, selalu ada keindahan Indonesia yang menunggu untuk kamu temukan.",
    introTitle: "Setiap perjalanan punya cerita",
    introDescription:
      "Jelajahi beragam destinasi di seluruh Indonesia, kenali keindahan alam dan kekayaan budayanya, lalu temukan tempat yang ingin kamu kunjungi berikutnya.",
  },
  {
    description:
      "Indonesia menyimpan begitu banyak tempat istimewa. Temukan inspirasi perjalananmu dari berbagai penjuru Nusantara.",
    introTitle: "Kenali lebih banyak tentang Indonesia",
    introDescription:
      "Dari tempat populer hingga lokasi yang belum banyak dikenal, ExploreID membantumu menemukan inspirasi untuk perjalanan berikutnya.",
  },
  {
    description:
      "Ada banyak sudut Nusantara yang menunggu untuk dijelajahi. Mulai temukan destinasi menarik versimu di sini.",
    introTitle: "Petualangan baru dimulai di sini",
    introDescription:
      "ExploreID hadir untuk menemanimu menjelajahi destinasi, mengenal budaya, dan menemukan pengalaman baru dari berbagai daerah di Indonesia.",
  },
  {
    description:
      "Bukan hanya tentang tempat yang dikunjungi, tetapi juga cerita dan pengalaman yang kamu temukan sepanjang perjalanan.",
    introTitle: "Temukan tempat, ciptakan cerita",
    introDescription:
      "Jadikan ExploreID sebagai titik awal untuk mencari destinasi, mendapatkan informasi, dan merencanakan pengalaman perjalanan yang berkesan.",
  },
];

const regionLocales: Record<string, string> = {
  Indonesia: "id-ID",
  Malaysia: "ms-MY",
  Singapore: "en-SG",
  "United States": "en-US",
  "United Kingdom": "en-GB",
  Japan: "ja-JP",
};

function getRegionLocale(region: string) {
  return regionLocales[region] || "id-ID";
}

function getSavedBoolean(key: string, defaultValue: boolean) {
  try {
    const saved = localStorage.getItem(key);
    return saved === null ? defaultValue : saved === "true";
  } catch {
    return defaultValue;
  }
}

function App() {
  const [homeWelcome] = useState(
    () =>
      homeWelcomeMessages[
        Math.floor(Math.random() * homeWelcomeMessages.length)
      ]
  );

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
  const [detailPhase, setDetailPhase] = useState<
    "exit" | "enter" | null
  >(null);
const [settingsCategory, setSettingsCategory] = useState(
  "Account & Profile"
);

const [emailNotifications, setEmailNotifications] = useState(() =>
  getSavedBoolean("exploreid-email-notifications", true)
);

const [recommendationNotifications, setRecommendationNotifications] =
  useState(() =>
    getSavedBoolean("exploreid-recommendation-notifications", true)
  );

const [updateNotifications, setUpdateNotifications] = useState(() =>
  getSavedBoolean("exploreid-update-notifications", false)
);

const [settingsLanguage, setSettingsLanguage] = useState(() => {
  try {
    return localStorage.getItem("exploreid-language") || "English";
  } catch {
    return "English";
  }
});

const isIndonesian = settingsLanguage === "Indonesia";

const [settingsRegion, setSettingsRegion] = useState(() => {
  try {
    return localStorage.getItem("exploreid-region") || "Indonesia";
  } catch {
    return "Indonesia";
  }
});

// PRIVACY
const [privateProfile, setPrivateProfile] = useState(() =>
  getSavedBoolean("exploreid-private-profile", true)
);

const [activitySharing, setActivitySharing] = useState(() =>
  getSavedBoolean("exploreid-activity-sharing", false)
);

const [personalizedContent, setPersonalizedContent] = useState(() =>
  getSavedBoolean("exploreid-personalized-content", true)
);

  useEffect(() => {
    const updateActiveSection = () => {
      if (page !== "home") {
        setActiveHomeSection("home");
        return;
      }

      const exploreSection =
        document.getElementById("explore-catalog");

      if (!exploreSection) {
        setActiveHomeSection("home");
        return;
      }

      setActiveHomeSection(
        exploreSection.getBoundingClientRect().top <= 140
          ? "explore"
          : "home"
      );
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, {
      passive: true,
    });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [page]);

  const { user, loading: authLoading, signOut } = useAuth();

  const [profileAvatar, setProfileAvatar] = useState<string | null>(
    null
  );

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

// SAVE LANGUAGE
useEffect(() => {
  localStorage.setItem("exploreid-language", settingsLanguage);
}, [settingsLanguage]);

// SAVE REGION
useEffect(() => {
  localStorage.setItem("exploreid-region", settingsRegion);
}, [settingsRegion]);

// SAVE NOTIFICATIONS
useEffect(() => {
  localStorage.setItem(
    "exploreid-email-notifications",
    String(emailNotifications)
  );
}, [emailNotifications]);

useEffect(() => {
  localStorage.setItem(
    "exploreid-recommendation-notifications",
    String(recommendationNotifications)
  );
}, [recommendationNotifications]);

useEffect(() => {
  localStorage.setItem(
    "exploreid-update-notifications",
    String(updateNotifications)
  );
}, [updateNotifications]);

// SAVE PRIVACY
useEffect(() => {
  localStorage.setItem(
    "exploreid-private-profile",
    String(privateProfile)
  );
}, [privateProfile]);

useEffect(() => {
  localStorage.setItem(
    "exploreid-activity-sharing",
    String(activitySharing)
  );
}, [activitySharing]);

useEffect(() => {
  localStorage.setItem(
    "exploreid-personalized-content",
    String(personalizedContent)
  );
}, [personalizedContent]);

const st = isIndonesian
  ? {
      preferences: "PREFERENSI",
      title: "Pengaturan",
      subtitle: "Kelola akun dan sesuaikan pengalaman ExploreID kamu.",
      account: "Akun & Profil",
      favorites: "Favorit",
      notifications: "Notifikasi",
      language: "Bahasa & Wilayah",
      privacy: "Privasi",
      appearance: "Tampilan",
      about: "Tentang ExploreID",
      profileInfo: "Informasi Profil",
      profileDesc: "Informasi pribadi yang terhubung dengan akun ExploreID kamu.",
      accountEmail: "Email akun",
      profileName: "Nama profil",
      manageProfile: "Kelola Profil",
      notificationTitle: "Preferensi Notifikasi",
      notificationDesc: "Pilih notifikasi yang ingin kamu terima.",
      email: "Notifikasi Email",
      emailDesc: "Terima informasi penting melalui email.",
      recommendations: "Rekomendasi Destinasi",
      recommendationsDesc: "Dapatkan rekomendasi tempat yang mungkin menarik untuk kamu.",
      updates: "Pembaruan ExploreID",
      updatesDesc: "Informasi fitur baru dan peningkatan ExploreID.",
      languageTitle: "Bahasa & Wilayah",
      languageDesc: "Atur bahasa dan preferensi wilayah.",
      displayLanguage: "Bahasa Tampilan",
      region: "Wilayah",
      preview: "Pratinjau Format Wilayah",
      dateFormat: "Format tanggal",
      numberFormat: "Format angka",
      privacyTitle: "Preferensi Privasi",
      privacyDesc: "Atur preferensi privasi untuk pengalaman kamu.",
      privateProfile: "Profil Privat",
      privateProfileDesc: "Preferensi agar profil kamu tidak ditampilkan secara publik.",
      activitySharing: "Berbagi Aktivitas",
      activitySharingDesc: "Preferensi untuk membagikan aktivitas perjalanan kamu.",
      personalized: "Konten Personal",
      personalizedDesc: "Izinkan ExploreID menyesuaikan konten berdasarkan preferensi kamu.",
      privacyNote: "Pengaturan privasi ini saat ini tersimpan di perangkat. Pengaturan ini belum mengubah kontrol akses di server Supabase.",
      emptyFavorites: "Belum ada destinasi favorit",
      emptyFavoritesDesc: "Simpan destinasi yang kamu suka dan destinasi tersebut akan muncul di sini.",
      aboutTitle: "Tentang ExploreID",
      aboutDesc: "Temukan berbagai destinasi, budaya, dan pengalaman menarik dari seluruh Indonesia.",
      version: "Versi",
      madeFor: "Dibuat untuk menjelajahi Indonesia.",
      comingSoon: "Pengaturan ini akan tersedia pada pembaruan berikutnya.",
    }
  : {
      preferences: "PREFERENCES",
      title: "Settings",
      subtitle: "Manage your account and customize your ExploreID experience.",
      account: "Account & Profile",
      favorites: "Favorites",
      notifications: "Notifications",
      language: "Language & Region",
      privacy: "Privacy",
      appearance: "Appearance",
      about: "About ExploreID",
      profileInfo: "Profile Information",
      profileDesc: "Your personal information associated with your ExploreID account.",
      accountEmail: "Account email",
      profileName: "Profile name",
      manageProfile: "Manage Profile",
      notificationTitle: "Notification Preferences",
      notificationDesc: "Choose which notifications you'd like to receive.",
      email: "Email Notifications",
      emailDesc: "Receive important information through email.",
      recommendations: "Destination Recommendations",
      recommendationsDesc: "Get notified about destinations that may interest you.",
      updates: "ExploreID Updates",
      updatesDesc: "Receive updates about new features and improvements.",
      languageTitle: "Language & Region",
      languageDesc: "Set your preferred language and regional preferences.",
      displayLanguage: "Display Language",
      region: "Region",
      preview: "Regional Format Preview",
      dateFormat: "Date format",
      numberFormat: "Number format",
      privacyTitle: "Privacy Preferences",
      privacyDesc: "Manage your privacy preferences for your experience.",
      privateProfile: "Private Profile",
      privateProfileDesc: "Preference to keep your profile from public display.",
      activitySharing: "Activity Sharing",
      activitySharingDesc: "Preference for sharing your travel activity.",
      personalized: "Personalized Content",
      personalizedDesc: "Allow ExploreID to adjust content based on your preferences.",
      privacyNote: "These privacy settings are currently stored on this device. They do not yet change access controls on the Supabase server.",
      emptyFavorites: "No favorites yet",
      emptyFavoritesDesc: "Save destinations you love, and they'll appear here.",
      aboutTitle: "About ExploreID",
      aboutDesc: "Discover destinations, culture, and exciting experiences across Indonesia.",
      version: "Version",
      madeFor: "Made for exploring Indonesia.",
      comingSoon: "This setting will be available in a future update.",
    };

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
      const saved = localStorage.getItem(
        "exploreid-recently-viewed"
      );
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

  const destination = selected;
  const controller = new AbortController();

    async function fetchWeather() {
      setWeather(null);
      setWeatherError("");
      setWeatherLoading(true);

      try {
        const [latitude, longitude] = destination.position;

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

  const destination = selected;
  let active = true;

    async function loadReviews() {
      setReviews([]);
      setReviewError("");
      setReviewSuccess("");

      const { data, error } = await supabase
        .from("destination_reviews")
        .select("*")
        .eq("destination_id", destination.id)
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
          maxBudget === "All" ||
          item.budget <= Number(maxBudget);

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

  // EXPLORE CATEGORY SECTIONS
  const exploreSections = useMemo(() => {
    const popular = filteredDestinations.slice(0, 6);

    const categories = Array.from(
      new Set(filteredDestinations.map((item) => item.category))
    );

    const categorySections = categories.map((category) => ({
      title: category,
      items: filteredDestinations.filter(
        (item) => item.category === category
      ),
    }));

    return [
      {
        title: "Popular Destinations",
        items: popular,
      },
      ...categorySections.filter(
        (section) => section.items.length > 0
      ),
    ];
  }, [filteredDestinations]);

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
      .sort((a, b) => a.distance - b.distance);
  }, [selected, destinations]);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce(
          (total, review) => total + review.rating,
          0
        ) / reviews.length
      : 0;

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
  async function openDetail(
    item: Destination,
    withTransition = false
  ) {
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
    setWeather(null);
    setWeatherError("");
    setReviews([]);
    setReviewError("");
    setReviewSuccess("");
    setReviewComment("");
    setReviewRating(5);

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

          <div className="card-image-overlay">
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
          </div>

          <button
            className={`heart-button ${saved ? "saved" : ""}`}
            onClick={() => toggleFavorite(item.id)}
            aria-label="Save favorite"
          >
            {saved ? "♥" : "♡"}
          </button>
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
            className={
              page === "home" && activeHomeSection === "home"
                ? "nav-active"
                : ""
            }
            onClick={() => navigate("home")}
          >
            Home
          </button>

          <button
            className={
              page === "home" && activeHomeSection === "explore"
                ? "nav-active"
                : ""
            }
            onClick={() => navigate("explore")}
          >
            Explore
          </button>

<button
  className={page === "map" ? "nav-active" : ""}
  onClick={() => navigate("map")}
>
  Map
</button>
<button
  className={page === "for-you" ? "nav-active" : ""}
  onClick={() => navigate("for-you")}
>
  For You
</button>

          <button
            className={page === "recently-viewed" ? "nav-active" : ""}
            onClick={() => navigate("recently-viewed")}
          >
            Recent
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
    aria-label="Search"
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
      placeholder="Cari destinasi..."
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
            title="Settings"
        >
          ⚙
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
            {/* HERO */}
            <section className="hero hero-discover">

              <img
                className="hero-background"
                src="https://images.unsplash.com/photo-1650445332429-75ceee3f3226?auto=format&fit=crop&w=2400&q=95"
                alt="Pemandangan kepulauan Raja Ampat, Papua Barat"
              />

              <div className="hero-overlay" />
              <div className="hero-warm-glow" />

              <div className="hero-content">
                <span className="hero-eyebrow">
                  A JOURNEY THROUGH THE ARCHIPELAGO
                </span>

                <h1
                  className="hero-interactive-title"
                  aria-label="DISCOVER INDONESIA"
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
                  <span className="hero-interactive-word" aria-hidden="true">
                    {Array.from("DISCOVER").map((letter, index) => (
                      <span
                        className="hero-title-letter"
                        key={`discover-${index}`}
                      >
                        {letter}
                      </span>
                    ))}
                  </span>
                  <br />
                  <span className="hero-interactive-word" aria-hidden="true">
                    {Array.from("INDONESIA").map((letter, index) => (
                      <span
                        className="hero-title-letter"
                        key={`indonesia-${index}`}
                      >
                        {letter}
                      </span>
                    ))}
                  </span>
                </h1>

                <p>{homeWelcome.description}</p>

                <button
                  className="hero-button"
                  onClick={() => navigate("explore")}
                >
                  Explore <span>→</span>
                </button>
              </div>

              <div
                className="hero-destination-rail"
                aria-label="Pilihan destinasi Indonesia"
              >
                {destinations.map((item) => (
                  <button
                    className="hero-destination-card"
                    key={item.id}
                    onClick={() => openDetail(item)}
                    title={`Lihat ${item.name}`}
                  >
                    <img src={item.image} alt={item.name} loading="lazy" />
                    <span className="hero-card-location">{item.location}</span>
                    <strong>{item.name}</strong>
                    <span className="hero-card-arrow">↗</span>
                  </button>
                ))}
              </div>

              <div className="hero-scroll">
                SCROLL TO EXPLORE <span>↓</span>
              </div>
            </section>

            {/* HOME INTRODUCTION */}
            <section
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
                  <span className="eyebrow">ABOUT INDONESIA</span>
                  <h2
                    style={{
                      maxWidth: "900px",
                      margin: "18px 0 20px",
                      lineHeight: 1.15,
                    }}
                  >
                    {homeWelcome.introTitle}
                  </h2>

                  <div
                    className="home-intro-copy"
                    style={{
                      maxWidth: "1120px",
                      color: "#68758a",
                      fontSize: "17px",
                      lineHeight: 1.85,
                    }}
                  >
                    <p style={{ margin: "0 0 14px" }}>
                      Indonesia adalah negara kepulauan yang membentang luas di
                      antara Samudra Hindia dan Samudra Pasifik. Dari Sabang
                      hingga Merauke, ribuan pulau membentuk bentang alam yang
                      begitu beragam. Setiap wilayah memiliki karakter, suasana,
                      dan keistimewaannya sendiri, menjadikan Indonesia sebagai
                      tempat yang selalu menarik untuk dijelajahi.
                    </p>

                    <p style={{ margin: "0 0 14px" }}>
                      Perjalanan di Indonesia dapat membawa siapa pun menikmati
                      pantai dengan garis laut yang panjang, pulau-pulau tropis
                      dengan air yang jernih, pegunungan yang diselimuti kabut,
                      danau yang tenang, hingga hutan alami yang menyimpan
                      keanekaragaman hayati. Ada tempat untuk mencari
                      ketenangan, ada pula jalur petualangan bagi mereka yang
                      ingin menjelajahi alam lebih dekat. Keindahan tersebut
                      hadir dengan suasana yang berbeda di setiap musim dan di
                      setiap daerah.
                    </p>

                    <p style={{ margin: "0 0 14px" }}>
                      Indonesia juga menyimpan perjalanan budaya yang tidak
                      kalah menarik. Candi dan situs bersejarah, kawasan kota
                      lama, desa tradisional, rumah adat, serta berbagai
                      peninggalan masa lalu memperlihatkan perjalanan panjang
                      masyarakat Nusantara. Mengunjungi tempat-tempat tersebut
                      bukan hanya tentang melihat bangunan atau pemandangan,
                      tetapi juga memahami cerita, nilai, dan tradisi yang terus
                      dijaga oleh masyarakat setempat.
                    </p>

                    <p style={{ margin: "0 0 14px" }}>
                      Di setiap destinasi, pengalaman perjalanan dapat terasa
                      berbeda. Menyaksikan matahari terbit dari kawasan
                      pegunungan, menyusuri pesisir dengan perahu, berjalan
                      di antara persawahan, menjelajahi pulau kecil, atau
                      menikmati suasana sebuah desa dapat menjadi bagian dari
                      cerita yang berkesan. Interaksi dengan lingkungan dan
                      masyarakat lokal juga membuat perjalanan terasa lebih
                      bermakna, sekaligus mengingatkan kita untuk menghormati
                      adat, menjaga kebersihan, dan merawat alam yang
                      dikunjungi.
                    </p>

                    <p style={{ margin: "0" }}>
                      Melalui ExploreID, kamu dapat mulai mengenal beragam
                      tempat menarik di Indonesia, menemukan inspirasi dari
                      berbagai daerah, dan mencari destinasi yang sesuai dengan
                      perjalanan impianmu. Jelajahi informasi setiap tempat,
                      kenali keunikan wilayahnya, lalu rencanakan perjalanan
                      dengan lebih matang. Karena setiap sudut Indonesia
                      memiliki cerita, dan selalu ada pengalaman baru yang
                      menunggu untuk ditemukan.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* EXPLORE CATALOG */}
            <section
              id="explore-catalog"
              className="inner-page explore-page explore-catalog-section"
              style={{ scrollMarginTop: "100px" }}
            >
              <div className="section-top">
                <div>
                  <span className="eyebrow">DISCOVER INDONESIA</span>
                  <h1 className="page-title">Explore destinations</h1>
                  <p className="page-subtitle">
                    Jelajahi katalog destinasi dari berbagai daerah di Indonesia.
                  </p>
                </div>

                <span className="result-count">
                  {filteredDestinations.length} destinations
                </span>
              </div>

              {/* SEARCH */}
              <div className="search-page-input">
                <input
                  type="text"
                  placeholder="Cari nama destinasi atau lokasi..."
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
                  aria-label="Filter kategori destinasi"
                >
                  <option value="All">All Categories</option>
                  {Array.from(
                    new Set(destinations.map((item) => item.category))
                  )
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
                  aria-label="Urutkan destinasi"
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

              {/* CATEGORY CAROUSELS */}
              {filteredDestinations.length > 0 ? (
                <div className="explore-category-list">
                  {exploreSections.map((section, index) => (
                    <section
                      className="explore-category-section"
                      key={section.title}
                    >
                      <div className="explore-category-heading">
                        <div>
                          <span className="eyebrow">
                            {index === 0
                              ? "HANDPICKED PLACES"
                              : "EXPLORE BY CATEGORY"}
                          </span>

                          <h2>{section.title}</h2>

                          <p>
                            {section.items.length} destinations to discover
                          </p>
                        </div>
                      </div>

                      <div className="explore-horizontal-wrap">
                        <div className="explore-horizontal-track">
                          {section.items.map((item) =>
                            renderDestinationCard(item)
                          )}
                        </div>
                      </div>
                    </section>
                  ))}
                </div>
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
            </section>
          </>
        )}

        {/* DESTINATION DETAIL */}
        {page === "detail" && selected && (
          <section
            key={selected.id}
            className={`inner-page destination-detail-page ${
              detailPhase === "exit"
                ? "detail-exit"
                : detailPhase === "enter"
                ? "detail-enter"
                : ""
            }`}
          >
            <button
              className="back-button"
              onClick={() => navigate("explore")}
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
                    Estimasi biaya dapat berubah sesuai kebijakan pengelola
                    dan kebutuhan perjalanan.
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
                    Kenali informasi penting tentang {selected.name} sebelum
                    merencanakan perjalanan.
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
                      Perkiraan biaya berdasarkan katalog ExploreID, bukan harga
                      tiket resmi.
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

            {/* TICKET INFORMATION - ticketInformation DATA */}
            <section className="ticket-information-section">
              <div className="section-top">
                <div>
                  <span className="eyebrow">TICKET INFORMATION</span>
                  <h2>Plan your visit</h2>
                  <p>
                    Informasi tiket untuk {selected.name}. Periksa informasi
                    terbaru sebelum berkunjung.
                  </p>
                </div>
              </div>

              <div className="ticket-information-card">
                <div className="ticket-information-icon">🎟️</div>

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
                    Harga dan ketersediaan tiket mengikuti informasi dari
                    pengelola.
                  </p>
                </div>
              </div>
            </section>

            {/* TICKET INFORMATION - SELECTED DESTINATION DATA */}
            <section className="ticket-information-section">
              <div className="section-top">
                <div>
                  <span className="eyebrow">TICKET INFORMATION</span>
                  <h2>Plan your visit</h2>
                  <p>
                    Informasi tiket untuk {selected.name}. Periksa informasi
                    terbaru sebelum berkunjung.
                  </p>
                </div>
              </div>

              <div className="ticket-information-card">
                <div className="ticket-information-icon">🎟️</div>

                <div className="ticket-information-content">
                  <span>OFFICIAL TICKET PRICE</span>

                  <h3>
                    {selected.ticketPrice || "Informasi belum tersedia"}
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

            {/* TICKET INFORMATION - SECOND EXISTING SECTION */}
            <section className="ticket-information-section">
              <div className="section-top">
                <div>
                  <span className="eyebrow">TICKET INFORMATION</span>
                  <h2>Plan your visit</h2>
                  <p>
                    Informasi tiket untuk {selected.name}. Periksa informasi
                    terbaru sebelum berkunjung.
                  </p>
                </div>
              </div>

              <div className="ticket-information-card">
                <div className="ticket-information-icon">🎟️</div>

                <div className="ticket-information-content">
                  <span>OFFICIAL TICKET PRICE</span>

                  <h3>
                    {selected.ticketPrice || "Informasi belum tersedia"}
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
                        Hal menarik yang menjadi daya tarik utama destinasi ini.
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
                        Aktivitas yang dapat kamu pertimbangkan saat berkunjung.
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
                        Beberapa hal yang perlu diperhatikan sebelum dan
                        selama perjalanan.
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
                  <p>Foto utama destinasi dari katalog ExploreID.</p>
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

                      <div className="card-image-overlay">
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
                            onClick={() => openDetail(item, true)}
                          >
                            Explore destination ↗
                          </button>
                        </div>
                      </div>
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
                  <p>Kondisi cuaca terkini di {selected.name}.</p>
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
                    onClick={() =>
                      setWeatherRetry((prev) => prev + 1)
                    }
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
                  <p>Lihat penilaian dan pengalaman pengguna lainnya.</p>
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
            <p className="page-subtitle">Destinasi yang kamu simpan.</p>

            <div className="destination-grid">
              {favoriteDestinations.length > 0 ? (
                favoriteDestinations.map((item) =>
                  renderDestinationCard(item)
                )
              ) : (
                <div className="empty-state">
                  <div className="empty-heart">♡</div>
                  <h3>Your list is waiting</h3>
                  <p>Tekan ikon hati pada destinasi untuk menyimpannya.</p>
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
                  <p>Destinasi yang kamu buka akan muncul di sini.</p>
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

{page === "settings" && (
  <section className="inner-page settings-page">
    <span className="eyebrow">{st.preferences}</span>

    <h1 className="page-title">{st.title}</h1>

    <p className="page-subtitle">{st.subtitle}</p>

    <div className="settings-layout">
      {/* SIDEBAR */}
      <aside className="settings-sidebar">
        <button
          className={`settings-category ${
            settingsCategory === "Account & Profile" ? "active" : ""
          }`}
          onClick={() => setSettingsCategory("Account & Profile")}
        >
          {st.account}
        </button>

        <button
          className={`settings-category ${
            settingsCategory === "Favorites" ? "active" : ""
          }`}
          onClick={() => setSettingsCategory("Favorites")}
        >
          {st.favorites}
          <span className="settings-category-count">
            {favorites.length}
          </span>
        </button>

        <button
          className={`settings-category ${
            settingsCategory === "Notifications" ? "active" : ""
          }`}
          onClick={() => setSettingsCategory("Notifications")}
        >
          {st.notifications}
        </button>

        <button
          className={`settings-category ${
            settingsCategory === "Language & Region" ? "active" : ""
          }`}
          onClick={() => setSettingsCategory("Language & Region")}
        >
          {st.language}
        </button>

        <button
          className={`settings-category ${
            settingsCategory === "Privacy" ? "active" : ""
          }`}
          onClick={() => setSettingsCategory("Privacy")}
        >
          {st.privacy}
        </button>

        <button
          className={`settings-category ${
            settingsCategory === "Appearance" ? "active" : ""
          }`}
          onClick={() => setSettingsCategory("Appearance")}
        >
          {st.appearance}
        </button>

        <button
          className={`settings-category ${
            settingsCategory === "About" ? "active" : ""
          }`}
          onClick={() => setSettingsCategory("About")}
        >
          {st.about}
        </button>
      </aside>

      {/* CONTENT */}
      <div className="settings-content">

        {/* ACCOUNT */}
        {settingsCategory === "Account & Profile" && (
          <div className="settings-account">
            <h2>{st.profileInfo}</h2>

            <p className="settings-description">
              {st.profileDesc}
            </p>

            <div className="settings-profile-card">
              <div className="settings-profile-avatar">
                {profileAvatar ? (
                  <img src={profileAvatar} alt="Profile" />
                ) : (
                  accountInitials
                )}
              </div>

              <div className="settings-profile-info">
                <h3>
                  {user?.user_metadata?.full_name || "ExploreID User"}
                </h3>
                <p>{user?.email || "No email available"}</p>
              </div>
            </div>

            <div className="settings-info-row">
              <span>{st.accountEmail}</span>
              <strong>{user?.email || "-"}</strong>
            </div>

            <div className="settings-info-row">
              <span>{st.profileName}</span>
              <strong>
                {user?.user_metadata?.full_name || "Not set"}
              </strong>
            </div>

            <button
              className="settings-edit-button"
              onClick={() => navigate("profile")}
            >
              {st.manageProfile}
            </button>
          </div>
        )}

        {/* FAVORITES */}
        {settingsCategory === "Favorites" && (
          <div className="settings-favorites">
            <h2>{st.favorites}</h2>

            <p className="settings-description">
              {st.emptyFavoritesDesc}
            </p>

            {favoriteDestinations.length === 0 ? (
              <div className="settings-empty-favorites">
                <span>♡</span>
                <h3>{st.emptyFavorites}</h3>
                <p>{st.emptyFavoritesDesc}</p>
              </div>
            ) : (
              <div className="destination-grid">
                {favoriteDestinations.map((destination) =>
                  renderDestinationCard(destination)
                )}
              </div>
            )}
          </div>
        )}

        {/* NOTIFICATIONS */}
        {settingsCategory === "Notifications" && (
          <div className="settings-notifications">
            <h2>{st.notificationTitle}</h2>

            <p className="settings-description">
              {st.notificationDesc}
            </p>

            <div className="settings-option-row">
              <div className="settings-option-info">
                <h3>{st.email}</h3>
                <p>{st.emailDesc}</p>
              </div>

              <label className="settings-switch">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) =>
                    setEmailNotifications(e.target.checked)
                  }
                />
                <span className="settings-switch-slider"></span>
              </label>
            </div>

            <div className="settings-option-row">
              <div className="settings-option-info">
                <h3>{st.recommendations}</h3>
                <p>{st.recommendationsDesc}</p>
              </div>

              <label className="settings-switch">
                <input
                  type="checkbox"
                  checked={recommendationNotifications}
                  onChange={(e) =>
                    setRecommendationNotifications(e.target.checked)
                  }
                />
                <span className="settings-switch-slider"></span>
              </label>
            </div>

            <div className="settings-option-row">
              <div className="settings-option-info">
                <h3>{st.updates}</h3>
                <p>{st.updatesDesc}</p>
              </div>

              <label className="settings-switch">
                <input
                  type="checkbox"
                  checked={updateNotifications}
                  onChange={(e) =>
                    setUpdateNotifications(e.target.checked)
                  }
                />
                <span className="settings-switch-slider"></span>
              </label>
            </div>
          </div>
        )}

        {/* LANGUAGE & REGION */}
        {settingsCategory === "Language & Region" && (
          <div className="settings-language">
            <h2>{st.languageTitle}</h2>

            <p className="settings-description">
              {st.languageDesc}
            </p>

            <div className="settings-field">
              <label htmlFor="settings-language">
                {st.displayLanguage}
              </label>

              <select
                id="settings-language"
                value={settingsLanguage}
                onChange={(e) =>
                  setSettingsLanguage(e.target.value)
                }
              >
                <option value="English">English</option>
                <option value="Indonesia">Bahasa Indonesia</option>
              </select>
            </div>

            <div className="settings-field">
              <label htmlFor="settings-region">{st.region}</label>

              <select
                id="settings-region"
                value={settingsRegion}
                onChange={(e) =>
                  setSettingsRegion(e.target.value)
                }
              >
                <option value="Indonesia">Indonesia</option>
                <option value="Malaysia">Malaysia</option>
                <option value="Singapore">Singapore</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Japan">Japan</option>
              </select>
            </div>

            <div className="settings-region-preview">
              <h3>{st.preview}</h3>

              <div className="settings-info-row">
                <span>{st.dateFormat}</span>

                <strong>
                  {new Date(2026, 10, 22).toLocaleDateString(
                    getRegionLocale(settingsRegion),
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </strong>
              </div>

              <div className="settings-info-row">
                <span>{st.numberFormat}</span>

                <strong>
                  {new Intl.NumberFormat(
                    getRegionLocale(settingsRegion),
                    {
                      maximumFractionDigits: 2,
                    }
                  ).format(1234567.89)}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* PRIVACY */}
        {settingsCategory === "Privacy" && (
          <div className="settings-privacy">
            <h2>{st.privacyTitle}</h2>

            <p className="settings-description">
              {st.privacyDesc}
            </p>

            <div className="settings-option-row">
              <div className="settings-option-info">
                <h3>{st.privateProfile}</h3>
                <p>{st.privateProfileDesc}</p>
              </div>

              <label className="settings-switch">
                <input
                  type="checkbox"
                  checked={privateProfile}
                  onChange={(e) =>
                    setPrivateProfile(e.target.checked)
                  }
                />
                <span className="settings-switch-slider"></span>
              </label>
            </div>

            <div className="settings-option-row">
              <div className="settings-option-info">
                <h3>{st.activitySharing}</h3>
                <p>{st.activitySharingDesc}</p>
              </div>

              <label className="settings-switch">
                <input
                  type="checkbox"
                  checked={activitySharing}
                  onChange={(e) =>
                    setActivitySharing(e.target.checked)
                  }
                />
                <span className="settings-switch-slider"></span>
              </label>
            </div>

            <div className="settings-option-row">
              <div className="settings-option-info">
                <h3>{st.personalized}</h3>
                <p>{st.personalizedDesc}</p>
              </div>

              <label className="settings-switch">
                <input
                  type="checkbox"
                  checked={personalizedContent}
                  onChange={(e) =>
                    setPersonalizedContent(e.target.checked)
                  }
                />
                <span className="settings-switch-slider"></span>
              </label>
            </div>

            <p className="settings-description">
              {st.privacyNote}
            </p>
          </div>
        )}

        {/* APPEARANCE */}
        {settingsCategory === "Appearance" && (
          <div className="settings-placeholder">
            <h2>{st.appearance}</h2>
            <p className="settings-description">
              {st.comingSoon}
            </p>
          </div>
        )}

        {/* ABOUT */}
        {settingsCategory === "About" && (
          <div className="settings-about">
            <h2>{st.aboutTitle}</h2>

            <p className="settings-description">
              {st.aboutDesc}
            </p>

            <div className="settings-info-row">
              <span>{st.version}</span>
              <strong>1.0.0</strong>
            </div>

            <div className="settings-info-row">
              <span>ExploreID</span>
              <strong>Indonesia</strong>
            </div>

            <p className="settings-description">
              {st.madeFor}
            </p>
          </div>
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
              Temukan berbagai destinasi menarik di Indonesia. Klik marker
              untuk melihat detail tempat.
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


            <div className="destination-grid compact-destination-grid">
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
