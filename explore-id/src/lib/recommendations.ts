import { destinations, type Destination } from "../data/destinations";

const FALLBACK_CATEGORIES = ["Nature", "Adventure"];

function getRegion(item: Destination) {
  return item.location.split(",").pop()?.trim() || "";
}

// Menghitung minat pengguna dari riwayat lihat.
// Destinasi yang lebih baru dibuka mendapat bobot lebih besar.
function buildInterest(recentlyViewed: number[]) {
  const viewed = recentlyViewed
    .map((id) => destinations.find((item) => item.id === id))
    .filter((item): item is Destination => item !== undefined);

  const categoryInterest = new Map<string, number>();
  const regionInterest = new Map<string, number>();

  viewed.forEach((item, index) => {
    const weight = viewed.length - index;
    const region = getRegion(item);

    categoryInterest.set(
      item.category,
      (categoryInterest.get(item.category) || 0) + weight
    );
    regionInterest.set(region, (regionInterest.get(region) || 0) + weight);
  });

  return {
    viewedIds: new Set(viewed.map((item) => item.id)),
    categoryInterest,
    regionInterest,
  };
}

type Interest = ReturnType<typeof buildInterest>;

function scoreDestination(item: Destination, interest: Interest) {
  return (
    (interest.categoryInterest.get(item.category) || 0) * 1.5 +
    (interest.regionInterest.get(getRegion(item)) || 0) * 0.75
  );
}

/**
 * Rekomendasi acak berbobot untuk hero (berubah tiap riwayat berubah).
 * Jika `personalized` false, semua destinasi punya peluang yang sama.
 */
export function getHeroRecommendations(
  recentlyViewed: number[],
  personalized: boolean,
  limit = 12
) {
  const interest = buildInterest(personalized ? recentlyViewed : []);

  const pool = destinations
    .filter((item) => !interest.viewedIds.has(item.id))
    .map((item) => ({
      item,
      weight: 1 + scoreDestination(item, interest),
    }));

  const recommendations: Destination[] = [];
  const categoryCounts = new Map<string, number>();
  const targetCount = Math.min(limit, pool.length);

  while (pool.length > 0 && recommendations.length < targetCount) {
    // Kurangi peluang kategori yang sudah banyak terpilih agar hasilnya beragam.
    const adjusted = pool.map(
      (candidate) =>
        candidate.weight /
        (1 + (categoryCounts.get(candidate.item.category) || 0) * 0.65)
    );

    const totalWeight = adjusted.reduce((total, value) => total + value, 0);

    let randomValue = Math.random() * totalWeight;
    let selectedIndex = 0;

    for (let index = 0; index < adjusted.length; index++) {
      randomValue -= adjusted[index];

      if (randomValue <= 0) {
        selectedIndex = index;
        break;
      }
    }

    const [picked] = pool.splice(selectedIndex, 1);

    recommendations.push(picked.item);
    categoryCounts.set(
      picked.item.category,
      (categoryCounts.get(picked.item.category) || 0) + 1
    );
  }

  return recommendations;
}

/**
 * Daftar "For You": diurutkan berdasarkan skor minat (stabil, tidak diacak).
 * Tanpa riwayat atau saat personalisasi dimatikan, pakai pilihan Nature/Adventure.
 */
export function getForYouRecommendations(
  recentlyViewed: number[],
  personalized: boolean,
  limit = 12
): { items: Destination[]; isPersonalized: boolean } {
  const interest = buildInterest(personalized ? recentlyViewed : []);

  if (interest.categoryInterest.size === 0) {
    return {
      items: destinations.filter((item) =>
        FALLBACK_CATEGORIES.includes(item.category)
      ),
      isPersonalized: false,
    };
  }

  const items = destinations
    .filter((item) => !interest.viewedIds.has(item.id))
    .map((item) => ({ item, score: scoreDestination(item, interest) }))
    .sort((a, b) => b.score - a.score || a.item.id - b.item.id)
    .slice(0, limit)
    .map(({ item }) => item);

  return { items, isPersonalized: true };
}