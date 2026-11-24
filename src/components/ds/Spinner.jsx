export default function Spinner({ size = "md", label, className = "" }) {
  const sizeClass = size !== "md" ? `ds-spinner--${size}` : "";
  return (
    <span
      className={`ds-spinner ${sizeClass} ${className}`.trim()}
      role={label ? "status" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : "true"}
    />
  );
}
