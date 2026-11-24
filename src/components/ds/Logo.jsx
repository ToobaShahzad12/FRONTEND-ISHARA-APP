import { Link } from "react-router-dom";
import HandTrace from "./HandTrace";

export default function Logo({
  to,
  surface = "dark",
  ariaLabel = "ISHARA AI",
  className = "",
}) {
  const isLight = surface === "light";

  const inner = (
    <>
      <span className="ds-logo-badge" aria-hidden="true">
        <HandTrace variant="mark" />
      </span>
      <span className="ds-logo-wordmark">
        ishara<span className="ds-logo-dotai">.ai</span>
      </span>
    </>
  );

  const classes = `ds-logo ${isLight ? "ds-logo--on-light" : ""} ${className}`.trim();

  if (to) {
    return (
      <Link to={to} className={classes} aria-label={ariaLabel}>
        {inner}
      </Link>
    );
  }

  return (
    <span className={classes} aria-label={ariaLabel}>
      {inner}
    </span>
  );
}
