import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import AuthFeedback from "../components/AuthFeedback";
import AuthLayout from "../components/AuthLayout";
import PasswordField from "../components/PasswordField";
import PrimaryButton from "../components/PrimaryButton";
import { ISHARA_EASE, usePrefersReducedMotion } from "../components/ds/MotionPrimitives";
import { resetPassword } from "../api/auth";

const PASSWORD_REQUIREMENTS = [
  "8+ characters",
  "1 uppercase letter",
  "1 number",
];

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  useEffect(() => {
    document.title = "Reset password — ISHARA AI";
  }, []);

  return <ResetPasswordForm key={token} token={token} />;
}

function ResetPasswordForm({ token }) {
  const reduced = usePrefersReducedMotion();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errors, setErrors] = useState({});
  const [requestError, setRequestError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const submitting = useRef(false);

  function validate() {
    const nextErrors = {};
    if (password.length < 8 || password.length > 128) {
      nextErrors.password = "Use between 8 and 128 characters.";
    } else if (!/[A-Z]/.test(password)) {
      nextErrors.password = "Include at least one uppercase letter.";
    } else if (!/\d/.test(password)) {
      nextErrors.password = "Include at least one number.";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your new password.";
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    return nextErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting.current) return;

    const nextErrors = validate();
    setErrors(nextErrors);
    setRequestError("");
    if (Object.keys(nextErrors).length || !token) {
      if (!token)
        setRequestError("This password reset link is invalid or expired.");
      return;
    }

    submitting.current = true;
    setLoading(true);
    try {
      const response = await resetPassword({ token, new_password: password });
      setSuccessMessage(
        response.message || "Password reset successfully. You can now sign in."
      );
    } catch (error) {
      setRequestError(
        error.message || "This password reset link is invalid or expired."
      );
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  }

  function updateField(field, setter) {
    return (event) => {
      setter(event.target.value);
      setErrors((current) => ({ ...current, [field]: "" }));
      setRequestError("");
    };
  }

  return (
    <AuthLayout>
      <motion.div
        className="ds-auth-card ish-auth-card ish-simple-auth-card"
        style={{ animation: "none" }}
        initial={reduced ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0.01 : 0.34, ease: ISHARA_EASE }}
      >
        <header className="ds-auth-heading">
          <h2 className="ds-h2">Reset your password</h2>
          <p className="ds-body">
            Choose a new password for your Ishara AI account.
          </p>
        </header>

        {successMessage ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-5)" }}>
            <AuthFeedback variant="success">
              <p>{successMessage}</p>
            </AuthFeedback>
            <PrimaryButton to="/login" fullWidth size="lg">
              Return to sign in
            </PrimaryButton>
          </div>
        ) : !token ? (
          <AuthFeedback variant="error">
            <p>This password reset link is invalid or expired.</p>
          </AuthFeedback>
        ) : (
          <form
            className="ds-auth-form"
            onSubmit={handleSubmit}
            noValidate
            aria-busy={loading}
          >
            {requestError && (
              <AuthFeedback variant="error">
                <p>{requestError}</p>
              </AuthFeedback>
            )}

            <PasswordField
              id="reset-password"
              name="new_password"
              label="New password"
              autoComplete="new-password"
              maxLength={128}
              placeholder="Create a new password"
              value={password}
              onChange={updateField("password", setPassword)}
              showPassword={showPassword}
              onToggleVisibility={() => setShowPassword((visible) => !visible)}
              disabled={loading}
              error={errors.password}
              errorId="reset-password-error"
              requirements={PASSWORD_REQUIREMENTS}
            />

            <PasswordField
              id="reset-confirm-password"
              name="confirm_password"
              label="Confirm new password"
              autoComplete="new-password"
              maxLength={128}
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChange={updateField("confirmPassword", setConfirmPassword)}
              showPassword={showConfirmation}
              onToggleVisibility={() =>
                setShowConfirmation((visible) => !visible)
              }
              disabled={loading}
              error={errors.confirmPassword}
              errorId="reset-confirm-error"
            />

            <PrimaryButton
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              loadingLabel="Resetting password…"
            >
              Reset password
            </PrimaryButton>
          </form>
        )}

        {!successMessage && (
          <p
            style={{
              marginBlockStart: "var(--ds-space-6)",
              textAlign: "center",
              fontSize: "0.9375rem",
            }}
          >
            <Link to="/login">Return to sign in</Link>
          </p>
        )}
      </motion.div>
    </AuthLayout>
  );
}
