import { useLanguage } from "../hooks/useLanguage";

export type FooterPage = "home" | "explore" | "map" | "for-you" | "recently-viewed";

const COPY = {
  English: {
    explore: "EXPLORE",
    about: "ABOUT",
    blurb:
      "ExploreID helps you discover destinations, culture, and experiences across Indonesia, from Sabang to Merauke.",
    credits: "Maps © OpenStreetMap · Weather by Open-Meteo",
    top: "Back to top",
  },
  Indonesia: {
    explore: "JELAJAH",
    about: "TENTANG",
    blurb:
      "ExploreID membantu kamu menemukan destinasi, budaya, dan pengalaman dari seluruh Indonesia, dari Sabang sampai Merauke.",
    credits: "Peta © OpenStreetMap · Cuaca oleh Open-Meteo",
    top: "Kembali ke atas",
  },
};

type SiteFooterProps = {
  onNavigate: (page: FooterPage) => void;
};

// Footer berkolom dengan tautan halaman dan tombol kembali ke atas.
export default function SiteFooter({ onNavigate }: SiteFooterProps) {
  const { language, t } = useLanguage();
  const copy = COPY[language];

  const links: { page: FooterPage; label: string }[] = [
    { page: "home", label: t.nav.home },
    { page: "explore", label: t.nav.explore },
    { page: "map", label: t.nav.map },
    { page: "for-you", label: t.nav.forYou },
    { page: "recently-viewed", label: t.nav.recent },
  ];

  return (
    <footer className="site-footer">
      <div className="site-footer-grid">
        <div className="site-footer-brand">
          <button type="button" className="site-footer-logo" onClick={() => onNavigate("home")}>
            ExploreID.
          </button>

          <p>{t.footer.tagline}</p>
          <small>{copy.credits}</small>
        </div>

        <nav className="site-footer-links" aria-label={copy.explore}>
          <h4>{copy.explore}</h4>

          <ul>
            {links.map((link) => (
              <li key={link.page}>
                <button type="button" onClick={() => onNavigate(link.page)}>
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-footer-about">
          <h4>{copy.about}</h4>
          <p>{copy.blurb}</p>
        </div>
      </div>

      <div className="site-footer-bottom">
        <small>{t.footer.copyright}</small>

        <button
          type="button"
          className="to-top"
          aria-label={copy.top}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          ↑
        </button>
      </div>
    </footer>
  );
}
