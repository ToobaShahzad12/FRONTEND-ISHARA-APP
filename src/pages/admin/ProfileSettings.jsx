import { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { Lock, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { getUserById, updateUser } from "../../api/admin";
import { IS_DEMO_MODE } from "../../api/demoStore";
import {
  cancelMyPendingEmailChange,
  linkGoogleAccount,
  logoutUser,
  resendMyPendingEmailConfirmation,
} from "../../api/auth";
import AuthFeedback from "../../components/AuthFeedback";
import FormField from "../../components/FormField";
import GoogleIdentityButton from "../../components/GoogleIdentityButton";
import AdminDemoNotice from "../../components/admin/AdminDemoNotice";
import Avatar from "../../components/ds/Avatar";
import Button from "../../components/ds/Button";
import {
  ISHARA_EASE,
  StaggerContainer,
  StaggerItem,
} from "../../components/ds/MotionPrimitives";
import PageHeader from "../../components/ds/PageHeader";
import Skeleton from "../../components/ds/Skeleton";
import StatusBadge from "../../components/ds/StatusBadge";

const DEFAULT_PREFERENCES = {
  largerText: false,
  reduceMotion: true,
};

function loadPreferences() {
  try {
    const stored = JSON.parse(
      localStorage.getItem("isharaAdminSettings") || "{}"
    );
    return {
      largerText: Boolean(stored.largerText ?? DEFAULT_PREFERENCES.largerText),
      reduceMotion: Boolean(
        stored.reduceMotion ?? DEFAULT_PREFERENCES.reduceMotion
      ),
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function ProfileSettings() {
  const navigate = useNavigate();
  const currentUser = useOutletContext();
  const [account, setAccount] = useState(null);
  const [profile, setProfile] = useState({ fullName: "", email: "" });
  const [savedProfile, setSavedProfile] = useState({ fullName: "", email: "" });
  const [preferences, setPreferences] = useState(loadPreferences);
  const [savedPreferences, setSavedPreferences] = useState(loadPreferences);
  const [loading, setLoading] = useState(Boolean(currentUser?.id));
  const [loadError, setLoadError] = useState(
    currentUser?.id ? "" : "Unable to identify the signed-in administrator."
  );
  const [retry, setRetry] = useState(0);
  const [saving, setSaving] = useState(false);
  const [pendingAction, setPendingAction] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [googleLinking, setGoogleLinking] = useState(false);
  const [googleLinked, setGoogleLinked] = useState(false);
  const [googleLinkError, setGoogleLinkError] = useState("");
  const [googleLinkMessage, setGoogleLinkMessage] = useState("");

  useEffect(() => {
    document.title = "Profile & settings — ISHARA AI Admin";
  }, []);

  useEffect(() => {
    let active = true;

    async function loadAccount() {
      setLoading(true);
      setLoadError("");
      try {
        const data = await getUserById(currentUser.id);
        if (!active) return;
        setAccount(data);
        setGoogleLinked(Boolean(data.google_linked));
        const nextProfile = {
          fullName: data.full_name || "",
          email: data.pending_email || data.email || "",
        };
        setProfile(nextProfile);
        setSavedProfile(nextProfile);
      } catch (error) {
        if (active) {
          setLoadError(error.message || "Unable to load account details.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    if (currentUser?.id) loadAccount();

    return () => {
      active = false;
    };
  }, [currentUser?.id, retry]);

  const profileDirty = Boolean(
    account &&
      (profile.fullName !== savedProfile.fullName ||
        profile.email !== savedProfile.email)
  );
  const preferencesDirty =
    JSON.stringify(preferences) !== JSON.stringify(savedPreferences);
  const isDirty = profileDirty || preferencesDirty;
  const pendingEmail = account?.pending_email || "";
  const activeEmail = account?.email || "";

  function handleProfileChange(event) {
    const { name, value } = event.target;
    setProfile((previous) => ({ ...previous, [name]: value }));
    setMessage("");
  }

  function handlePreferenceToggle(name) {
    setPreferences((previous) => ({ ...previous, [name]: !previous[name] }));
    setMessage("");
  }

  async function handleSave(event) {
    event.preventDefault();
    const fullName = profile.fullName.trim();
    const email = profile.email.trim().toLowerCase();

    if (fullName.length < 2 || fullName.length > 100) {
      setMessageType("error");
      setMessage("Full name must contain between 2 and 100 characters.");
      return;
    }
    if (!account) return;

    setSaving(true);
    setMessage("");
    let nextMessage = "";

    try {
      if (profileDirty) {
        const updated = await updateUser(account.id, {
          full_name: fullName,
          email,
          role: account.role,
          status: account.status,
        });
        setAccount(updated);
        const nextProfile = {
          fullName: updated.full_name || "",
          email: updated.pending_email || updated.email || "",
        };
        setProfile(nextProfile);
        setSavedProfile(nextProfile);
        window.dispatchEvent(
          new CustomEvent("ishara:admin-profile-updated", { detail: updated })
        );

        if (updated.pending_email && email !== activeEmail.toLowerCase()) {
          nextMessage = `Your current sign-in email remains ${updated.email}. Confirm ${updated.pending_email} to complete the change.`;
        } else if (updated.pending_email) {
          nextMessage = `Your profile details were updated. The pending change to ${updated.pending_email} remains active; use Cancel email change if you want to discard it.`;
        } else {
          nextMessage = "Your profile details were updated.";
        }
      }

      if (preferencesDirty) {
        localStorage.setItem(
          "isharaAdminSettings",
          JSON.stringify(preferences)
        );
        document.body.classList.toggle(
          "ds-pref-larger-text",
          Boolean(preferences.largerText)
        );
        document.body.classList.toggle(
          "ds-pref-reduce-motion",
          Boolean(preferences.reduceMotion)
        );
        setSavedPreferences(preferences);
        nextMessage = nextMessage
          ? `${nextMessage} Accessibility preferences were saved in this browser.`
          : "Accessibility preferences were saved in this browser only.";
      }

      setMessageType("info");
      setMessage(nextMessage);
    } catch (error) {
      if (error.status === 503) {
        try {
          const refreshed = await getUserById(currentUser.id);
          setAccount(refreshed);
          const refreshedProfile = {
            fullName: refreshed.full_name || "",
            email: refreshed.pending_email || refreshed.email || "",
          };
          setProfile(refreshedProfile);
          setSavedProfile(refreshedProfile);
        } catch {
          // Keep the API error visible if the refresh is also unavailable.
        }
      }
      setMessageType("error");
      setMessage(error.message || "Unable to save these changes.");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setProfile(savedProfile);
    setPreferences(savedPreferences);
    setMessage("");
  }

  async function handleResendConfirmation() {
    setPendingAction("resend");
    setMessage("");
    try {
      await resendMyPendingEmailConfirmation();
      setMessageType("info");
      setMessage(
        `A new confirmation message was requested for ${pendingEmail}.`
      );
    } catch (error) {
      setMessageType("error");
      setMessage(error.message || "Unable to resend the confirmation message.");
    } finally {
      setPendingAction("");
    }
  }

  async function handleCancelPendingEmail() {
    if (
      !window.confirm(
        "Cancel the pending email change? Your current email will remain active."
      )
    ) {
      return;
    }
    setPendingAction("cancel");
    setMessage("");
    try {
      await cancelMyPendingEmailChange();
      setRetry((value) => value + 1);
      setMessageType("info");
      setMessage(
        "The pending email change was canceled. Your current email remains active."
      );
    } catch (error) {
      setMessageType("error");
      setMessage(error.message || "Unable to cancel the pending email change.");
    } finally {
      setPendingAction("");
    }
  }

  async function handleGoogleLink(credential) {
    setGoogleLinkError("");
    setGoogleLinkMessage("");
    setGoogleLinking(true);
    try {
      const result = await linkGoogleAccount(credential);
      setGoogleLinked(true);
      setGoogleLinkMessage(
        result.message || "Google account linked successfully."
      );
    } catch (error) {
      setGoogleLinkError(
        error.message || "Unable to link this Google account."
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

  function handleLogout() {
    logoutUser();
    navigate("/login", { replace: true });
  }

  if (loading) {
    return (
      <div
        style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-5)" }}
        aria-live="polite"
      >
        <PageHeader eyebrow="Account" title="Profile & settings" />
        <Skeleton height="12rem" />
        <Skeleton height="16rem" />
      </div>
    );
  }

  if (loadError || !account) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-5)" }}>
        <PageHeader eyebrow="Account" title="Profile & settings" />
        <AuthFeedback variant="error">
          <p>{loadError || "Account details are unavailable."}</p>
        </AuthFeedback>
        <div>
          <Button
            variant="primary"
            onClick={() => setRetry((value) => value + 1)}
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <StaggerContainer
      stagger={0.05}
      style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-5)" }}
    >
      <StaggerItem>
        <AdminDemoNotice>
          {IS_DEMO_MODE
            ? "Temporary Demo Admin session (Demo Data — not real authentication). Profile edits update this browser session only; accessibility preferences are saved in this browser."
            : "Profile details use the account API. Email changes remain pending until confirmed. Password changes use the existing password-reset flow; accessibility preferences are stored in this browser only."}
        </AdminDemoNotice>
      </StaggerItem>

      <PageHeader
        eyebrow="Account"
        title="Profile & settings"
        description="Manage your administrator profile, security and accessibility preferences."
      />

      <form onSubmit={handleSave}>
        <div className="ds-profile-layout" style={{ marginBlockStart: 0 }}>
          {/* Identity Summary Column */}
          <StaggerItem>
            <aside className="ds-identity-card" aria-label="Administrator summary">
              <Avatar name={profile.fullName || account.full_name} size="lg" />

              <div style={{ minInlineSize: 0, inlineSize: "100%" }}>
                <h2 className="ds-h3" style={{ wordBreak: "break-word" }}>
                  {profile.fullName.trim() || account.full_name || "Administrator"}
                </h2>
                <p
                  className="ds-body-s"
                  style={{ color: "var(--ds-text-secondary)", wordBreak: "break-word" }}
                >
                  {activeEmail}
                </p>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--ds-space-2)" }}>
                <StatusBadge status="Admin" />
                <StatusBadge
                  status={account.is_verified ? "Verified" : "Not verified"}
                />
              </div>

              <dl className="ds-dl-grid" style={{ inlineSize: "100%" }}>
                <div>
                  <dt>Account status</dt>
                  <dd style={{ textTransform: "capitalize" }}>{account.status}</dd>
                </div>
              </dl>
            </aside>
          </StaggerItem>

          {/* Settings Panels Column */}
          <StaggerItem style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-6)" }}>
            {/* Personal Information */}
            <section className="ds-settings-panel">
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "var(--ds-space-2)",
                  marginBlockEnd: "var(--ds-space-4)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-2)" }}>
                  <UserRound size={18} strokeWidth={1.75} style={{ color: "var(--ds-text-link)" }} aria-hidden="true" />
                  <h2 className="ds-h3">Personal information</h2>
                </div>
                <StatusBadge status="Admin" />
              </div>

              <p
                className="ds-body-s"
                style={{ color: "var(--ds-text-secondary)", marginBlockEnd: "var(--ds-space-4)" }}
              >
                Account information for the signed-in administrator.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-4)" }}>
                <FormField
                  id="profile-full-name"
                  label="Full name"
                  required
                >
                  <input
                    id="profile-full-name"
                    className="ds-input"
                    name="fullName"
                    type="text"
                    value={profile.fullName}
                    onChange={handleProfileChange}
                    minLength={2}
                    maxLength={100}
                    required
                  />
                </FormField>

                <FormField
                  id="profile-email"
                  label="Email address"
                  required
                  helperText={`Current sign-in address: ${activeEmail}. A new address does not become active until confirmed.`}
                >
                  <input
                    id="profile-email"
                    className="ds-input"
                    name="email"
                    type="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    maxLength={254}
                    required
                  />
                </FormField>

                <AuthFeedback
                  variant={account.is_verified ? "success" : "warning"}
                  title={account.is_verified ? "Email verified" : "Email not verified"}
                >
                  <p>
                    Account status: {account.status}.{" "}
                    {account.is_verified
                      ? "The current email is verified."
                      : "The current email has not been verified."}
                  </p>
                </AuthFeedback>

                {pendingEmail && (
                  <AuthFeedback variant="info" title="Email confirmation pending">
                    <p>
                      {pendingEmail} will become the sign-in email only after confirmation. The current address remains active.
                    </p>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "var(--ds-space-3)",
                        marginBlockStart: "var(--ds-space-2)",
                      }}
                    >
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleResendConfirmation}
                        disabled={Boolean(pendingAction)}
                      >
                        {pendingAction === "resend"
                          ? "Sending…"
                          : "Resend confirmation"}
                      </Button>
                      <Button
                        variant="danger-outline"
                        size="sm"
                        onClick={handleCancelPendingEmail}
                        disabled={Boolean(pendingAction)}
                      >
                        {pendingAction === "cancel"
                          ? "Canceling…"
                          : "Cancel email change"}
                      </Button>
                    </div>
                  </AuthFeedback>
                )}
              </div>
            </section>

            {/* Account Security */}
            <section className="ds-settings-panel">
              <div className="ds-settings-row">
                <div className="ds-settings-row-copy">
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-2)" }}>
                    <Lock size={18} strokeWidth={1.75} style={{ color: "var(--ds-text-link)" }} aria-hidden="true" />
                    <h2 className="ds-h4">Account security</h2>
                  </div>
                  <p>
                    Use the existing password recovery flow to set a new password for this account.
                  </p>
                </div>
                <Link className="ds-btn ds-btn--secondary ds-btn--sm" to="/forgot-password">
                  Open password reset
                </Link>
              </div>

              <div className="ds-settings-row">
                <div className="ds-settings-row-copy">
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-2)" }}>
                    <ShieldCheck size={18} strokeWidth={1.75} style={{ color: "var(--ds-text-link)" }} aria-hidden="true" />
                    <h3 className="ds-h4">Google sign-in</h3>
                  </div>
                  <p>
                    Link only the verified Google account that uses this administrator email address.
                  </p>
                  {googleLinkError && (
                    <AuthFeedback variant="error">
                      <p>{googleLinkError}</p>
                    </AuthFeedback>
                  )}
                  {googleLinkMessage && (
                    <AuthFeedback variant="success">
                      <p>{googleLinkMessage}</p>
                    </AuthFeedback>
                  )}
                </div>

                {googleLinked ? (
                  <StatusBadge status="Linked to this account" tone="success" />
                ) : (
                  <div style={{ minInlineSize: "14rem", maxInlineSize: "20rem" }}>
                    <GoogleIdentityButton
                      className="profile-google-link-button"
                      onCredential={handleGoogleLink}
                      onCancelled={handleGoogleLinkCancelled}
                      onError={setGoogleLinkError}
                      onStart={() => {
                        setGoogleLinkError("");
                        setGoogleLinkMessage("");
                      }}
                      disabled={googleLinking}
                    />
                  </div>
                )}
              </div>
            </section>

            {/* Accessibility Preferences */}
            <section className="ds-settings-panel">
              <h2 className="ds-h3" style={{ marginBlockEnd: "var(--ds-space-4)" }}>
                Accessibility
              </h2>

              <div className="ds-settings-row">
                <div className="ds-settings-row-copy">
                  <h3 className="ds-h4">Larger text</h3>
                  <p>Increase text size across your workspace.</p>
                </div>
                <button
                  type="button"
                  className={`ds-switch ${preferences.largerText ? "is-on" : ""}`.trim()}
                  onClick={() => handlePreferenceToggle("largerText")}
                  role="switch"
                  aria-checked={preferences.largerText}
                  aria-label="Larger text"
                >
                  <span className="ds-switch-track" aria-hidden="true">
                    <span className="ds-switch-thumb" />
                  </span>
                  <span>{preferences.largerText ? "On" : "Off"}</span>
                </button>
              </div>

              <div className="ds-settings-row">
                <div className="ds-settings-row-copy">
                  <h3 className="ds-h4">Reduce motion</h3>
                  <p>Prefer still states and limit non-essential movement.</p>
                </div>
                <button
                  type="button"
                  className={`ds-switch ${preferences.reduceMotion ? "is-on" : ""}`.trim()}
                  onClick={() => handlePreferenceToggle("reduceMotion")}
                  role="switch"
                  aria-checked={preferences.reduceMotion}
                  aria-label="Reduce motion"
                >
                  <span className="ds-switch-track" aria-hidden="true">
                    <span className="ds-switch-thumb" />
                  </span>
                  <span>{preferences.reduceMotion ? "On" : "Off"}</span>
                </button>
              </div>

              <p
                className="ds-body-s"
                style={{ color: "var(--ds-text-muted)", marginBlockStart: "var(--ds-space-3)" }}
              >
                These preference controls are saved in this browser only.
              </p>
            </section>

            {/* Session */}
            <section className="ds-settings-panel">
              <div className="ds-settings-row">
                <div className="ds-settings-row-copy">
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-2)" }}>
                    <LogOut size={18} strokeWidth={1.75} style={{ color: "var(--ds-text-link)" }} aria-hidden="true" />
                    <h2 className="ds-h4">Session</h2>
                  </div>
                  <p>
                    Sign out of this administrator session when you are finished, especially on a shared device.
                  </p>
                </div>
                <Button variant="danger-outline" size="sm" onClick={handleLogout}>
                  <LogOut size={16} strokeWidth={2} aria-hidden="true" />
                  <span>Sign out</span>
                </Button>
              </div>
            </section>

            <AnimatePresence initial={false}>
              {message && (
                <motion.div
                  key="admin-profile-msg"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: ISHARA_EASE }}
                >
                  <AuthFeedback variant={messageType === "error" ? "error" : "info"}>
                    <p>{message}</p>
                  </AuthFeedback>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="ds-form-sticky-bar ds-form-sticky-bar--mobile">
              <span className="ds-body-s" style={{ color: "var(--ds-text-muted)" }}>
                Changes apply when saved. Email changes require confirmation.
              </span>
              <div style={{ display: "flex", gap: "var(--ds-space-3)" }}>
                <Button
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={!isDirty || saving}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={!isDirty || saving}
                  loading={saving}
                >
                  {saving ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </div>
          </StaggerItem>
        </div>
      </form>
    </StaggerContainer>
  );
}

export default ProfileSettings;
