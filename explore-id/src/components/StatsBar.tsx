import { useEffect, useState } from "react";
import { destinations } from "../data/destinations";
import { useLanguage } from "../hooks/useLanguage";
import { prefersReducedMotion, useInView } from "./Reveal";

const regionOf = (location: string) => location.split(",").pop()?.trim() || "";

// Dihitung langsung dari data destinasi, jadi selalu ikut berubah.
const STATS = [
  { key: "destinations", value: destinations.length },
  {
    key: "categories",
    value: new Set(destinations.map((item) => item.category)).size,
  },
  {
    key: "regions",
    value: new Set(destinations.map((item) => regionOf(item.location))).size,
  },
] as const;

const LABELS = {
  English: {
    destinations: "Destinations",
    categories: "Categories",
    regions: "Regions",
  },
  Indonesia: {
    destinations: "Destinasi",
    categories: "Kategori",
    regions: "Wilayah",
  },
};

function CountUp({
  to,
  active,
  locale,
}: {
  to: number;
  active: boolean;
  locale: string;
}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return undefined;

    if (prefersReducedMotion()) {
      setValue(to);
      return undefined;
    }

    const duration = 1600;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setValue(Math.round(to * eased));

      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [active, to]);

  return <>{value.toLocaleString(locale)}</>;
}

// Bar statistik yang naik dari bawah, angkanya menghitung naik.
export default function StatsBar() {
  const { language, t } = useLanguage();
  const labels = LABELS[language];
  const { ref, inView } = useInView<HTMLDivElement>(0.4);

  return (
    <div className="stats-band" ref={ref}>
      <div className={`stats-bar ${inView ? "is-visible" : ""}`}>
        {STATS.map((stat) => (
          <div className="stats-item" key={stat.key}>
            <strong>
              <CountUp to={stat.value} active={inView} locale={t.locale} />
            </strong>
            <span>{labels[stat.key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
