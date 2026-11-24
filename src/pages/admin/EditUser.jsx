import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { UserX } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  getUserById,
  resendUserPendingEmailConfirmation,
  updateUser,
  updateUserStatus,
} from "../../api/admin";
import AuthFeedback from "../../components/AuthFeedback";
import FormField from "../../components/FormField";
import Breadcrumb from "../../components/ds/Breadcrumb";
import Button from "../../components/ds/Button";
import EmptyState from "../../components/ds/EmptyState";
import {
  ISHARA_EASE,
  StaggerContainer,
  StaggerItem,
} from "../../components/ds/MotionPrimitives";
import PageHeader from "../../components/ds/PageHeader";
import Skeleton from "../../components/ds/Skeleton";
import StatusBadge from "../../components/ds/StatusBadge";

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

export default function EditUser() {
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
    document.title = "Edit user — ISHARA AI Admin";
  }, []);

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
        if (active)
          setError(requestError.message || "Unable to load this account.");
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
        requestedEmail !==
          (user.pending_email || user.email).trim().toLowerCase() ||
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
          new CustomEvent("ishara:admin-profile-updated", {
            detail: updatedUser,
          })
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
      setMessage(
        `A confirmation message was requested for ${user.pending_email}.`
      );
    } catch (requestError) {
      setError(
        requestError.message || "Unable to resend the email confirmation."
      );
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
      setMessage(
        `Account ${updated.status === "active" ? "activated" : "suspended"}.`
      );
    } catch (requestError) {
      setError(requestError.message || "Unable to update account status.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div
        role="status"
        aria-label="Loading account"
        style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-4)" }}
      >
        <Skeleton width="12rem" height="1.5rem" />
        <Skeleton width="20rem" height="2.5rem" />
        <Skeleton height="18rem" />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-4)" }}>
        <Breadcrumb
          parentLabel="Users"
          parentTo="/admin/users"
          items={[
            { label: "Users", to: "/admin/users" },
            { label: "Unavailable" },
          ]}
        />
        <div className="ds-card" style={{ padding: "var(--ds-space-6)" }}>
          <EmptyState
            icon={UserX}
            title="User unavailable"
            description={error || "This account could not be loaded."}
            actions={
              <>
                <Button
                  variant="primary"
                  onClick={() => {
                    setLoading(true);
                    setRetry((value) => value + 1);
                  }}
                >
                  Retry
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate("/admin/users")}
                >
                  Back to users
                </Button>
              </>
            }
          />
        </div>
      </div>
    );
  }

  const displayStatus =
    user.status === "suspended"
      ? "Suspended"
      : user.status === "pending"
        ? "Pending"
        : user.is_verified
          ? "Active"
          : "Pending verification";

  return (
    <StaggerContainer
      stagger={0.05}
      style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-4)" }}
    >
      <StaggerItem>
        <Breadcrumb
          parentLabel="Users"
          parentTo="/admin/users"
          items={[
            { label: "Users", to: "/admin/users" },
            { label: user.full_name || user.email },
          ]}
        />
      </StaggerItem>

      <PageHeader
        eyebrow="Directory"
        title="Edit user"
        description={`Update account details and access for ${user.full_name || user.email}.`}
      />

      <div className="ds-admin-form-layout">
        <StaggerItem>
          <form
            className="ds-card"
            style={{ padding: "var(--ds-space-6)", display: "flex", flexDirection: "column", gap: "var(--ds-space-5)" }}
            onSubmit={handleSave}
            aria-busy={saving}
          >
            <div className="ds-dash-section-head" style={{ marginBlockEnd: 0 }}>
              <div>
                <h2 className="ds-h3">User details</h2>
                <p className="ds-body-sm" style={{ color: "var(--ds-text-muted)" }}>
                  User ID: {user.id} · Joined {formatDate(user.created_at)}
                </p>
              </div>
              <StatusBadge status={displayStatus} />
            </div>

            <FormField id="edit-name" label="Full name" requiredMark>
              <input
                className="ds-input"
                id="edit-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={100}
                required
              />
            </FormField>

            <FormField
              id="edit-email"
              label="Email address"
              requiredMark
              helperText={`Current sign-in email: ${user.email}. A changed address remains pending until its owner confirms it.`}
            >
              <input
                className="ds-input"
                id="edit-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                maxLength={254}
                required
              />
            </FormField>

            {user.pending_email && (
              <AuthFeedback variant="warning" title="Email confirmation pending">
                <p>
                  {user.pending_email} is not active yet. {user.email} remains
                  the sign-in address.
                </p>
                <div style={{ marginBlockStart: "var(--ds-space-2)" }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleResendConfirmation}
                    loading={resendingConfirmation}
                    loadingLabel="Sending…"
                  >
                    Resend confirmation
                  </Button>
                </div>
              </AuthFeedback>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(13rem, 1fr))",
                gap: "var(--ds-space-4)",
              }}
            >
              <FormField id="edit-role" label="Role" requiredMark>
                <select
                  className="ds-select"
                  id="edit-role"
                  value={role}
                  disabled={user.id === currentUser?.id}
                  onChange={(event) => setRole(event.target.value)}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </FormField>

              <FormField
                id="edit-status"
                label="Access status"
                requiredMark
                helperText={
                  !user.is_verified
                    ? "Email verification is pending; it is separate from access status."
                    : undefined
                }
              >
                <select
                  className="ds-select"
                  id="edit-status"
                  value={status}
                  disabled={user.id === currentUser?.id}
                  onChange={(event) => setStatus(event.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
              </FormField>
            </div>

            <AuthFeedback variant="info" title="Review account changes">
              <p>
                Role changes affect administration access. Suspended accounts
                cannot sign in. Email verification status is managed by the
                verification flow.
              </p>
            </AuthFeedback>

            <AnimatePresence initial={false}>
              {error && (
                <motion.div
                  key="edit-user-error"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: ISHARA_EASE }}
                >
                  <AuthFeedback variant="error">
                    <p>{error}</p>
                  </AuthFeedback>
                </motion.div>
              )}

              {message && (
                <motion.div
                  key="edit-user-success"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: ISHARA_EASE }}
                >
                  <AuthFeedback variant="success">
                    <p>{message}</p>
                  </AuthFeedback>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="ds-form-sticky-bar ds-form-sticky-bar--mobile">
              <span className="ds-body-sm" style={{ color: "var(--ds-text-muted)" }}>
                * Required fields
              </span>
              <div style={{ display: "flex", gap: "var(--ds-space-3)" }}>
                <Button
                  variant="secondary"
                  onClick={() => navigate("/admin/users")}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  loading={saving}
                  loadingLabel="Saving…"
                >
                  Save changes
                </Button>
              </div>
            </div>
          </form>
        </StaggerItem>

        <StaggerItem>
          <aside style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-4)" }}>
            <section className="ds-card" style={{ padding: "var(--ds-space-5)", display: "flex", flexDirection: "column", gap: "var(--ds-space-3)" }}>
              <h2 className="ds-h4">Manage account</h2>
              <p className="ds-body-sm" style={{ color: "var(--ds-text-secondary)" }}>
                Suspending prevents sign-in while keeping this account and its
                records.
              </p>
              <Button
                variant={status === "suspended" ? "primary" : "danger-outline"}
                fullWidth
                onClick={handleToggleStatus}
                disabled={saving || user.id === currentUser?.id}
              >
                {status === "suspended" ? "Activate account" : "Suspend account"}
              </Button>
              <small className="ds-field-helper">
                Changes are applied through the protected admin API.
              </small>
            </section>

            <section className="ds-card" style={{ padding: "var(--ds-space-5)", display: "flex", flexDirection: "column", gap: "var(--ds-space-3)" }}>
              <h2 className="ds-h4">Role permissions</h2>
              <p className="ds-body-sm" style={{ color: "var(--ds-text-secondary)" }}>
                {role === "admin"
                  ? "This user can manage users and access the administration area."
                  : "This user has regular account access and cannot enter the administration area."}
              </p>
              <strong style={{ fontSize: "0.9375rem" }}>
                Current role: {role === "admin" ? "Admin" : "User"}
              </strong>
            </section>
          </aside>
        </StaggerItem>
      </div>
    </StaggerContainer>
  );
}
