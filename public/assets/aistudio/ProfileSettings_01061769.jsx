import { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import AdminDemoNotice from "../../components/admin/AdminDemoNotice";
import GoogleIdentityButton from "../../components/GoogleIdentityButton";
import {
  getUserById,
  updateUser,
} from "../../api/admin";
import {
  cancelMyPendingEmailChange,
  linkGoogleAccount,
  logoutUser,
  resendMyPendingEmailConfirmation,
} from "../../api/auth";
import "./ProfileSettings.css";

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
      reduceMotion: Boolean(stored.reduceMotion ?? DEFAULT_PREFERENCES.reduceMotion),
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
        if (active) setLoadError(error.message || "Unable to load account details.");
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
        localStorage.setItem("isharaAdminSettings", JSON.stringify(preferences));
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
      setMessage(`A new confirmation message was requested for ${pendingEmail}.`);
    } catch (error) {
      setMessageType("error");
      setMessage(error.message || "Unable to resend the confirmation message.");
    } finally {
      setPendingAction("");
    }
  }

  async function handleCancelPendingEmail() {
    if (!window.confirm("Cancel the pending email change? Your current email will remain active.")) {
      return;
    }
    setPendingAction("cancel");
    setMessage("");
    try {
      await cancelMyPendingEmailChange();
      setRetry((value) => value + 1);
      setMessageType("info");
      setMessage("The pending email change was canceled. Your current email remains active.");
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
      setGoogleLinkMessage(result.message || "Google account linked successfully.");
    } catch (error) {
      setGoogleLinkError(error.message || "Unable to link this Google account.");
    } finally {
      setGoogleLinking(false);
    }
  }

  function handleGoogleLinkCancelled() {
    setGoogleLinkError("Google account linking was cancelled. You can try again when ready.");
  }

  function handleLogout() {
    logoutUser();
    navigate("/login", { replace: true });
  }

  if (loading) {
    return <div className="profile-settings-page" aria-live="polite">Loading account settings…</div>;
  }

  if (loadError || !account) {
    return (
      <div className="profile-settings-page">
        <div className="profile-settings-heading">
          <h1>Profile &amp; settings</h1>
        </div>
        <div className="profile-feedback error" role="alert">{loadError || "Account details are unavailable."}</div>
        <button type="button" className="profile-save-btn" onClick={() => setRetry((value) => value + 1)}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="profile-settings-page">
      <AdminDemoNotice>
        Profile details use the account API. Email changes remain pending until confirmed. Password changes use the existing password-reset flow; accessibility preferences are stored in this browser only.
      </AdminDemoNotice>

      <div className="profile-settings-heading">
        <h1>Profile &amp; settings</h1>
        <p>Manage your administrator profile, security and accessibility preferences.</p>
      </div>

      <form onSubmit={handleSave}>
        <div className="profile-settings-grid">
          <div className="profile-settings-left">
            <section className="profile-settings-card">
              <div className="profile-card-heading">
                <h2>Personal information</h2>
                <span className="profile-admin-badge"><span>●</span> Admin</span>
              </div>
              <p className="profile-card-description">Account information for the signed-in administrator.</p>

              <div className="profile-field">
                <label htmlFor="profile-full-name">Full name <span>*</span></label>
                <input
                  id="profile-full-name"
                  name="fullName"
                  type="text"
                  value={profile.fullName}
                  onChange={handleProfileChange}
                  minLength={2}
                  maxLength={100}
                  required
                />
              </div>

              <div className="profile-field">
                <label htmlFor="profile-email">Email address <span>*</span></label>
                <input
                  id="profile-email"
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  maxLength={254}
                  required
                />
                <small className="profile-field-hint">
                  Current sign-in address: {activeEmail}. A new address does not become active until confirmed.
                </small>
              </div>

              <div className="profile-info-box">
                <span className="profile-info-icon">ⓘ</span>
                <div>
                  <h3>{account.is_verified ? "Email verified" : "Email not verified"}</h3>
                  <p>
                    Account status: {account.status}. {account.is_verified ? "The current email is verified." : "The current email has not been verified."}
                  </p>
                </div>
              </div>

              {pendingEmail && (
                <div className="profile-info-box" role="status">
                  <span className="profile-info-icon">ⓘ</span>
                  <div>
                    <h3>Email confirmation pending</h3>
                    <p>{pendingEmail} will become the sign-in email only after confirmation. The current address remains active.</p>
                    <div className="profile-pending-actions">
                      <button type="button" className="profile-privacy-link" onClick={handleResendConfirmation} disabled={Boolean(pendingAction)}>
                        {pendingAction === "resend" ? "Sending…" : "Resend confirmation"}
                      </button>
                      <button type="button" className="profile-privacy-link" onClick={handleCancelPendingEmail} disabled={Boolean(pendingAction)}>
                        {pendingAction === "cancel" ? "Canceling…" : "Cancel email change"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="profile-settings-card profile-session-card">
              <div className="profile-card-heading"><h2>Account security</h2></div>
              <p>Use the existing password recovery flow to set a new password for this account.</p>
              <Link className="profile-privacy-link" to="/forgot-password">Open password reset</Link>
              <div className="profile-google-link">
                <h3>Google sign-in</h3>
                <p>Link only the verified Google account that uses this administrator email address.</p>
                {googleLinkError && <p className="profile-google-link-message is-error" role="alert">{googleLinkError}</p>}
                {googleLinkMessage && <p className="profile-google-link-message is-success" role="status">{googleLinkMessage}</p>}
                {googleLinked ? (
                  <span className="profile-google-linked">Linked to this account</span>
                ) : (
                  <GoogleIdentityButton
                    className="profile-google-link-button"
                    onCredential={handleGoogleLink}
                    onCancelled={handleGoogleLinkCancelled}
                    onError={setGoogleLinkError}
                    onStart={() => { setGoogleLinkError(""); setGoogleLinkMessage(""); }}
                    disabled={googleLinking}
                  />
                )}
              </div>
            </section>
          </div>

          <div className="profile-settings-right">
            <section className="profile-settings-card">
              <div className="profile-card-heading"><h2>Accessibility</h2></div>
              {[
                ["largerText", "Larger text", "Increase text size across your workspace."],
                ["reduceMotion", "Reduce motion", "Prefer still states and limit non-essential movement."],
              ].map(([key, label, description]) => (
                <div className="profile-toggle-row" key={key}>
                  <div><h3>{label}</h3><p>{description}</p></div>
                  <button
                    type="button"
                    className={`profile-switch ${preferences[key] ? "on" : ""}`}
                    onClick={() => handlePreferenceToggle(key)}
                    role="switch"
                    aria-checked={preferences[key]}
                    aria-label={label}
                  >
                    <span /><small>{preferences[key] ? "On" : "Off"}</small>
                  </button>
                </div>
              ))}
              <p className="profile-field-hint">These preference controls are saved in this browser only.</p>
            </section>

            <section className="profile-settings-card profile-session-card">
              <div className="profile-card-heading"><h2>Session</h2></div>
              <p>Sign out of this administrator session when you are finished, especially on a shared device.</p>
              <button type="button" className="profile-logout-btn" onClick={handleLogout}>
                <span>↪</span> Sign out
              </button>
            </section>
          </div>
        </div>

        {message && <div className={`profile-feedback ${messageType}`} role="status">{message}</div>}

        <div className="profile-settings-footer">
          <span>Changes apply when saved. Email changes require confirmation.</span>
          <div>
            <button type="button" className="profile-cancel-btn" onClick={handleCancel} disabled={!isDirty || saving}>
              Cancel
            </button>
            <button type="submit" className="profile-save-btn" disabled={!isDirty || saving}>
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ProfileSettings;
