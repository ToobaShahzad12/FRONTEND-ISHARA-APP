import { Link } from "react-router-dom";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  to,
  type = "button",
  disabled = false,
  loading = false,
  loadingLabel = "Please wait…",
  onClick,
  className = "",
  ...props
}) {
  const sizeClass = size !== "md" ? `ds-btn--${size}` : "";
  const fullClass = fullWidth ? "ds-btn--full" : "";
  const classes = `ds-btn ds-btn--${variant} ${sizeClass} ${fullClass} ${className}`.trim();

  const content = loading ? (
    <>
      <span className="ds-spinner ds-spinner--sm" aria-hidden="true" />
      <span>{loadingLabel}</span>
    </>
  ) : (
    children
  );

  if (to) {
    return (
      <Link className={classes} to={to} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      aria-busy={loading || undefined}
      {...props}
    >
      {content}
    </button>
  );
}
