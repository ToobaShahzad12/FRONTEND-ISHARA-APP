import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthFeedback from "../components/AuthFeedback";
import AuthLayout from "../components/AuthLayout";
import FormField from "../components/FormField";
import PasswordField from "../components/PasswordField";
import PrimaryButton from "../components/PrimaryButton";
import GoogleIdentityButton from "../components/GoogleIdentityButton";
import { googleLogin, signupUser } from "../api/auth";
import { IS_DEMO_MODE } from "../api/demoStore";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_REQUIREMENTS = [
  "8+ characters",
  "1 uppercase letter",
  "1 number",
];
const HAS_GOOGLE_AUTH =
  !IS_DEMO_MODE && Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim());

function validateSignup({ fullName, email, password, confirmPassword }) {
  const errors = {};
  const cleanName = fullName.trim();
  const cleanEmail = email.trim();
  if (cleanName.length < 2 || cleanName.length > 100)
    errors.fullName = "Enter your full name (2–100 characters).";
  if (cleanEmail.length > 254 || !EMAIL_PATTERN.test(cleanEmail))
    errors.email = "Enter a valid email address.";
  if (password.length < 8 || password.length > 128)
    errors.password = "Use between 8 and 128 characters.";
  else if (!/[A-Z]/.test(password) || !/\d/.test(password))
    errors.password = "Include at least one uppercase letter and one number.";
  if (!confirmPassword) errors.confirmPassword = "Please confirm your password.";
  else if (confirmPassword !== password)
    errors.confirmPassword = "Passwords do not match.";
  return errors;
}

export default function Signup() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const submitting = useRef(false);

  useEffect(() => {
    document.title = "Create account — ISHARA AI";
  }, []);

  async function handleSignup(event) {
    event.preventDefault();
    if (submitting.current) return;
    setSubmitError("");
    setSuccessMessage("");
    const nextErrors = validateSignup({
      fullName,
      email,
      password,
      confirmPassword,
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    submitting.current = true;
    setLoading(true);
    try {
      const destination = email.trim();
      const response = await signupUser({
        full_name: fullName.trim(),
        email: destination,
        password,
      });
      setRegisteredEmail(destination);
      setSuccessMessage(
        response.message ||
          "Your account was created. A verification email was sent."
      );
    } catch (error) {
      setSubmitError(
        error.status === 409
          ? "This email is already registered. If the account is verified, sign in; otherwise, verification resend and email correction are not currently available."
          : error.message || "Unable to create your account. Please try again."
      );
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  }

  async function handleGoogleSignup(credential) {
    if (submitting.current) return;
    submitting.current = true;
    setSubmitError("");
    setGoogleLoading(true);
    try {
      const result = await googleLogin(credential);
      navigate(result.user?.role === "admin" ? "/admin" : "/dashboard", {
        replace: true,
      });
    } catch (error) {
      setSubmitError(
        error.status === 409
          ? "An account already uses this email. Sign in with that account, then explicitly link Google from Profile / Settings."
          : error.status === 401
            ? "Google could not verify this sign-in. Choose an account and try again."
            : error.status === 503
              ? "Google sign-up is temporarily unavailable. Check your connection and try again."
              : error.message || "Google sign-up failed. Please try again."
      );
    } finally {
      submitting.current = false;
      setGoogleLoading(false);
    }
  }

  function clearGoogleError() {
    setSubmitError("");
  }

  function updateField(field, setter) {
    return (event) => {
      setter(event.target.value);
      setErrors((current) => ({ ...current, [field]: "" }));
      setSubmitError("");
    };
  }

  return (
    <AuthLayout pageClassName="ish-signup-page">
      <div className="ds-auth-form-inner ish-signup-card">
        <header className="ds-auth-heading">
          <h2 className="ds-h2">Create your account</h2>
          <p className="ds-body">
            Join Ishara AI and make communication more accessible
          </p>
        </header>

        {successMessage ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-4)" }}>
            <AuthFeedback variant={IS_DEMO_MODE ? "info" : "success"}>
              <p>{successMessage}</p>
              <p>
                Destination: <strong>{registeredEmail}</strong>
              </p>
              {!IS_DEMO_MODE && (
                <>
                  <p>
                    Check your Inbox and Spam/Junk folder for the verification link.
                    Your email address is not verified until you open that link.
                  </p>
                  <p>
                    If this address is incorrect or inaccessible, email correction
                    and verification resend are not currently available.
                  </p>
                </>
              )}
            </AuthFeedback>
            <PrimaryButton to="/login" fullWidth size="md">
              Return to sign in
            </PrimaryButton>
          </div>
        ) : (
          <>
            <form
              className="ds-auth-form ds-auth-form--compact"
              onSubmit={handleSignup}
              noValidate
              aria-busy={loading || googleLoading}
            >
              {submitError && (
                <AuthFeedback variant="error">
                  <p>{submitError}</p>
                </AuthFeedback>
              )}

              <FormField
                id="signup-full-name"
                label="Full name"
                error={errors.fullName}
                errorId="signup-name-error"
              >
                <input
                  className="ds-input"
                  id="signup-full-name"
                  name="full_name"
                  type="text"
                  autoComplete="name"
                  required
                  maxLength={100}
                  placeholder="Your full name"
                  value={fullName}
                  onChange={updateField("fullName", setFullName)}
                  disabled={loading || googleLoading}
                  aria-invalid={Boolean(errors.fullName)}
                  aria-describedby={
                    errors.fullName ? "signup-name-error" : undefined
                  }
                />
              </FormField>

              <FormField
                id="signup-email"
                label="Email address"
                error={errors.email}
                errorId="signup-email-error"
              >
                <input
                  className="ds-input"
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  placeholder="you@example.com"
                  value={email}
                  onChange={updateField("email", setEmail)}
                  disabled={loading || googleLoading}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={
                    errors.email ? "signup-email-error" : undefined
                  }
                />
              </FormField>

              <PasswordField
                id="signup-password"
                name="password"
                label="Password"
                placeholder="Create a password"
                value={password}
                onChange={updateField("password", setPassword)}
                showPassword={showPassword}
                onToggleVisibility={() =>
                  setShowPassword((visible) => !visible)
                }
                disabled={loading || googleLoading}
                error={errors.password}
                errorId="signup-password-error"
                requirements={PASSWORD_REQUIREMENTS}
              />

              <PasswordField
                id="signup-confirm-password"
                name="confirm_password"
                label="Confirm password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={updateField("confirmPassword", setConfirmPassword)}
                showPassword={showConfirmPassword}
                onToggleVisibility={() =>
                  setShowConfirmPassword((visible) => !visible)
                }
                disabled={loading || googleLoading}
                error={errors.confirmPassword}
                errorId="signup-confirm-error"
              />

              <PrimaryButton
                type="submit"
                fullWidth
                size="md"
                loading={loading}
                loadingLabel="Creating account…"
              >
                Create account
              </PrimaryButton>
            </form>

            {HAS_GOOGLE_AUTH && (
              <>
                <div className="ds-or-divider">OR SIGN UP WITH GOOGLE</div>

                <GoogleIdentityButton
                  className="ish-login-google"
                  buttonText="sign_up_with"
                  onCredential={handleGoogleSignup}
                  onCancelled={() =>
                    setSubmitError(
                      "Google sign-up was cancelled. Choose an account to try again, or create an account with email and password."
                    )
                  }
                  onError={setSubmitError}
                  onStart={clearGoogleError}
                  disabled={loading || googleLoading}
                />
              </>
            )}

            <p className="ds-auth-footer-note">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
