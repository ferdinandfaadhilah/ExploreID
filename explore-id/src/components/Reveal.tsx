import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// True begitu elemen pertama kali masuk layar (hanya sekali).
export function useInView<T extends Element>(threshold = 0.15) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) return undefined;

    // Tanpa animasi jika pengguna meminta gerak dikurangi / browser lawas.
    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -6% 0px" }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

type RevealProps = {
  as?: ElementType;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "none";
  // Seberapa bagian elemen harus terlihat sebelum animasi mulai (0-1).
  threshold?: number;
  id?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

// Elemen muncul pelan (fade + geser) saat di-scroll ke dalam layar.
export default function Reveal({
  as: Tag = "div",
  className = "",
  delay = 0,
  direction = "up",
  threshold = 0.12,
  id,
  style,
  children,
}: RevealProps) {
  const { ref, inView } = useInView<HTMLElement>(threshold);

  return (
    <Tag
      ref={ref}
      id={id}
      className={`reveal reveal-${direction} ${
        inView ? "is-visible" : ""
      } ${className}`}
      style={{
        ...style,
        transitionDelay: delay ? `${delay}ms` : undefined,
      }}
    >
      {children}
    </Tag>
  );
}
