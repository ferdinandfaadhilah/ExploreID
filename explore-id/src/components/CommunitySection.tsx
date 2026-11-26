import type { CSSProperties } from "react";
import { useLanguage } from "../hooks/useLanguage";
import Reveal from "./Reveal";

const COPY = {
  English: {
    eyebrow: "EXPLORER COMMUNITY",
    title: "Great trips start with great company",
    desc: "Save the places you love, share your reviews, and get inspired by fellow travelers exploring every corner of the archipelago.",
    join: "Join the community",
    explore: "Keep exploring",
    bubbles: ["Best trip ever! 😍", "Where to next?", "That sunrise 🌅"],
  },
  Indonesia: {
    eyebrow: "KOMUNITAS PENJELAJAH",
    title: "Perjalanan seru dimulai dari teman seperjalanan",
    desc: "Simpan tempat favoritmu, bagikan ulasan, dan dapatkan inspirasi dari sesama pejalan yang menjelajahi tiap sudut Nusantara.",
    join: "Gabung komunitas",
    explore: "Lanjut menjelajah",
    bubbles: ["Seru banget! 😍", "Next ke mana?", "Sunrise-nya juara 🌅"],
  },
};

// Posisi (persen) avatar yang melayang di sekitar avatar utama.
const FLOATERS = [
  { emoji: "🧗", left: 14, top: 22, color: "#cfe8f5", bubble: 0 },
  { emoji: "🏄", left: 80, top: 14, color: "#ffe3c2" },
  { emoji: "📸", left: 92, top: 52, color: "#e4d9f7", bubble: 1 },
  { emoji: "🥾", left: 74, top: 86, color: "#d5f0dc" },
  { emoji: "🤿", left: 22, top: 84, color: "#cfe8f5", bubble: 2 },
  { emoji: "⛵", left: 5, top: 54, color: "#ffe3c2" },
  { emoji: "🏝️", left: 48, top: 5, color: "#d5f0dc" },
];

type CommunitySectionProps = {
  loggedIn: boolean;
  avatarUrl: string | null;
  initials: string;
  onJoin: () => void;
};

// Satu avatar besar dikelilingi avatar kecil yang melayang dan bubble obrolan.
export default function CommunitySection({
  loggedIn,
  avatarUrl,
  initials,
  onJoin,
}: CommunitySectionProps) {
  const { language } = useLanguage();
  const copy = COPY[language];

  return (
    <Reveal
      as="section"
      className="explore-section community-section"
      id="community"
    >
      <div className="community-inner">
        <div className="community-copy">
          <span className="eyebrow">{copy.eyebrow}</span>
          <h2>{copy.title}</h2>
          <p>{copy.desc}</p>

          <button type="button" className="primary-button" onClick={onJoin}>
            {loggedIn ? copy.explore : copy.join} <span>→</span>
          </button>
        </div>

        <div className="community-cluster" aria-hidden="true">
          <span className="community-ring community-ring-outer" />
          <span className="community-ring community-ring-inner" />

          <span className="community-center">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" />
            ) : loggedIn ? (
              initials
            ) : (
              "🧭"
            )}
          </span>

          {FLOATERS.map((floater, index) => (
            <span
              className="community-float"
              key={floater.emoji}
              style={
                {
                  left: `${floater.left}%`,
                  top: `${floater.top}%`,
                  "--i": index,
                  "--bg": floater.color,
                } as CSSProperties
              }
            >
              <span className="community-avatar">{floater.emoji}</span>

              {floater.bubble !== undefined && (
                <span
                  className="community-bubble"
                  style={{ "--b": floater.bubble } as CSSProperties}
                >
                  {copy.bubbles[floater.bubble]}
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
