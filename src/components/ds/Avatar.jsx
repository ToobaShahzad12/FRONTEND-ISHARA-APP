export function getInitials(fullName, fallback = "I") {
  const cleaned = String(fullName || "").trim();
  if (!cleaned) return fallback;
  return (
    cleaned
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || fallback
  );
}

export default function Avatar({ name, size = "md", fallback = "I", className = "" }) {
  return (
    <span
      className={`ds-avatar ds-avatar--${size} ${className}`.trim()}
      aria-hidden="true"
    >
      {getInitials(name, fallback)}
    </span>
  );
}
