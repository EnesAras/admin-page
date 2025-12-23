export default function EmptyState({ title, description }) {
  return (
    <div className="empty-state-panel">
      <p className="empty-state-title">{title}</p>
      {description && (
        <p className="empty-state-description">{description}</p>
      )}
    </div>
  );
}
