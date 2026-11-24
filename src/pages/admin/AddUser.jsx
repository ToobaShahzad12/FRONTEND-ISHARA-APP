import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { createUser } from "../../api/admin";
import AuthFeedback from "../../components/AuthFeedback";
import FormField from "../../components/FormField";
import Breadcrumb from "../../components/ds/Breadcrumb";
import Button from "../../components/ds/Button";
import {
  ISHARA_EASE,
  StaggerContainer,
  StaggerItem,
} from "../../components/ds/MotionPrimitives";
import PageHeader from "../../components/ds/PageHeader";

export default function AddUser() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "User",
    status: "Invited",
  });

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Add user — ISHARA AI Admin";
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formData.fullName.trim() || !formData.email.trim()) {
      setMessage("Please complete all required fields.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      await createUser({
        full_name: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role.toLowerCase(),
        status: formData.status === "Invited" ? "pending" : "active",
      });

      navigate("/admin/users", {
        state: {
          message: "User created successfully. Invitation email sent.",
        },
      });
    } catch (error) {
      setMessage(error.message || "Unable to create user. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

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
            { label: "Add user" },
          ]}
        />
      </StaggerItem>

      <PageHeader
        eyebrow="Directory"
        title="Add user"
        description="Create an account and invite someone to Ishara AI."
      />

      <div className="ds-admin-form-layout">
        <StaggerItem>
          <section className="ds-card" style={{ padding: "var(--ds-space-6)" }}>
            <h2 className="ds-h3">User details</h2>
            <p
              className="ds-body-sm"
              style={{
                color: "var(--ds-text-secondary)",
                marginBlockStart: "0.25rem",
                marginBlockEnd: "var(--ds-space-5)",
              }}
            >
              Use the person&apos;s preferred name and an email address they can
              access.
            </p>

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-5)" }}
            >
              <FormField
                id="fullName"
                label="Full name"
                requiredMark
                helperText="Required. Enter a name, not an account ID."
              >
                <input
                  className="ds-input"
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  maxLength={100}
                  required
                  minLength={2}
                />
              </FormField>

              <FormField
                id="email"
                label="Email address"
                requiredMark
                helperText="Use a valid, unique email address. An invitation will be sent when the user is created."
              >
                <input
                  className="ds-input"
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  maxLength={254}
                  required
                />
              </FormField>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(13rem, 1fr))",
                  gap: "var(--ds-space-4)",
                }}
              >
                <FormField
                  id="role"
                  label="Role"
                  requiredMark
                  helperText="User access is the default."
                >
                  <select
                    className="ds-select"
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                </FormField>

                <FormField
                  id="status"
                  label="Account status"
                  requiredMark
                  helperText="Activation follows the invitation."
                >
                  <select
                    className="ds-select"
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Invited">Invited</option>
                    <option value="Active">Active</option>
                  </select>
                </FormField>
              </div>

              <AuthFeedback
                variant="info"
                title="An invitation, not a shared password"
              >
                <p>
                  Creating this user sends an invitation to set their own
                  password. Confirm the address before continuing.
                </p>
              </AuthFeedback>

              <AnimatePresence initial={false}>
                {message && (
                  <motion.div
                    key="add-user-error"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: ISHARA_EASE }}
                  >
                    <AuthFeedback variant="error">
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
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>

                  <Button
                    variant="primary"
                    type="submit"
                    loading={isSubmitting}
                    loadingLabel="Creating..."
                  >
                    Create user
                  </Button>
                </div>
              </div>
            </form>
          </section>
        </StaggerItem>

        <StaggerItem>
          <aside style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-4)" }}>
            <section className="ds-card" style={{ padding: "var(--ds-space-5)", display: "flex", flexDirection: "column", gap: "var(--ds-space-4)" }}>
              <h2 className="ds-h4">Choose access carefully</h2>

              <div>
                <strong style={{ display: "block" }}>User</strong>
                <p className="ds-body-sm" style={{ color: "var(--ds-text-secondary)" }}>
                  Can record or upload signing videos and review their own
                  translation history.
                </p>
              </div>

              <div>
                <strong style={{ display: "block" }}>Admin</strong>
                <p className="ds-body-sm" style={{ color: "var(--ds-text-secondary)" }}>
                  Can manage users, dictionary drafts, knowledge articles and
                  processing activity.
                </p>
              </div>
            </section>

            <AuthFeedback variant="warning" title="Before you create">
              <p>
                Check spelling, email and role. Only grant admin access to someone
                authorized to manage the platform.
              </p>
            </AuthFeedback>
          </aside>
        </StaggerItem>
      </div>
    </StaggerContainer>
  );
}
