import { AlertCircle } from "lucide-react";

export default function FormField({
  id,
  label,
  requiredMark = false,
  helperText,
  error,
  errorId,
  className = "",
  children,
}) {
  return (
    <div className={`ds-field ${className}`.trim()}>
      <label className="ds-field-label" htmlFor={id}>
        {label}
        {requiredMark && (
          <span className="ds-required-mark" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {helperText && <small className="ds-field-helper">{helperText}</small>}
      {error && (
        <small className="ds-field-error" id={errorId} role="alert">
          <AlertCircle size={15} strokeWidth={2} aria-hidden="true" focusable="false" />
          <span>{error}</span>
        </small>
      )}
    </div>
  );
}
