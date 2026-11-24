import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Image as ImageIcon,
  Lock,
  LogOut,
  Mail,
  Pencil,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { linkGoogleAccount, logoutUser } from "../api/auth";
import { IS_DEMO_MODE } from "../api/demoStore";
import AdminDemoNotice from "../components/admin/AdminDemoNotice";
import AuthFeedback from "../components/AuthFeedback";
import FormField from "../components/FormField";
import GoogleIdentityButton from "../components/GoogleIdentityButton";
import Avatar, { getInitials } from "../components/ds/Avatar";
import Button from "../components/ds/Button";
import PageHeader from "../components/ds/PageHeader";
import StatusBadge from "../components/ds/StatusBadge";
import UserShell from "../components/ds/UserShell";
import {
  ISHARA_EASE,
  StaggerContainer,
  StaggerItem,
  usePrefersReducedMotion,
} from "../components/ds/MotionPrimitives";

const DEFAULT_USER_PREFS = {
  largerText: false,
  reduceMotion: false,
};

function loadUserPreferences() {
  try {
    const stored = JSON.parse(localStorage.getItem("isharaUserSettings") || "{}");
    return {
      largerText: Boolean(stored.largerText ?? DEFAULT_USER_PREFS.largerText),
      reduceMotion: Boolean(stored.reduceMotion ?? DEFAULT_USER_PREFS.reduceMotion),
    };
  } catch {
    return DEFAULT_USER_PREFS;
  }
}

