import Button from "./ds/Button";

export default function PrimaryButton({
  children,
  to,
  type = "button",
  disabled = false,
  loading = false,
  loadingLabel = "Please wait…",
  onClick,
  className = "",
  variant = "primary",
  size = "md",
  fullWidth = false,
  ...props
}) {
  return (
    <Button
      to={to}
      type={type}
      disabled={disabled}
      loading={loading}
      loadingLabel={loadingLabel}
      onClick={onClick}
      className={className}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      {...props}
    >
      {children}
    </Button>
  );
}
