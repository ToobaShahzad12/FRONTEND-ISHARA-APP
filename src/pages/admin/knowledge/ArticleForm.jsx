import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bold, Italic, Link2, List, Underline } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  createKnowledgeArticle,
  updateKnowledgeArticle,
} from "../../../api/admin";
import AuthFeedback from "../../../components/AuthFeedback";
import FormField from "../../../components/FormField";
import Breadcrumb from "../../../components/ds/Breadcrumb";
import Button from "../../../components/ds/Button";
import {
  ISHARA_EASE,
  StaggerContainer,
  StaggerItem,
} from "../../../components/ds/MotionPrimitives";
import PageHeader from "../../../components/ds/PageHeader";
import StatusBadge from "../../../components/ds/StatusBadge";

const CATEGORIES = [
  "Video guidance",
  "Translation",
  "Recording",
  "Policy",
  "Support",
  "PSL dictionary",
];

const INITIAL_FORM = {
  title: "",
  summary: "",
  body: "",
  category: "Video guidance",
  status: "Draft",
};

export default function ArticleForm({ mode = "add", article = null }) {
  const navigate = useNavigate();
  const isEdit = mode === "edit";

  const [formData, setFormData] = useState(() =>
    isEdit && article
      ? {
          title: article.title || "",
          summary: "",
          body: article.content || "",
          category: article.category || "Video guidance",
          status:
            article.status?.toLowerCase() === "published"
              ? "Published"
              : "Draft",
        }
      : INITIAL_FORM
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = isEdit
      ? "Edit article — ISHARA AI Admin"
      : "Add article — ISHARA AI Admin";
  }, [isEdit]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const insertFormatting = (tag) => {
    const textarea = document.getElementById("article-body");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.body.slice(start, end);

    let formattedText = selectedText;

    if (tag === "bold") {
      formattedText = `**${selectedText || "bold text"}**`;
    } else if (tag === "italic") {
      formattedText = `*${selectedText || "italic text"}*`;
    } else if (tag === "underline") {
      formattedText = `<u>${selectedText || "underlined text"}</u>`;
    } else if (tag === "bullet") {
      formattedText = `\n• ${selectedText || "List item"}`;
    } else if (tag === "link") {
      formattedText = `[${selectedText || "Link text"}](https://example.com)`;
    }

    const updatedBody =
      formData.body.slice(0, start) +
      formattedText +
      formData.body.slice(end);

    setFormData((previous) => ({
      ...previous,
      body: updatedBody,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (
      !formData.title.trim() ||
      !formData.body.trim() ||
      !formData.category.trim()
    ) {
      setError("Please complete all required fields.");
      return;
    }

    const articleData = {
      title: formData.title.trim(),
      content: formData.body.trim(),
      category: formData.category,
      status: formData.status.toLowerCase(),
    };

    try {
      setSaving(true);

      if (isEdit && article) {
        await updateKnowledgeArticle(article.id, articleData);
      } else {
        await createKnowledgeArticle(articleData);
      }

      navigate("/admin/knowledge-base", {
        state: {
          message: isEdit
            ? "Article updated successfully."
            : "Article created successfully.",
        },
      });
    } catch (err) {
      setError(err.message || "Unable to save the article. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const lastUpdated = article?.updated_at
    ? new Date(article.updated_at).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Not available";

  return (
    <StaggerContainer
      stagger={0.05}
      style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-4)" }}
    >
      <StaggerItem>
        <Breadcrumb
          parentLabel="Knowledge base"
          parentTo="/admin/knowledge-base"
          items={[
            { label: "Knowledge base", to: "/admin/knowledge-base" },
            { label: isEdit ? "Edit article" : "Add article" },
          ]}
        />
      </StaggerItem>

      <PageHeader
        eyebrow="Content"
        title={isEdit ? "Edit article" : "Add article"}
        description={
          isEdit
            ? "Update existing guidance and review its publication status before saving."
            : "Write practical, accessible guidance for people using Ishara AI."
        }
      />

      <AnimatePresence initial={false}>
        {error && (
          <motion.div
            key="article-form-error"
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
      </AnimatePresence>

      <form className="ds-admin-form-layout" onSubmit={handleSubmit}>
        <StaggerItem>
          <section
            className="ds-card"
            style={{ padding: "var(--ds-space-6)", display: "flex", flexDirection: "column", gap: "var(--ds-space-5)" }}
          >
            <h2 className="ds-h3">Article details</h2>

            <FormField id="article-title" label="Title" requiredMark>
              <input
                className="ds-input"
                id="article-title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter a clear article title"
                required
              />
            </FormField>

            <FormField id="article-summary" label="Summary">
              <textarea
                className="ds-textarea"
                style={{ minBlockSize: "4.5rem" }}
                id="article-summary"
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                placeholder="Write a short summary of this article (not saved)"
                rows={2}
              />
            </FormField>

            <FormField id="article-body" label="Article body" requiredMark>
              <div>
                <div className="ds-editor-toolbar" role="toolbar" aria-label="Formatting">
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: "var(--ds-text-muted)",
                      paddingInline: "var(--ds-space-2)",
                    }}
                  >
                    Paragraph
                  </span>

                  <button
                    type="button"
                    className="ds-icon-btn ds-icon-btn--compact"
                    onClick={() => insertFormatting("bold")}
                    aria-label="Bold"
                    title="Bold"
                  >
                    <Bold size={16} strokeWidth={2.25} aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    className="ds-icon-btn ds-icon-btn--compact"
                    onClick={() => insertFormatting("italic")}
                    aria-label="Italic"
                    title="Italic"
                  >
                    <Italic size={16} strokeWidth={2} aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    className="ds-icon-btn ds-icon-btn--compact"
                    onClick={() => insertFormatting("underline")}
                    aria-label="Underline"
                    title="Underline"
                  >
                    <Underline size={16} strokeWidth={2} aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    className="ds-icon-btn ds-icon-btn--compact"
                    onClick={() => insertFormatting("bullet")}
                    aria-label="Bullet list"
                    title="Bullet"
                  >
                    <List size={16} strokeWidth={2} aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    className="ds-icon-btn ds-icon-btn--compact"
                    onClick={() => insertFormatting("link")}
                    aria-label="Insert link"
                    title="Insert link"
                  >
                    <Link2 size={16} strokeWidth={2} aria-hidden="true" />
                  </button>
                </div>

                <textarea
                  className="ds-textarea ds-editor-textarea"
                  id="article-body"
                  name="body"
                  value={formData.body}
                  onChange={handleChange}
                  placeholder="Write your article content here..."
                  rows={13}
                  required
                />
              </div>
            </FormField>

            <div className="ds-form-sticky-bar ds-form-sticky-bar--mobile">
              <span className="ds-body-sm" style={{ color: "var(--ds-text-muted)" }}>
                * Required fields
              </span>

              <div style={{ display: "flex", gap: "var(--ds-space-3)" }}>
                <Button
                  variant="secondary"
                  onClick={() => navigate("/admin/knowledge-base")}
                  disabled={saving}
                >
                  Cancel
                </Button>

                <Button
                  variant="primary"
                  type="submit"
                  loading={saving}
                  loadingLabel="Saving..."
                >
                  {isEdit
                    ? formData.status === "Published"
                      ? "Update article"
                      : "Save draft"
                    : formData.status === "Published"
                      ? "Publish article"
                      : "Save draft"}
                </Button>
              </div>
            </div>
          </section>
        </StaggerItem>

        <StaggerItem>
          <aside style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-4)" }}>
            <section className="ds-card" style={{ padding: "var(--ds-space-5)", display: "flex", flexDirection: "column", gap: "var(--ds-space-4)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--ds-space-2)" }}>
                <h2 className="ds-h4">Publication settings</h2>
                {isEdit && <StatusBadge status={formData.status} />}
              </div>

              <FormField id="article-category" label="Category" requiredMark>
                <select
                  className="ds-select"
                  id="article-category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {CATEGORIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </FormField>

              <div className="ds-field">
                <span className="ds-field-label">
                  Save as <span className="ds-required-mark" aria-hidden="true">*</span>
                </span>

                <div className="ds-segmented-options">
                  <label
                    className={`ds-segmented-option ${formData.status === "Draft" ? "is-selected" : ""}`.trim()}
                  >
                    <input
                      type="radio"
                      name="status"
                      value="Draft"
                      checked={formData.status === "Draft"}
                      onChange={handleChange}
                    />
                    <span>Draft</span>
                  </label>

                  <label
                    className={`ds-segmented-option ${formData.status === "Published" ? "is-selected" : ""}`.trim()}
                  >
                    <input
                      type="radio"
                      name="status"
                      value="Published"
                      checked={formData.status === "Published"}
                      onChange={handleChange}
                    />
                    <span>Published</span>
                  </label>
                </div>
              </div>

              <span className="ds-field-helper">
                Drafts are only visible to admins. Published articles become
                available in the knowledge base.
              </span>

              {isEdit && article && (
                <div
                  style={{
                    borderBlockStart: "1px solid var(--ds-border-divider)",
                    paddingBlockStart: "var(--ds-space-3)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                    fontSize: "0.875rem",
                    color: "var(--ds-text-muted)",
                  }}
                >
                  <span>Article ID: KB-00{article.id}</span>
                  <span>Last updated: {lastUpdated}</span>
                </div>
              )}
            </section>

            <AnimatePresence mode="wait">
              {formData.status === "Draft" ? (
                <motion.div
                  key="status-draft-notice"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18, ease: ISHARA_EASE }}
                >
                  <AuthFeedback variant="warning" title="Before publishing">
                    <p>
                      Check readability, permissions and technical instructions.
                      Guidance about PSL should be reviewed by knowledgeable experts
                      and the community.
                    </p>
                  </AuthFeedback>
                </motion.div>
              ) : (
                <motion.div
                  key="status-published-notice"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18, ease: ISHARA_EASE }}
                >
                  <AuthFeedback variant="info" title="Publishing updates">
                    <p>
                      This article will be visible in the knowledge base. Make sure
                      the information is accurate and easy to understand.
                    </p>
                  </AuthFeedback>
                </motion.div>
              )}
            </AnimatePresence>

            <section className="ds-card" style={{ padding: "var(--ds-space-5)", display: "flex", flexDirection: "column", gap: "var(--ds-space-2)" }}>
              <h2 className="ds-h4">Writing checklist</h2>
              <p className="ds-body-sm" style={{ color: "var(--ds-text-secondary)" }}>
                Use short, descriptive headings.
              </p>
              <p className="ds-body-sm" style={{ color: "var(--ds-text-secondary)" }}>
                Explain actions in plain language.
              </p>
              <p className="ds-body-sm" style={{ color: "var(--ds-text-secondary)" }}>
                Do not make unsupported accuracy claims or insert sign examples.
              </p>
            </section>

            {isEdit && (
              <AuthFeedback variant="info" title="Content responsibility">
                <p>
                  This article explains recording techniques, not how to perform
                  signs. PSL references require expert and community review.
                </p>
              </AuthFeedback>
            )}
          </aside>
        </StaggerItem>
      </form>
    </StaggerContainer>
  );
}
