type EmptyStateProps = {
  icon?: string;
  title: string;
  desc: string;
  cta: string;
  onCta: () => void;
};

export default function EmptyState({ icon, title, desc, cta, onCta }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-heart">{icon}</div>}

      <h3>{title}</h3>
      <p>{desc}</p>

      <button className="primary-button" onClick={onCta}>
        {cta}
      </button>
    </div>
  );
}
