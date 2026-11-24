import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import AuthLayout from "../components/AuthLayout";
import FormField from "../components/FormField";
import AuthFeedback from "../components/AuthFeedback";
import PrimaryButton from "../components/PrimaryButton";
import { ISHARA_EASE, usePrefersReducedMotion } from "../components/ds/MotionPrimitives";
import { forgotPassword } from "../api/auth";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function ForgotPassword() {
  const reduced = usePrefersReducedMotion();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const submitting = useRef(false);

  useEffect(() => {
    document.title = "Forgot password — ISHARA AI";
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting.current) return;

    const normalizedEmail = email.trim();
    if (normalizedEmail.length > 254 || !EMAIL_PATTERN.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      setSent(false);
      return;
    }

    setError("");
    submitting.current = true;
    setLoading(true);
    try {
      await forgotPassword(normalizedEmail);
      setSent(true);
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to send the reset link. Please try again."
      );
    } finally {
      submitting.current = false;
      setLoading(false);
    }
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
          <h2 className="ds-h2">Forgot your password?</h2>
          <p className="ds-body">
            Enter your email address and we’ll send password reset instructions.
          </p>
        </header>

        {sent ? (
          <AuthFeedback variant="success">
            <p>
              If an account exists with this email, a password reset link will
              be sent.
            </p>
          </AuthFeedback>
        ) : (
          <form
            className="ds-auth-form"
            onSubmit={handleSubmit}
            noValidate
            aria-busy={loading}
          >
            {error && (
              <AuthFeedback variant="error">
                <p>{error}</p>
              </AuthFeedback>
            )}

            <FormField id="forgot-email" label="Email address">
              <input
                className="ds-input"
                id="forgot-email"
                name="email"
                type="email"
                autoComplete="email"
                maxLength={254}
                placeholder="you@example.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                disabled={loading}
                required
              />
            </FormField>

            <PrimaryButton
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              loadingLabel="Sending…"
            >
              Send reset link
            </PrimaryButton>
          </form>
        )}

        <p
          style={{
            marginBlockStart: "var(--ds-space-6)",
            textAlign: "center",
            fontSize: "0.9375rem",
          }}
        >
          <Link to="/login">Return to sign in</Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
}
