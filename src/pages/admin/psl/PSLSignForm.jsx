import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Film, Image as ImageIcon, Upload } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  createPSLSign,
  updatePSLSign,
  uploadPSLSignMedia,
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

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://slicing-defrost-pacemaker.ngrok-free.dev";

function resolveMediaUrl(url) {
  if (!url) return "";
  if (/^(blob:|data:|https?:)/i.test(url)) return url;
  return `${API_BASE_URL}${url}`;
}

const CATEGORIES = [
  "Everyday communication",
  "Greetings",
  "Food & drink",
  "Travel",
  "Social",
  "Health",
  "Education",
];

const EMPTY_FORM = {
  label: "",
  category: "Everyday communication",
  notes: "",
};

export default function PSLSignForm({ mode = "add", sign = null }) {
  const navigate = useNavigate();
  const isEdit = mode === "edit";

  const [formData, setFormData] = useState(() =>
    isEdit && sign
      ? {
          label: sign.word || "",
          category: sign.category || "Everyday communication",
          notes: sign.description || "",
        }
      : EMPTY_FORM
  );

  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [videoPreviewUrl, setVideoPreviewUrl] = useState("");
  const imagePreviewRef = useRef("");
  const videoPreviewRef = useRef("");
  const previewUrlRegistryRef = useRef(new Set());

  useEffect(() => {
    document.title = isEdit
      ? "Edit PSL sign — ISHARA AI Admin"
      : "Add PSL sign — ISHARA AI Admin";
  }, [isEdit]);

  // Release temporary preview URLs when this form leaves the page.
  useEffect(() => {
    const previewUrlRegistry = previewUrlRegistryRef.current;
    return () => {
      for (const url of previewUrlRegistry) URL.revokeObjectURL(url);
    };
  }, []);

  function replacePreview(file, previewRef, setPreviewUrl) {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewUrlRegistryRef.current.delete(previewRef.current);
    }
    previewRef.current = file ? URL.createObjectURL(file) : "";
    if (previewRef.current)
      previewUrlRegistryRef.current.add(previewRef.current);
    setPreviewUrl(previewRef.current);
  }

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const validateFile = (file, type) => {
    if (!file) return "";

    const extension = file.name.split(".").pop().toLowerCase();

    if (type === "image") {
      if (!["jpg", "jpeg", "png", "webp"].includes(extension)) {
        return "Image must be JPG, JPEG, PNG, or WEBP.";
      }

      if (file.size > 5 * 1024 * 1024) {
        return "Image size must not exceed 5 MB.";
      }
    }

    if (type === "video") {
      if (!["mp4", "webm", "mov"].includes(extension)) {
        return "Video must be MP4, WEBM, or MOV.";
      }

      if (file.size > 50 * 1024 * 1024) {
        return "Video size must not exceed 50 MB.";
      }
    }

    return "";
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    const validationError = validateFile(file, "image");

    if (validationError) {
      setError(validationError);
      setImageFile(null);
      replacePreview(null, imagePreviewRef, setImagePreviewUrl);
      event.target.value = "";
      return;
    }

    setError("");
    setImageFile(file);
    replacePreview(file, imagePreviewRef, setImagePreviewUrl);
  };

  const handleVideoChange = (event) => {
    const file = event.target.files?.[0] || null;
    const validationError = validateFile(file, "video");

    if (validationError) {
      setError(validationError);
      setVideoFile(null);
      replacePreview(null, videoPreviewRef, setVideoPreviewUrl);
      event.target.value = "";
      return;
    }

    setError("");
    setVideoFile(file);
    replacePreview(file, videoPreviewRef, setVideoPreviewUrl);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.label.trim()) {
      setError("Please enter an English gloss.");
      return;
    }

    if (!formData.category.trim()) {
      setError("Please select a category.");
      return;
    }

    const payload = {
      word: formData.label.trim(),
      description: formData.notes.trim() || null,
      category: formData.category,
      video_url: isEdit ? sign?.video_url || null : null,
      image_url: isEdit ? sign?.image_url || null : null,
      status: "draft",
    };

    try {
      setIsSaving(true);
      setError("");

      let savedSign;

      if (isEdit) {
        savedSign = await updatePSLSign(sign.id, payload);
      } else {
        savedSign = await createPSLSign(payload);
      }

      if (imageFile) {
        await uploadPSLSignMedia(savedSign.id, imageFile, "image");
      }

      if (videoFile) {
        await uploadPSLSignMedia(savedSign.id, videoFile, "video");
      }

      navigate("/admin/psl-dictionary");
    } catch (err) {
      setError(
        err.message || `Unable to ${isEdit ? "update" : "create"} PSL sign.`
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <StaggerContainer
      stagger={0.05}
      style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-4)" }}
    >
      <StaggerItem>
        <Breadcrumb
          parentLabel="PSL dictionary"
          parentTo="/admin/psl-dictionary"
          items={[
            { label: "PSL dictionary", to: "/admin/psl-dictionary" },
            { label: isEdit ? "Edit PSL sign" : "Add PSL sign" },
          ]}
        />
      </StaggerItem>

      <PageHeader
        eyebrow="Dictionary"
        title={isEdit ? "Edit PSL sign" : "Add PSL sign"}
        description={
          isEdit
            ? "Update the draft reference and reviewer notes. This example has not been validated."
            : "Prepare a dictionary draft with a traceable reference. Saving does not approve a sign."
        }
      />

      <div className="ds-admin-form-layout">
        <StaggerItem>
          <form
            className="ds-card"
            style={{ padding: "var(--ds-space-6)", display: "flex", flexDirection: "column", gap: "var(--ds-space-5)" }}
            onSubmit={handleSubmit}
          >
            <div className="ds-dash-section-head" style={{ marginBlockEnd: 0 }}>
              <div>
                <h2 className="ds-h3">Sign entry</h2>
                {isEdit && (
                  <p className="ds-body-sm" style={{ color: "var(--ds-text-muted)" }}>
                    PSL-SIGN-{String(sign?.id || "").padStart(4, "0")} · Example draft
                  </p>
                )}
              </div>
              <StatusBadge status="Draft - Not validated" tone="warning" />
            </div>

            <AnimatePresence initial={false}>
              {error && (
                <motion.div
                  key="psl-form-error"
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

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))",
              gap: "var(--ds-space-4)",
            }}
          >
            <FormField id="psl-label" label="Label / English gloss" requiredMark>
              <input
                className="ds-input"
                id="psl-label"
                name="label"
                value={formData.label}
                onChange={handleChange}
                placeholder="Enter an English meaning"
                required
                maxLength={150}
              />
            </FormField>

            <FormField id="psl-category" label="Category" requiredMark>
              <select
                className="ds-select"
                id="psl-category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          {/* IMAGE UPLOAD */}
          <div className="ds-field">
            <span className="ds-field-label">Reference image</span>

            {((imageFile && imagePreviewUrl) ||
              (isEdit && sign?.image_url)) && (
              <div
                style={{
                  borderRadius: "var(--ds-radius-md)",
                  border: "1px solid var(--ds-border-subtle)",
                  backgroundColor: "var(--ds-bg-sunken)",
                  padding: "var(--ds-space-3)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--ds-space-2)",
                  maxInlineSize: "20rem",
                }}
              >
                <img
                  src={
                    (imageFile && imagePreviewUrl) ||
                    resolveMediaUrl(sign.image_url)
                  }
                  alt={`${formData.label || "PSL sign"} reference`}
                  style={{
                    inlineSize: "100%",
                    maxBlockSize: "14rem",
                    objectFit: "contain",
                    borderRadius: "var(--ds-radius-sm)",
                  }}
                />
                <span className="ds-body-sm" style={{ color: "var(--ds-text-muted)" }}>
                  {imageFile ? "New image preview" : "Current reference image"}
                </span>
              </div>
            )}

            {imageFile ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "var(--ds-space-3)",
                  padding: "var(--ds-space-3) var(--ds-space-4)",
                  borderRadius: "var(--ds-radius-sm)",
                  border: "1px solid var(--ds-border-subtle)",
                  backgroundColor: "var(--ds-bg-sunken)",
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--ds-space-2)", minInlineSize: 0 }}>
                  <ImageIcon size={18} strokeWidth={1.75} aria-hidden="true" />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {imageFile.name}
                  </span>
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setImageFile(null);
                    replacePreview(null, imagePreviewRef, setImagePreviewUrl);
                  }}
                  disabled={isSaving}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <label className="ds-dropzone" htmlFor="psl-image">
                <Upload size={22} strokeWidth={1.75} style={{ color: "var(--ds-text-link)" }} aria-hidden="true" />
                <strong>Upload reference image</strong>
                <span className="ds-body-sm" style={{ color: "var(--ds-text-secondary)" }}>
                  Drag and drop your image here or choose a file
                </span>
                <span className="ds-btn ds-btn--secondary ds-btn--sm">
                  Choose image
                </span>
                <input
                  id="psl-image"
                  className="ds-sr-only"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  disabled={isSaving}
                />
              </label>
            )}

            <small className="ds-field-helper">
              JPG, JPEG, PNG, WEBP · Maximum 5 MB
            </small>
          </div>

          {/* VIDEO UPLOAD */}
          <div className="ds-field">
            <span className="ds-field-label">Reference video</span>

            {((videoFile && videoPreviewUrl) ||
              (isEdit && sign?.video_url)) && (
              <div
                style={{
                  borderRadius: "var(--ds-radius-md)",
                  border: "1px solid var(--ds-border-subtle)",
                  backgroundColor: "var(--ds-bg-brand-deep)",
                  padding: "var(--ds-space-3)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--ds-space-2)",
                }}
              >
                <video
                  src={
                    (videoFile && videoPreviewUrl) ||
                    resolveMediaUrl(sign.video_url)
                  }
                  controls
                  preload="metadata"
                  style={{
                    inlineSize: "100%",
                    maxBlockSize: "18rem",
                    borderRadius: "var(--ds-radius-sm)",
                    backgroundColor: "#000000",
                  }}
                />
                <span className="ds-body-sm" style={{ color: "var(--ds-text-on-brand-secondary)" }}>
                  {videoFile ? "New video preview" : "Current reference video"}
                </span>
              </div>
            )}

            {videoFile ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "var(--ds-space-3)",
                  padding: "var(--ds-space-3) var(--ds-space-4)",
                  borderRadius: "var(--ds-radius-sm)",
                  border: "1px solid var(--ds-border-subtle)",
                  backgroundColor: "var(--ds-bg-sunken)",
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--ds-space-2)", minInlineSize: 0 }}>
                  <Film size={18} strokeWidth={1.75} aria-hidden="true" />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {videoFile.name}
                  </span>
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setVideoFile(null);
                    replacePreview(null, videoPreviewRef, setVideoPreviewUrl);
                  }}
                  disabled={isSaving}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <label className="ds-dropzone" htmlFor="psl-video">
                <Upload size={22} strokeWidth={1.75} style={{ color: "var(--ds-text-link)" }} aria-hidden="true" />
                <strong>Upload reference video</strong>
                <span className="ds-body-sm" style={{ color: "var(--ds-text-secondary)" }}>
                  Drag and drop your video here or choose a file
                </span>
                <span className="ds-btn ds-btn--secondary ds-btn--sm">
                  Choose video
                </span>
                <input
                  id="psl-video"
                  className="ds-sr-only"
                  type="file"
                  accept=".mp4,.webm,.mov,video/mp4,video/webm,video/quicktime"
                  onChange={handleVideoChange}
                  disabled={isSaving}
                />
              </label>
            )}

            <small className="ds-field-helper">
              MP4, WEBM, MOV · Maximum 50 MB
            </small>
          </div>

          <FormField
            id="psl-notes"
            label="Notes for reviewers"
            helperText="Do not describe an invalid sign or mark an unreviewed video as approved."
          >
            <textarea
              className="ds-textarea"
              id="psl-notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Describe the signer, permission, region or context, and any questions for reviewers."
              rows={4}
            />
          </FormField>

          <div className="ds-form-sticky-bar ds-form-sticky-bar--mobile">
            <span className="ds-body-sm" style={{ color: "var(--ds-text-muted)" }}>
              * Required fields
            </span>

            <div style={{ display: "flex", gap: "var(--ds-space-3)" }}>
              <Button
                variant="secondary"
                onClick={() => navigate("/admin/psl-dictionary")}
                disabled={isSaving}
              >
                Cancel
              </Button>

              <Button
                variant="primary"
                type="submit"
                loading={isSaving}
                loadingLabel="Saving..."
              >
                {isEdit ? "Save changes" : "Save draft"}
              </Button>
            </div>
          </div>
          </form>
        </StaggerItem>

        <StaggerItem>
          <aside style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-4)" }}>
            <AuthFeedback
              variant="info"
              title={
                isEdit
                  ? "Awaiting expert/community validation"
                  : "Validation required"
              }
            >
              <p>
                {isEdit
                  ? "This draft is not approved PSL content. It requires review and validation before publication."
                  : "A draft entry must undergo review and validation before publication in the approved PSL dictionary."}
              </p>
            </AuthFeedback>

            {isEdit ? (
              <section className="ds-card" style={{ padding: "var(--ds-space-5)", display: "flex", flexDirection: "column", gap: "var(--ds-space-3)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--ds-space-2)" }}>
                  <h2 className="ds-h4">Review status</h2>
                  <StatusBadge status="Not reviewed" tone="neutral" />
                </div>

                <div className="ds-ruled-list">
                  <div className="ds-ruled-item">
                    <span className="ds-body-sm">Expert review:</span>
                    <strong className="ds-body-sm">Not completed</strong>
                  </div>
                  <div className="ds-ruled-item">
                    <span className="ds-body-sm">Community review:</span>
                    <strong className="ds-body-sm">Not completed</strong>
                  </div>
                </div>

                <p className="ds-body-sm" style={{ color: "var(--ds-text-muted)" }}>
                  Saving updates this draft; it does not publish or validate the
                  sign.
                </p>
              </section>
            ) : (
              <section className="ds-card" style={{ padding: "var(--ds-space-5)", display: "flex", flexDirection: "column", gap: "var(--ds-space-3)" }}>
                <h2 className="ds-h4">A responsible reference</h2>
                <ul
                  style={{
                    paddingInlineStart: "1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--ds-space-2)",
                    fontSize: "0.9375rem",
                    color: "var(--ds-text-secondary)",
                  }}
                >
                  <li>
                    Provide an English gloss, not a claim of a universal sign.
                  </li>
                  <li>
                    Note regional variation and the source of your reference.
                  </li>
                  <li>Confirm permission to use the recording.</li>
                  <li>Keep the entry in Draft until the review is complete.</li>
                </ul>
              </section>
            )}
          </aside>
        </StaggerItem>
      </div>
    </StaggerContainer>
  );
}