export default function UserProfileSettings({ user }) {
  const navigate = useNavigate();
  const reduced = usePrefersReducedMotion();
  const pictureInputRef = useRef(null);
  const picturePreviewRef = useRef("");

  const fullName = user?.full_name?.trim() || "Name unavailable";
  const originalFullName = user?.full_name?.trim() || "";
  const email = user?.email || "Email unavailable";
  const verified =
    typeof user?.is_verified === "boolean" ? user.is_verified : null;

  const [isEditing, setIsEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(originalFullName);
  const [nameError, setNameError] = useState("");
  const [picturePreviewUrl, setPicturePreviewUrl] = useState("");
  const [pictureError, setPictureError] = useState("");
  const [saveNotice, setSaveNotice] = useState("");
  const [googleLinking, setGoogleLinking] = useState(false);
  const [googleLinked, setGoogleLinked] = useState(
    Boolean(user?.google_linked)
  );
  const [googleLinkError, setGoogleLinkError] = useState("");
  const [googleLinkNotice, setGoogleLinkNotice] = useState("");
  const [userPrefs, setUserPrefs] = useState(loadUserPreferences);

  useEffect(
    () => () => {
      if (picturePreviewRef.current) URL.revokeObjectURL(picturePreviewRef.current);
    },
    []
  );

  function handleToggleUserPref(key) {
    setUserPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem("isharaUserSettings", JSON.stringify(next));
      } catch {
        // Ignore storage write issues
      }
      document.body.classList.toggle("ds-pref-larger-text", Boolean(next.largerText));
      document.body.classList.toggle("ds-pref-reduce-motion", Boolean(next.reduceMotion));
      window.dispatchEvent(new Event("ishara:user-prefs-updated"));
      return next;
    });
  }

  function clearPicturePreview() {
    if (picturePreviewRef.current) URL.revokeObjectURL(picturePreviewRef.current);
    picturePreviewRef.current = "";
    setPicturePreviewUrl("");
  }

  function beginEditing() {
    setNameDraft(originalFullName);
    setNameError("");
    setPictureError("");
    setSaveNotice("");
    setIsEditing(true);
  }

  function cancelEditing() {
    setNameDraft(originalFullName);
    setNameError("");
    setPictureError("");
    setSaveNotice("");
    clearPicturePreview();
    if (pictureInputRef.current) pictureInputRef.current.value = "";
    setIsEditing(false);
  }

  function handlePictureChange(event) {
    const picture = event.target.files?.[0];
    event.target.value = "";
    if (!picture) return;

    clearPicturePreview();
    setPictureError("");
    setSaveNotice("");
    if (!picture.type.startsWith("image/")) {
      setPictureError(
        "Choose an image file to preview your profile picture."
      );
      return;
    }
    if (picture.size > 5 * 1024 * 1024) {
      setPictureError("Choose an image smaller than 5 MB.");
      return;
    }

    const previewUrl = URL.createObjectURL(picture);
    picturePreviewRef.current = previewUrl;
    setPicturePreviewUrl(previewUrl);
  }

  function handleSave(event) {
    event.preventDefault();
    const trimmedName = nameDraft.trim();
    if (!trimmedName) {
      setNameError("Full name is required.");
      setSaveNotice("");
      return;
    }
    if (trimmedName.length < 2) {
      setNameError("Full name must be at least 2 characters.");
      setSaveNotice("");
      return;
    }
    if (trimmedName.length > 100) {
      setNameError("Full name must be 100 characters or fewer.");
      setSaveNotice("");
      return;
    }

    setNameDraft(trimmedName);
    setNameError("");
    setSaveNotice(
      "This is a temporary preview only. Profile updates cannot be saved to your account yet."
    );
  }

  function handleLogout() {
    logoutUser();
    navigate("/login", { replace: true });
  }

  async function handleGoogleLink(credential) {
    setGoogleLinkError("");
    setGoogleLinkNotice("");
    setGoogleLinking(true);
    try {
      const result = await linkGoogleAccount(credential);
      setGoogleLinked(true);
      setGoogleLinkNotice(
        result.message || "Google account linked successfully."
      );
    } catch (requestError) {
      setGoogleLinkError(
        requestError.message || "Unable to link this Google account."
      );
    } finally {
      setGoogleLinking(false);
    }
  }

  function handleGoogleLinkCancelled() {
    setGoogleLinkError(
      "Google account linking was cancelled. You can try again when ready."
    );
  }

  return (
    <UserShell user={user} onLogout={handleLogout} pageTitle="Profile & Settings">
      <PageHeader
        eyebrow="Account"
        title="Profile & Settings"
        description="View your personal details and manage your account."
      />

      {IS_DEMO_MODE && (
        <div style={{ marginBlockStart: "var(--ds-space-4)" }}>
          <AdminDemoNotice>
            Temporary Demo User session (Demo Data — not real authentication). Signing out returns you to the login screen.
          </AdminDemoNotice>
        </div>
      )}

      <StaggerContainer className="ds-profile-layout" stagger={0.07} delay={0.03}>
        <StaggerItem y={14}>
          <aside className="ds-identity-card" aria-label="Account summary">
          {isEditing && picturePreviewUrl ? (
            <img
              className="ds-avatar ds-avatar--lg"
              style={{ objectFit: "cover" }}
              src={picturePreviewUrl}
              alt="Temporary profile picture preview"
              onError={() => {
                if (picturePreviewRef.current !== picturePreviewUrl) return;
                clearPicturePreview();
                setPictureError(
                  "This image could not be previewed. Choose a different image."
                );
              }}
            />
          ) : (
            <Avatar name={isEditing ? nameDraft || fullName : user?.full_name} size="lg" />
          )}

          <div style={{ minInlineSize: 0, inlineSize: "100%" }}>
            <h2 className="ds-h3" style={{ wordBreak: "break-word" }}>
              {isEditing ? nameDraft.trim() || fullName : fullName}
            </h2>
            <p className="ds-body-sm" style={{ color: "var(--ds-text-secondary)", wordBreak: "break-word" }}>
              {email}
            </p>
          </div>

          {verified === null ? (
            <StatusBadge status="Verification status unavailable" tone="neutral" />
          ) : (
            <StatusBadge
              status={verified ? "Email verified" : "Email not verified"}
              tone={verified ? "success" : "warning"}
            />
          )}

          {isEditing ? (
            <span className="ds-body-sm" style={{ color: "var(--ds-text-muted)" }}>
              Local preview only
            </span>
          ) : (
            <Button variant="secondary" fullWidth onClick={beginEditing}>
              <Pencil size={16} strokeWidth={2} aria-hidden="true" />
              <span>Edit Profile</span>
            </Button>
          )}
          </aside>
        </StaggerItem>

        <StaggerItem y={14}>
          <section className="ds-settings-panel">
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.form
                  key="edit-mode"
                  onSubmit={handleSave}
                  noValidate
                  style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-5)" }}
                  initial={reduced ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
                  transition={{ duration: reduced ? 0.01 : 0.2, ease: ISHARA_EASE }}
                >
              {saveNotice && (
                <AuthFeedback variant="info" title="Changes are not saved">
                  <p>{saveNotice}</p>
                </AuthFeedback>
              )}

              <div>
                <h2 className="ds-h3" style={{ marginBlockEnd: "var(--ds-space-3)" }}>
                  Temporary profile preview
                </h2>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--ds-space-4)" }}>
                  <input
                    ref={pictureInputRef}
                    id="ish-profile-picture"
                    className="ds-sr-only"
                    type="file"
                    accept="image/*"
                    onChange={handlePictureChange}
                  />
                  <label
                    className="ds-btn ds-btn--secondary ds-btn--sm"
                    htmlFor="ish-profile-picture"
                    style={{ cursor: "pointer" }}
                  >
                    <ImageIcon size={16} strokeWidth={1.75} aria-hidden="true" />
                    <span>Choose picture</span>
                  </label>
                  <span className="ds-body-sm" style={{ color: "var(--ds-text-muted)" }}>
                    Preview only · Avatar initial shown when cleared ({getInitials(nameDraft)})
                  </span>
                </div>
                {pictureError && (
                  <p
                    className="ds-field-error"
                    role="alert"
                    style={{ marginBlockStart: "var(--ds-space-2)" }}
                  >
                    {pictureError}
                  </p>
                )}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(15rem, 1fr))",
                  gap: "var(--ds-space-4)",
                }}
              >
                <FormField
                  id="ish-profile-full-name"
                  label="Full name"
                  error={nameError}
                  errorId="ish-profile-name-error"
                >
                  <input
                    className="ds-input"
                    id="ish-profile-full-name"
                    name="full_name"
                    type="text"
                    autoComplete="name"
                    maxLength={100}
                    value={nameDraft}
                    onChange={(event) => {
                      setNameDraft(event.target.value);
                      setNameError("");
                      setSaveNotice("");
                    }}
                    aria-invalid={Boolean(nameError)}
                    aria-describedby={
                      nameError ? "ish-profile-name-error" : undefined
                    }
                  />
                </FormField>

                <FormField
                  id="ish-profile-email"
                  label="Email address"
                  helperText="Email address cannot be changed here."
                >
                  <input
                    className="ds-input"
                    id="ish-profile-email"
                    type="email"
                    value={email}
                    readOnly
                    aria-readonly="true"
                  />
                </FormField>
              </div>

              <p className="ds-body-sm" style={{ color: "var(--ds-text-muted)" }}>
                Changes are temporary previews. Profile updates are not
                connected to an account-saving service.
              </p>

              <div className="ds-form-sticky-bar ds-form-sticky-bar--mobile">
                <span />
                <div style={{ display: "flex", gap: "var(--ds-space-3)" }}>
                  <Button variant="secondary" onClick={cancelEditing}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit">
                    Save Changes
                  </Button>
                </div>
              </div>
                </motion.form>
              ) : (
                <motion.div
                  key="view-mode"
                  initial={reduced ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
                  transition={{ duration: reduced ? 0.01 : 0.2, ease: ISHARA_EASE }}
                >
              <div className="ds-settings-row">
                <div className="ds-settings-row-copy">
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-2)" }}>
                    <UserRound size={18} strokeWidth={1.75} style={{ color: "var(--ds-text-link)" }} aria-hidden="true" />
                    <h2 className="ds-h4">Personal information</h2>
                  </div>
                  <dl className="ds-dl-grid">
                    <div>
                      <dt>Full name</dt>
                      <dd>{fullName}</dd>
                    </div>
                  </dl>
                  <p>View the personal details on your account.</p>
                </div>
              </div>

              <div className="ds-settings-row">
                <div className="ds-settings-row-copy">
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-2)" }}>
                    <Mail size={18} strokeWidth={1.75} style={{ color: "var(--ds-text-link)" }} aria-hidden="true" />
                    <h2 className="ds-h4">Account information</h2>
                  </div>
                  <dl className="ds-dl-grid">
                    <div>
                      <dt>Email address</dt>
                      <dd>{email}</dd>
                    </div>
                    <div>
                      <dt>Email verification</dt>
                      <dd>
                        {verified === null
                          ? "Status unavailable"
                          : verified
                            ? "Verified"
                            : "Not verified"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="ds-settings-row">
                <div className="ds-settings-row-copy">
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-2)" }}>
                    <Lock size={18} strokeWidth={1.75} style={{ color: "var(--ds-text-link)" }} aria-hidden="true" />
                    <h2 className="ds-h4">Password &amp; security</h2>
                  </div>
                  <p>
                    Use the existing password reset flow to choose a new
                    password for your account.
                  </p>
                </div>
                <Button variant="secondary" size="sm" to="/forgot-password">
                  Request password reset
                </Button>
              </div>

              <div className="ds-settings-row">
                <div className="ds-settings-row-copy">
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-2)" }}>
                    <ShieldCheck size={18} strokeWidth={1.75} style={{ color: "var(--ds-text-link)" }} aria-hidden="true" />
                    <h2 className="ds-h4">Google sign-in</h2>
                  </div>
                  <p>
                    Link only the verified Google account that uses this ISHARA
                    AI email address.
                  </p>
                  {googleLinkError && (
                    <AuthFeedback variant="error">
                      <p>{googleLinkError}</p>
                    </AuthFeedback>
                  )}
                  {googleLinkNotice && (
                    <AuthFeedback variant="success">
                      <p>{googleLinkNotice}</p>
                    </AuthFeedback>
                  )}
                </div>

                {googleLinked ? (
                  <StatusBadge status="Linked to this account" tone="success" />
                ) : (
                  <div style={{ minInlineSize: "14rem", maxInlineSize: "20rem" }}>
                    <GoogleIdentityButton
                      className="ish-profile-google-button"
                      onCredential={handleGoogleLink}
                      onCancelled={handleGoogleLinkCancelled}
                      onError={setGoogleLinkError}
                      onStart={() => {
                        setGoogleLinkError("");
                        setGoogleLinkNotice("");
                      }}
                      disabled={googleLinking}
                    />
                  </div>
                )}
              </div>

              <div className="ds-settings-row">
                <div className="ds-settings-row-copy">
                  <h2 className="ds-h4">Larger text</h2>
                  <p>Increase text size across your workspace (saved in this browser).</p>
                </div>
                <button
                  type="button"
                  className={`ds-switch ${userPrefs.largerText ? "is-on" : ""}`.trim()}
                  onClick={() => handleToggleUserPref("largerText")}
                  role="switch"
                  aria-checked={userPrefs.largerText}
                  aria-label="Larger text"
                >
                  <span className="ds-switch-track" aria-hidden="true">
                    <span className="ds-switch-thumb" />
                  </span>
                  <span>{userPrefs.largerText ? "On" : "Off"}</span>
                </button>
              </div>

              <div className="ds-settings-row">
                <div className="ds-settings-row-copy">
                  <h2 className="ds-h4">Reduce motion</h2>
                  <p>Prefer still transitions across user workspace views.</p>
                </div>
                <button
                  type="button"
                  className={`ds-switch ${userPrefs.reduceMotion ? "is-on" : ""}`.trim()}
                  onClick={() => handleToggleUserPref("reduceMotion")}
                  role="switch"
                  aria-checked={userPrefs.reduceMotion}
                  aria-label="Reduce motion"
                >
                  <span className="ds-switch-track" aria-hidden="true">
                    <span className="ds-switch-thumb" />
                  </span>
                  <span>{userPrefs.reduceMotion ? "On" : "Off"}</span>
                </button>
              </div>

              <div className="ds-settings-row">
                <div className="ds-settings-row-copy">
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-2)" }}>
                    <LogOut size={18} strokeWidth={1.75} style={{ color: "var(--ds-text-link)" }} aria-hidden="true" />
                    <h2 className="ds-h4">Account session</h2>
                  </div>
                  <p>
                    Signing out ends your current ISHARA AI session on this
                    device.
                  </p>
                </div>
                <Button variant="danger-outline" size="sm" onClick={handleLogout}>
                  <LogOut size={16} strokeWidth={2} aria-hidden="true" />
                  <span>Sign out</span>
                </Button>
              </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </StaggerItem>
      </StaggerContainer>

      <p
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--ds-space-2)",
          marginBlockStart: "var(--ds-space-6)",
          fontSize: "0.875rem",
          color: "var(--ds-text-muted)",
        }}
      >
        <CheckCircle2 size={16} strokeWidth={1.75} aria-hidden="true" />
        <span>
          Your account details are displayed securely for your current session.
        </span>
      </p>
    </UserShell>
  );
}
