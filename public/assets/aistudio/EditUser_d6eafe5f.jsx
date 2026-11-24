import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import {
  getUserById,
  resendUserPendingEmailConfirmation,
  updateUser,
  updateUserStatus,
} from "../../api/admin";
import "./EditUser.css";

function formatDate(dateString) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
}

function EditUser() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const currentUser = useOutletContext();
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [retry, setRetry] = useState(0);
  const [resendingConfirmation, setResendingConfirmation] = useState(false);

  useEffect(() => {
    let active = true;
    getUserById(userId)
      .then((data) => {
        if (!active) return;
        setUser(data);
        setName(data.full_name || "");
        setEmail(data.pending_email || data.email || "");
        setRole(data.role);
        setStatus(data.status);
        setError("");
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || "Unable to load this account.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId, retry]);

  async function handleSave(event) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      let updatedUser = user;

      // Check whether profile details or role have changed.
      const requestedEmail = email.trim().toLowerCase();
      const emailChanged = requestedEmail !== user.email.trim().toLowerCase();
      const detailsChanged =
        name.trim() !== user.full_name ||
        requestedEmail !== (user.pending_email || user.email).trim().toLowerCase() ||
        role !== user.role;

      // Check whether account status has changed.
      const statusChanged = status !== user.status;

      // Send all editable account fields together so backend validation and
      // last-administrator safeguards apply in one update request.
      if (detailsChanged || statusChanged) {
        updatedUser = await updateUser(userId, {
          full_name: name.trim(),
          email: requestedEmail,
          role,
          status,
        });
      }

      setUser(updatedUser);
      setName(updatedUser.full_name);
      setEmail(updatedUser.pending_email || updatedUser.email);
      setRole(updatedUser.role);
      setStatus(updatedUser.status);

      if (user.id === currentUser?.id) {
        window.dispatchEvent(
          new CustomEvent("ishara:admin-profile-updated", { detail: updatedUser })
        );
      }

      setMessage(
        updatedUser.pending_email
          ? emailChanged
            ? `Account details were updated. Confirm ${updatedUser.pending_email} before it becomes the sign-in email; ${updatedUser.email} remains active.`
            : `Account changes were saved. The change to ${updatedUser.pending_email} remains pending; ${updatedUser.email} remains active.`
          : detailsChanged || statusChanged
            ? "Account changes were saved."
            : "No account details changed."
      );

    } catch (requestError) {
      if (requestError.status === 503) {
        try {
          const refreshed = await getUserById(userId);
          setUser(refreshed);
          setName(refreshed.full_name || "");
          setEmail(refreshed.pending_email || refreshed.email || "");
          setRole(refreshed.role);
          setStatus(refreshed.status);
        } catch {
          // Keep the API error visible if the refresh is also unavailable.
        }
      }
      setError(requestError.message || "Unable to save account changes.");
    } finally {
      setSaving(false);
    }
  }

  async function handleResendConfirmation() {
    setResendingConfirmation(true);
    setError("");
    setMessage("");
    try {
      await resendUserPendingEmailConfirmation(userId);
      setMessage(`A confirmation message was requested for ${user.pending_email}.`);
    } catch (requestError) {
      setError(requestError.message || "Unable to resend the email confirmation.");
    } finally {
      setResendingConfirmation(false);
    }
  }

  async function handleToggleStatus() {
    const nextStatus = status === "suspended" ? "active" : "suspended";
    if (user?.id === currentUser?.id && nextStatus !== "active") {
      setError("You cannot suspend your own administrator account.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const updated = await updateUserStatus(userId, nextStatus);
      setUser(updated);
      setStatus(updated.status);
      setMessage(`Account ${updated.status === "active" ? "activated" : "suspended"}.`);
    } catch (requestError) {
      setError(requestError.message || "Unable to update account status.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="edit-user-page"><p role="status">Loading account…</p></div>;
  }

  if (!user) {
    return (
      <div className="edit-user-page">
        <h2>User unavailable</h2>
        {error && <p role="alert">{error}</p>}
        <button type="button" onClick={() => setRetry((value) => value + 1)}>Retry</button>
        <button type="button" onClick={() => navigate("/admin/users")}>Back to users</button>
      </div>
    );
  }

  const displayStatus = user.status === "suspended"
    ? "Suspended"
    : user.status === "pending"
      ? "Pending"
      : user.is_verified
      ? "Active"
      : "Pending verification";

  const statusTone = user.status === "suspended"
    ? "suspended"
    : user.status === "pending" || !user.is_verified
      ? "pending"
      : "active";

  return (
    <div className="edit-user-page">
      <div className="edit-user-heading">
        <div>
          <button className="edit-user-back" type="button" onClick={() => navigate("/admin/users")}>
            ← Users
          </button>
          <h1>Edit user</h1>
          <p>Update account details and access for {user.full_name || user.email}.</p>
        </div>
      </div>

      <div className="edit-user-layout">
        <form className="edit-user-card" onSubmit={handleSave} aria-busy={saving}>
          <div className="edit-user-card-heading">
            <div>
              <h3>User details</h3>
              <p>User ID: {user.id} • Joined {formatDate(user.created_at)}</p>
            </div>
            <span className={`edit-user-current-status ${statusTone}`}>
              ● {displayStatus}
            </span>
          </div>

          <div className="edit-user-field">
            <label htmlFor="edit-name">Full name *</label>
            <input id="edit-name" type="text" value={name} onChange={(event) => setName(event.target.value)} maxLength={100} required />
          </div>

          <div className="edit-user-field">
            <label htmlFor="edit-email">Email address *</label>
            <input id="edit-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} required />
            <small>Current sign-in email: {user.email}. A changed address remains pending until its owner confirms it.</small>
          </div>

          {user.pending_email && (
            <div className="edit-user-info" role="status">
              <span aria-hidden="true">ⓘ</span>
              <div>
                <strong>Email confirmation pending</strong>
                <p>{user.pending_email} is not active yet. {user.email} remains the sign-in address.</p>
                <button type="button" className="edit-user-back" onClick={handleResendConfirmation} disabled={resendingConfirmation}>
                  {resendingConfirmation ? "Sending…" : "Resend confirmation"}
                </button>
              </div>
            </div>
          )}

          <div className="edit-user-select-row">
            <div className="edit-user-field">
              <label htmlFor="edit-role">Role *</label>
              <select id="edit-role" value={role} disabled={user.id === currentUser?.id} onChange={(event) => setRole(event.target.value)}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="edit-user-field">
              <label htmlFor="edit-status">Access status *</label>
              <select id="edit-status" value={status} disabled={user.id === currentUser?.id} onChange={(event) => setStatus(event.target.value)}>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
              {!user.is_verified && <small>Email verification is pending; it is separate from access status.</small>}
            </div>
          </div>

          <div className="edit-user-info">
            <span aria-hidden="true">ⓘ</span>
            <div>
              <strong>Review account changes</strong>
              <p>Role changes affect administration access. Suspended accounts cannot sign in. Email verification status is managed by the verification flow.</p>
            </div>
          </div>

          {error && <p className="edit-user-message" role="alert">{error}</p>}
          {message && <p className="edit-user-message" role="status">{message}</p>}

          <div className="edit-user-form-footer">
            <span>* Required fields</span>
            <div>
              <button type="button" className="edit-user-cancel" onClick={() => navigate("/admin/users")}>Cancel</button>
              <button type="submit" className="edit-user-save" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
            </div>
          </div>
        </form>

        <div className="edit-user-sidebar">
          <div className="edit-user-side-card">
            <h3>Manage account</h3>
            <p>Suspending prevents sign-in while keeping this account and its records.</p>
            <button className={`edit-user-suspend ${status === "suspended" ? "activate" : ""}`} type="button" onClick={handleToggleStatus} disabled={saving || user.id === currentUser?.id}>
              {status === "suspended" ? "Activate account" : "Suspend account"}
            </button>
            <small>Changes are applied through the protected admin API.</small>
          </div>
          <div className="edit-user-side-card">
            <h3>Role permissions</h3>
            <p>{role === "admin" ? "This user can manage users and access the administration area." : "This user has regular account access and cannot enter the administration area."}</p>
            <strong className="edit-user-role-label">Current role: {role === "admin" ? "Admin" : "User"}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditUser;
