import type { CSSProperties } from "react";
import { useInView } from "./Reveal";

type ScribbleProps = {
  className?: string;
  // Jeda (ms) sebelum garis mulai digambar.
  delay?: number;
};

// Garis bawah ala coretan tangan yang "digambar" saat terlihat.
export default function ScribbleUnderline({
  className = "",
  delay = 0,
}: ScribbleProps) {
  const { ref, inView } = useInView<SVGSVGElement>(0.6);

  return (
    <svg
      ref={ref}
      className={`scribble scribble-underline ${
        inView ? "is-drawn" : ""
      } ${className}`}
      style={{ "--scribble-delay": `${delay}ms` } as CSSProperties}
      viewBox="0 0 300 14"
      aria-hidden="true"
      focusable="false"
    >
      <path
        pathLength={1}
        d="M4 8 C 40 2, 74 13, 112 7 S 190 1.5, 228 8 S 276 11, 296 4"
      />
    </svg>
  );
}

// Tiga goresan pendek memancar, seperti doodle "kilau" di sudut judul.
export function ScribbleBurst({ className = "", delay = 0 }: ScribbleProps) {
  const { ref, inView } = useInView<SVGSVGElement>(0.6);

  return (
    <svg
      ref={ref}
      className={`scribble scribble-burst ${
        inView ? "is-drawn" : ""
      } ${className}`}
      style={{ "--scribble-delay": `${delay}ms` } as CSSProperties}
      viewBox="0 0 60 60"
      aria-hidden="true"
      focusable="false"
    >
      <path pathLength={1} d="M30 6 L30 24" />
      <path pathLength={1} d="M8 20 L23 31" />
      <path pathLength={1} d="M52 20 L37 31" />
    </svg>
  );
}
