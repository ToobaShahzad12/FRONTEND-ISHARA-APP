import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthFeedback from "../components/AuthFeedback";
import AuthLayout from "../components/AuthLayout";
import FormField from "../components/FormField";
import PasswordField from "../components/PasswordField";
import PrimaryButton from "../components/PrimaryButton";
import GoogleIdentityButton from "../components/GoogleIdentityButton";
import { googleLogin, loginDemoRole, loginUser } from "../api/auth";
import { IS_DEMO_MODE } from "../api/demoStore";

const HAS_GOOGLE_AUTH =
  !IS_DEMO_MODE && Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim());

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [accountSuspended, setAccountSuspended] = useState(false);
  const [needsGoogleLink, setNeedsGoogleLink] = useState(false);
  const submitting = useRef(false);

  useEffect(() => {
    document.title = "Sign in — ISHARA AI";
  }, []);

  async function handleLogin(event) {
    event.preventDefault();
    if (submitting.current) return;
    setError("");
    setNeedsVerification(false);
    setAccountSuspended(false);
    setNeedsGoogleLink(false);

    try {
      submitting.current = true;
      setLoading(true);
      const result = await loginUser({ email: email.trim(), password });
      navigate(result.user?.role === "admin" ? "/admin" : "/dashboard", {
        replace: true,
      });
    } catch (requestError) {
      const detail =
        requestError.message ||
        "The email or password is incorrect. Check your details and try again.";
      const isForbidden = requestError.status === 403;
      const isUnverified = isForbidden && /verif/i.test(detail);
      const isSuspended = isForbidden && /suspend/i.test(detail);

      setNeedsVerification(isUnverified);
      setAccountSuspended(isSuspended);
      setError(
        isSuspended
          ? "This account is suspended. Please contact an administrator."
          : detail
      );
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  }

  async function handleGoogleCredential(credential) {
    if (submitting.current) return;
    setError("");
    setNeedsVerification(false);
    setAccountSuspended(false);
    setNeedsGoogleLink(false);

    try {
      submitting.current = true;
      setGoogleLoading(true);
      const result = await googleLogin(credential);
      navigate(result.user?.role === "admin" ? "/admin" : "/dashboard", {
        replace: true,
      });
    } catch (requestError) {
      const isForbidden = requestError.status === 403;
      const isConflict = requestError.status === 409;
      const isSuspended = isForbidden && /suspend/i.test(requestError.message);
      const isUnverified = isForbidden && /verif/i.test(requestError.message);

      setNeedsVerification(isUnverified);
      setAccountSuspended(isSuspended);
      setNeedsGoogleLink(isConflict);
      setError(
        requestError.status === 401
          ? "Google could not verify this sign-in. Choose an account and try again."
          : requestError.status === 503 || requestError.code === "NETWORK"
            ? "Google verification is temporarily unavailable. Check your connection and try again."
            : requestError.message || "Google sign-in failed. Please try again."
      );
    } finally {
      submitting.current = false;
      setGoogleLoading(false);
    }
  }

  function handleGoogleCancelled() {
    setError(
      "Google sign-in was cancelled. Choose an account to try again, or use email and password."
    );
    setNeedsVerification(false);
    setAccountSuspended(false);
    setNeedsGoogleLink(false);
  }

  async function handleDemoLogin(role) {
    if (submitting.current) return;
    setError("");
    setNeedsVerification(false);
    setAccountSuspended(false);
    setNeedsGoogleLink(false);

    try {
      submitting.current = true;
      setLoading(true);
      const result = await loginDemoRole(role);
      navigate(result.user?.role === "admin" ? "/admin" : "/dashboard", {
        replace: true,
      });
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  }

  return (
    <AuthLayout pageClassName="ish-login-page">
      <div className="ds-auth-form-inner ish-login-card">
        <header className="ds-auth-heading">
          <h2 className="ds-h2">Welcome back!</h2>
          <p className="ds-body">Sign in to continue your Ishara AI journey</p>
        </header>

        <form
          className="ds-auth-form"
          onSubmit={handleLogin}
          aria-busy={loading || googleLoading}
        >
          {error && (
            <AuthFeedback variant="error" title="We couldn’t sign you in.">
              <p>{error}</p>
              {needsVerification && (
                <p>
                  Check your inbox for the verification email and open its link
                  before signing in.
                </p>
              )}
              {accountSuspended && (
                <p>
                  Sign-in is disabled for this account. Contact an administrator
                  for help.
                </p>
              )}
              {needsGoogleLink && (
                <p>
                  Sign in to the existing account with its current method, then
                  open Profile / Settings to explicitly link Google.
                </p>
              )}
            </AuthFeedback>
          )}

          <FormField id="login-email" label="Email address">
            <input
              className="ds-input"
              id="login-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={loading || googleLoading}
              required
            />
          </FormField>

          <PasswordField
            id="login-password"
            name="password"
            label="Password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            showPassword={showPassword}
            onToggleVisibility={() => setShowPassword((visible) => !visible)}
            disabled={loading || googleLoading}
          />

          <div className="ds-auth-password-meta">
            <Link to="/forgot-password" className="ds-auth-forgot-link">
              Forgot password?
            </Link>
          </div>

          <PrimaryButton
            type="submit"
            fullWidth
            size="md"
            disabled={googleLoading}
            loading={loading || googleLoading}
            loadingLabel={
              googleLoading ? "Signing in with Google…" : "Signing in…"
            }
          >
            Sign in
          </PrimaryButton>
        </form>

        {HAS_GOOGLE_AUTH && (
          <>
            <div className="ds-or-divider">OR CONTINUE WITH</div>

            <GoogleIdentityButton
              className="ish-login-google"
              onCredential={handleGoogleCredential}
              onCancelled={handleGoogleCancelled}
              onError={setError}
              onStart={() => {
                setError("");
                setNeedsVerification(false);
                setAccountSuspended(false);
                setNeedsGoogleLink(false);
              }}
              disabled={loading || googleLoading}
            />
          </>
        )}

        <p className="ds-auth-footer-note">
          Don’t have an account? <Link to="/signup">Create an account</Link>
        </p>

        {IS_DEMO_MODE && (
          <p className="ds-auth-demo-inline">
            <span>Demo preview:</span>
            <button
              type="button"
              className="ds-auth-demo-link"
              onClick={() => handleDemoLogin("user")}
              disabled={loading || googleLoading}
            >
              Demo User
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              className="ds-auth-demo-link"
              onClick={() => handleDemoLogin("admin")}
              disabled={loading || googleLoading}
            >
              Demo Admin
            </button>
          </p>
        )}
      </div>
    </AuthLayout>
  );
}
