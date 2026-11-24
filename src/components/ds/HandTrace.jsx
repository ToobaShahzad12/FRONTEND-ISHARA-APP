export default function HandTrace({
  variant = "arc",
  animated = false,
  className = "",
}) {
  const animClass = animated ? "ds-hand-trace--animated" : "";

  if (variant === "mark") {
    return (
      <svg
        className={`ds-hand-trace ${animClass} ${className}`.trim()}
        viewBox="0 0 36 36"
        width="32"
        height="32"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M5 24C9 13 15 9 19 12.5C22.5 15.5 16.5 22.5 13.5 19.5C10.8 16.8 18 10 26 14"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          style={{ "--ds-trace-length": 88 }}
        />
        <circle
          cx="28.5"
          cy="14.5"
          r="3"
          stroke="currentColor"
          strokeWidth="2.2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }

  if (variant === "arc") {
    return (
      <svg
        className={`ds-hand-trace ${animClass} ${className}`.trim()}
        viewBox="0 0 480 40"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M4 26C110 6 196 34 294 16C346 6 402 18 462 18"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ "--ds-trace-length": 480 }}
        />
        <circle
          cx="470"
          cy="18"
          r="5"
          stroke="currentColor"
          strokeWidth="2.25"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }

  if (variant === "trail") {
    return (
      <svg
        className={`ds-hand-trace ${animClass} ${className}`.trim()}
        viewBox="0 0 120 120"
        width="88"
        height="88"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M16 92C26 56 54 44 66 58C77 70 54 88 45 75C35 61 62 32 98 30"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          style={{ "--ds-trace-length": 230 }}
        />
        <circle
          cx="104"
          cy="30"
          r="5.5"
          stroke="currentColor"
          strokeWidth="2.25"
          vectorEffect="non-scaling-stroke"
        />
        <circle
          cx="22"
          cy="86"
          r="4.5"
          stroke="currentColor"
          strokeWidth="2.25"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }

  if (variant === "notfound") {
    return (
      <svg
        className={`ds-hand-trace ${animClass} ${className}`.trim()}
        viewBox="0 0 320 64"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M6 34C64 12 112 54 164 26C198 8 242 40 302 22"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ "--ds-trace-length": 340 }}
        />
        <circle
          cx="310"
          cy="20"
          r="5.5"
          stroke="currentColor"
          strokeWidth="2.25"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }

  /* Default: "loop" (4:3 large composition for Hero & Auth Brand Panel) */
  return (
    <svg
      className={`ds-hand-trace ${animClass} ${className}`.trim()}
      viewBox="0 0 400 300"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M24 252C76 154 148 112 204 142C252 168 186 238 148 206C106 170 176 74 282 72C324 71 348 86 364 102"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        style={{ "--ds-trace-length": 540 }}
      />
      <circle
        cx="372"
        cy="110"
        r="6"
        stroke="currentColor"
        strokeWidth="2.25"
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx="132"
        cy="168"
        r="5"
        stroke="currentColor"
        strokeWidth="2.25"
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx="296"
        cy="72"
        r="5"
        stroke="currentColor"
        strokeWidth="2.25"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
