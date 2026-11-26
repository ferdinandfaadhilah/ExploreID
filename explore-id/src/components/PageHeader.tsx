import Reveal from "./Reveal";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
};

// Judul halaman yang muncul bertahap (eyebrow, judul, lalu subjudul).
export default function PageHeader({
  eyebrow,
  title,
  subtitle,
}: PageHeaderProps) {
  return (
    <>
      <Reveal as="span" className="eyebrow">
        {eyebrow}
      </Reveal>

      <Reveal as="h1" className="page-title" delay={80}>
        {title}
      </Reveal>

      <Reveal as="p" className="page-subtitle" delay={160}>
        {subtitle}
      </Reveal>
    </>
  );
}
