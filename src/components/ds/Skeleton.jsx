export default function Skeleton({
  width = "100%",
  height = "1.25rem",
  className = "",
}) {
  return (
    <span
      className={`ds-skeleton ${className}`.trim()}
      style={{ inlineSize: width, blockSize: height }}
      aria-hidden="true"
    />
  );
}
