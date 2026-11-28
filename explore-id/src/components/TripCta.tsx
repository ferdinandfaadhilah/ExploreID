import { useLanguage } from "../hooks/useLanguage";
import BallPit from "./BallPit";
import Reveal from "./Reveal";

const COPY = {
  English: {
    micro: "GOT A TRIP IN MIND?",
    line1: "Let's Explore",
    line2: "Indonesia",
    cont: "Continue to scroll",
  },
  Indonesia: {
    micro: "PUNYA RENCANA LIBURAN?",
    line1: "Ayo Jelajahi",
    line2: "Nusantara",
    cont: "Terus scroll",
  },
};

type TripCtaProps = {
  onContinue: () => void;
};

// Penutup halaman: judul raksasa yang naik dari balik topeng + bola jatuh menumpuk.
export default function TripCta({ onContinue }: TripCtaProps) {
  const { language } = useLanguage();
  const copy = COPY[language];

  return (
    <Reveal as="section" direction="none" className="trip-cta">
      <div className="trip-cta-inner">
        <span className="cta-plus cta-plus-a" aria-hidden="true">+</span>
        <span className="cta-plus cta-plus-b" aria-hidden="true">+</span>
        <span className="cta-plus cta-plus-c" aria-hidden="true">+</span>
        <span className="cta-plus cta-plus-d" aria-hidden="true">+</span>

        <p className="trip-cta-micro">{copy.micro}</p>

        <h2>
          <span className="cta-line">
            <span>{copy.line1}</span>
          </span>
          <span className="cta-line">
            <span>{copy.line2}</span>
          </span>
        </h2>
      </div>

      <BallPit />

      <div className="trip-cta-actions">
        <button type="button" className="cta-pill" onClick={onContinue}>
          <span aria-hidden="true">↓</span> {copy.cont} <span aria-hidden="true">↓</span>
        </button>
      </div>
    </Reveal>
  );
}
