import { useLanguage } from "../hooks/useLanguage";
import type { FooterPage } from "./SiteFooter";

const COPY = {
  English: { keep: "KEEP SCROLLING TO CONTINUE", next: "NEXT PAGE" },
  Indonesia: { keep: "TERUS SCROLL UNTUK LANJUT", next: "HALAMAN BERIKUTNYA" },
};

// Halaman mana yang jadi "halaman berikutnya" dari tiap halaman.
const NEXT: Record<string, { target: FooterPage; tone: "dark" | "light" }> = {
  home: { target: "map", tone: "dark" },
  map: { target: "for-you", tone: "light" },
  "for-you": { target: "recently-viewed", tone: "dark" },
  "recently-viewed": { target: "home", tone: "light" },
  favorites: { target: "home", tone: "dark" },
  search: { target: "map", tone: "light" },
};

type NextPagePanelProps = {
  page: string;
  onGo: (page: FooterPage) => void;
};

// Panel besar di dasar halaman yang menyambung ke halaman berikutnya.
export default function NextPagePanel({ page, onGo }: NextPagePanelProps) {
  const { language, t } = useLanguage();
  const copy = COPY[language];
  const next = NEXT[page];

  if (!next) return null;

  const titles: Record<FooterPage, string> = {
    home: t.nav.home,
    explore: t.nav.explore,
    map: t.nav.map,
    "for-you": t.nav.forYou,
    "recently-viewed": t.nav.recent,
  };

  return (
    <button
      type="button"
      id="next-page"
      className={`next-panel next-panel-${next.tone}`}
      onClick={() => onGo(next.target)}
    >
      <span className="next-micro">↓ {copy.keep}</span>

      <span className="next-bottom">
        <span className="next-title">{titles[next.target]}</span>

        <span className="next-link">
          {copy.next}
          <i aria-hidden="true" />
          <b aria-hidden="true">→</b>
        </span>
      </span>
    </button>
  );
}
