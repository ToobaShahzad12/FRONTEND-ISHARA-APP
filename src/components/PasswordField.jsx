import { Check, Circle, Eye, EyeOff } from "lucide-react";
import FormField from "./FormField";

function isRequirementMet(requirement, value) {
  if (!value) return false;
  if (/8\+/i.test(requirement)) return value.length >= 8;
  if (/uppercase/i.test(requirement)) return /[A-Z]/.test(value);
  if (/number/i.test(requirement)) return /\d/.test(value);
  return false;
}

export default function PasswordField({
  id,
  label,
  name,
  value,
  onChange,
  showPassword,
  onToggleVisibility,
  autoComplete = "new-password",
  placeholder,
  disabled = false,
  required = true,
  maxLength = 128,
  error = "",
  errorId,
  requirements = [],
}) {
  const requirementsId = requirements.length ? `${id}-requirements` : undefined;
  const describedBy =
    [requirementsId, error ? errorId : undefined].filter(Boolean).join(" ") ||
    undefined;

  return (
    <FormField id={id} label={label} error={error} errorId={errorId}>
      <div className="ds-password-wrap">
        <input
          className="ds-input"
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
        />
        <button
          type="button"
          className="ds-password-toggle"
          onClick={onToggleVisibility}
          aria-label={`${showPassword ? "Hide" : "Show"} ${label.toLowerCase()}`}
          aria-pressed={showPassword}
          disabled={disabled}
        >
          {showPassword ? (
            <EyeOff size={16} strokeWidth={1.75} aria-hidden="true" />
          ) : (
            <Eye size={16} strokeWidth={1.75} aria-hidden="true" />
          )}
          <span>{showPassword ? "Hide" : "Show"}</span>
        </button>
      </div>
      {requirements.length > 0 && (
        <ul className="ds-password-rules" id={requirementsId}>
          {requirements.map((requirement) => {
            const met = isRequirementMet(requirement, value);
            return (
              <li
                key={requirement}
                className={`ds-password-rule ${met ? "is-met" : ""}`.trim()}
              >
                {met ? (
                  <Check size={14} strokeWidth={2.25} aria-hidden="true" />
                ) : (
                  <Circle size={12} strokeWidth={1.75} aria-hidden="true" />
                )}
                <span>{requirement}</span>
              </li>
            );
          })}
        </ul>
      )}
    </FormField>
  );
}
