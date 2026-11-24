import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  FileVideo,
  Info,
  PlayCircle,
  ScanFace,
  Sun,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { logoutUser } from "../api/auth";
import AuthFeedback from "../components/AuthFeedback";
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

const MAX_FILE_SIZE = 250 * 1024 * 1024;
const VIDEO_FORMATS = {
  mp4: { mime: "video/mp4", label: "MP4" },
  webm: { mime: "video/webm", label: "WebM" },
  avi: { mime: "video/x-msvideo", label: "AVI" },
};

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024)
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "Duration unavailable";
  const total = Math.floor(seconds);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function getSupportedFormat(file) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  const format = VIDEO_FORMATS[extension];
  if (!format)
    return {
      error:
        "This file type isn’t supported. Choose an MP4, WebM, or AVI video.",
    };
  if (file.size === 0)
    return { error: "This file is empty. Choose a different video." };
  if (file.size > MAX_FILE_SIZE)
    return {
      error: "This video is too large. Choose a file smaller than 250 MB.",
    };

  const previewer = document.createElement("video");
  if (!previewer.canPlayType(format.mime)) {
    return {
      error: `${format.label} preview is not supported by this browser. Choose an MP4 or WebM file this browser can play.`,
    };
  }

  return { format };
}

function Tip({ icon: IconComp, title, children }) {
  return (
    <li className="ds-tip-item">
      <span className="ds-tip-icon" aria-hidden="true">
        <IconComp size={18} strokeWidth={1.75} />
      </span>
      <div>
        <strong>{title}</strong>
        <span>{children}</span>
      </div>
    </li>
  );
}

export default function UploadVideo({ user }) {
  const navigate = useNavigate();
  const reduced = usePrefersReducedMotion();
  const inputRef = useRef(null);
  const videoRef = useRef(null);
  const objectUrlRef = useRef("");
  const currentUrlRef = useRef("");

  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState(null);
  const [previewState, setPreviewState] = useState("idle");
  const [fileError, setFileError] = useState("");
  const [fileErrorName, setFileErrorName] = useState("");
  const [previewError, setPreviewError] = useState("");
  const [submissionNotice, setSubmissionNotice] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    []
  );

  function releaseSelection() {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = "";
    currentUrlRef.current = "";
    setVideoUrl("");
    setFile(null);
    setDuration(null);
    setPreviewState("idle");
    setPreviewError("");
    setSubmissionNotice("");
  }

  function chooseFile(nextFile) {
    if (!nextFile) return;
    releaseSelection();
    setFileError("");
    setFileErrorName("");

    const result = getSupportedFormat(nextFile);
    if (result.error) {
      setFileError(result.error);
      setFileErrorName(nextFile.name);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const url = URL.createObjectURL(nextFile);
    objectUrlRef.current = url;
    currentUrlRef.current = url;
    setFile(nextFile);
    setVideoUrl(url);
    setPreviewState("loading");
    setSubmissionNotice("");
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleInput(event) {
    chooseFile(event.target.files?.[0]);
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    chooseFile(event.dataTransfer.files?.[0]);
  }

  function handleDragOver(event) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event) {
    if (!event.currentTarget.contains(event.relatedTarget))
      setIsDragging(false);
  }

  function handlePreviewError(url) {
    if (currentUrlRef.current !== url) return;
    setDuration(null);
    setPreviewState("error");
    setPreviewError(
      "This video could not be previewed. It may be damaged or encoded with an unsupported codec. Choose another file."
    );
  }

  function removeVideo() {
    releaseSelection();
    setFileError("");
    setFileErrorName("");
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleSubmit() {
    if (!file || previewState !== "ready" || previewError) return;
    setSubmissionNotice(
      "Upload and translation services are not connected yet. Your video has not been uploaded or submitted for translation."
    );
  }

  function handleLogout() {
    releaseSelection();
    logoutUser();
    navigate("/login", { replace: true });
  }

  const invalid = Boolean(fileError || previewError || previewState === "error");
  const hasSelection = Boolean(file && videoUrl);
  const hasValidPreview = Boolean(
    file && videoUrl && previewState === "ready" && !previewError
  );

  const badgeStatus = invalid
    ? "Invalid file"
    : hasValidPreview
      ? "Video selected"
      : hasSelection && previewState === "loading"
        ? "Checking preview"
        : "No video selected";

  return (
    <UserShell user={user} onLogout={handleLogout} pageTitle="Upload Video">
      <PageHeader
        eyebrow="Video upload"
        title="Upload Video"
        description="Choose a recorded PSL video for translation."
        actions={
          <Button variant="secondary" size="sm" to="/dashboard">
            <ArrowLeft
              size={16}
              strokeWidth={2}
              className="ds-rtl-flip"
              aria-hidden="true"
            />
            <span>Back to Dashboard</span>
          </Button>
        }
      />

      <input
        ref={inputRef}
        id="ish-upload-file"
        className="ds-sr-only"
        type="file"
        accept=".mp4,.webm,.avi,video/mp4,video/webm,video/x-msvideo"
        onChange={handleInput}
      />

      <StaggerContainer className="ds-media-layout" stagger={0.07} delay={0.03}>
        <StaggerItem y={14}>
          <section className="ds-stage-card" aria-label="Video selection and preview">
            <div className="ds-stage-card-head">
              <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-2)" }}>
                <Video size={18} strokeWidth={2} aria-hidden="true" />
                <strong style={{ fontSize: "1rem" }}>
                  {hasValidPreview
                    ? "Review your video"
                    : fileError
                      ? "Choose a supported video"
                      : hasSelection && previewState === "loading"
                        ? "Checking your video"
                        : "Choose your video"}
                </strong>
              </div>

              <StatusBadge
                status={badgeStatus}
                tone={
                  invalid
                    ? "error"
                    : hasValidPreview
                      ? "success"
                      : hasSelection && previewState === "loading"
                        ? "info"
                        : "neutral"
                }
              />
            </div>

            {!hasSelection ? (
              <div style={{ padding: "var(--ds-space-5)", display: "flex", flexDirection: "column", gap: "var(--ds-space-4)" }}>
                <motion.label
                  className={`ds-dropzone ${isDragging ? "is-dragging" : ""} ${invalid ? "is-error" : ""}`.trim()}
                  htmlFor="ish-upload-file"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  animate={reduced ? undefined : { scale: isDragging ? 1.012 : 1 }}
                  transition={{ duration: reduced ? 0.01 : 0.16, ease: ISHARA_EASE }}
                >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    inlineSize: "3.5rem",
                    blockSize: "3.5rem",
                    borderRadius: "var(--ds-radius-full)",
                    background: invalid
                      ? "var(--ds-status-error-bg)"
                      : "var(--ish-brand-gradient-soft)",
                    border: invalid
                      ? "1px solid var(--ds-danger-border)"
                      : "1px solid rgba(11, 132, 180, 0.24)",
                    color: invalid
                      ? "var(--ds-status-error)"
                      : "var(--ds-text-link)",
                  }}
                  aria-hidden="true"
                >
                  {invalid ? (
                    <AlertCircle size={26} strokeWidth={1.75} />
                  ) : (
                    <Upload size={26} strokeWidth={1.75} />
                  )}
                </span>

                <strong className="ds-h4">
                  {invalid
                    ? "This video can’t be previewed"
                    : "Drag and drop your video here"}
                </strong>
                <span className="ds-body-sm" style={{ color: "var(--ds-text-secondary)" }}>
                  {invalid
                    ? "Choose a different video file to continue."
                    : "Or choose a recorded PSL video from your device."}
                </span>

                <span className="ds-btn ds-btn--secondary ds-btn--sm">
                  {invalid ? "Choose Another Video" : "Browse Files"}
                </span>

                <div className="ds-dropzone-chips">
                  <span className="ds-format-chip">MP4</span>
                  <span className="ds-format-chip">WebM</span>
                  <span className="ds-format-chip">AVI</span>
                  <span className="ds-format-chip">Max 250 MB</span>
                </div>
              </motion.label>

              {(fileError || previewError) && (
                <AuthFeedback
                  variant="error"
                  title={
                    previewError
                      ? "Video preview failed"
                      : "This file can’t be used"
                  }
                >
                  <p>
                    {previewError || fileError}
                    {fileErrorName ? ` (${fileErrorName})` : ""}
                  </p>
                </AuthFeedback>
              )}

              {submissionNotice && (
                <AuthFeedback
                  variant="info"
                  title="Upload is not available yet"
                >
                  <p>{submissionNotice}</p>
                </AuthFeedback>
              )}

              <div className="ds-stage-controls" style={{ paddingInline: 0, paddingBlockEnd: 0 }}>
                <span className="ds-body-sm" style={{ color: "var(--ds-text-muted)" }}>
                  {invalid
                    ? "Choose a supported video to continue."
                    : "Choose a video to continue."}
                </span>
                <Button variant="primary" onClick={handleSubmit} disabled>
                  Submit for Translation
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="ds-stage-viewport ds-on-dark">
                <video
                  ref={videoRef}
                  className="ds-stage-video ds-stage-video--contain"
                  src={videoUrl}
                  controls
                  playsInline
                  preload="metadata"
                  aria-label={`Preview of ${file.name}`}
                  onLoadedMetadata={(event) => {
                    if (currentUrlRef.current !== videoUrl) return;
                    const video = event.currentTarget;
                    if (video.videoWidth <= 0 || video.videoHeight <= 0) {
                      handlePreviewError(videoUrl);
                      return;
                    }
                    setDuration(
                      Number.isFinite(video.duration) && video.duration >= 0
                        ? video.duration
                        : null
                    );
                    setPreviewError("");
                    setPreviewState("ready");
                  }}
                  onError={() => handlePreviewError(videoUrl)}
                />
              </div>

              <div style={{ padding: "var(--ds-space-5)", display: "flex", flexDirection: "column", gap: "var(--ds-space-4)" }}>
                {previewState === "loading" && (
                  <AuthFeedback
                    variant="info"
                    title="Checking video preview"
                  >
                    <p>
                      Wait for the browser to load the video metadata before
                      submitting.
                    </p>
                  </AuthFeedback>
                )}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--ds-space-3)",
                    padding: "var(--ds-space-3) var(--ds-space-4)",
                    borderRadius: "var(--ds-radius-md)",
                    backgroundColor: "var(--ds-bg-sunken)",
                    border: "1px solid var(--ds-border-subtle)",
                  }}
                >
                  <FileVideo
                    size={22}
                    strokeWidth={1.75}
                    style={{ color: "var(--ds-text-link)", flexShrink: 0 }}
                    aria-hidden="true"
                  />
                  <div style={{ minInlineSize: 0, flex: "1 1 auto" }}>
                    <strong
                      title={file.name}
                      style={{
                        display: "block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {file.name}
                    </strong>
                    <span
                      className="ds-tabular"
                      style={{ fontSize: "0.875rem", color: "var(--ds-text-secondary)" }}
                    >
                      {formatFileSize(file.size)}
                      {duration === null
                        ? ` · ${previewState === "loading" ? "Reading duration…" : "Duration unavailable"}`
                        : ` · ${formatDuration(duration)}`}
                    </span>
                  </div>
                </div>

                {previewError && (
                  <AuthFeedback variant="error" title="Video preview failed">
                    <p>{previewError}</p>
                  </AuthFeedback>
                )}

                {submissionNotice && (
                  <AuthFeedback
                    variant="info"
                    title="Upload is not available yet"
                  >
                    <p>{submissionNotice}</p>
                  </AuthFeedback>
                )}

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "var(--ds-space-3)",
                  }}
                >
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--ds-space-3)" }}>
                    <Button
                      variant="secondary"
                      onClick={() => inputRef.current?.click()}
                    >
                      Replace Video
                    </Button>
                    <Button variant="tertiary" onClick={removeVideo}>
                      <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" />
                      <span>Remove Video</span>
                    </Button>
                  </div>

                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={!hasValidPreview}
                  >
                    Submit for Translation
                  </Button>
                </div>
              </div>
            </div>
          )}
          </section>
        </StaggerItem>

        <StaggerItem y={14}>
          <aside style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-4)" }}>
          <div className="ds-mobile-tips-only">
            <details className="ds-mobile-tips-details">
              <summary>
                <span>Before you upload</span>
                <ChevronDown size={18} strokeWidth={2} aria-hidden="true" />
              </summary>
              <ul
                className="ds-tips-list"
                style={{ listStyle: "none", marginTop: "var(--ds-space-3)" }}
              >
                <Tip icon={FileVideo} title="Choose a video file">
                  MP4, WebM, or browser-playable AVI.
                </Tip>
                <Tip icon={ScanFace} title="Keep signing clearly visible">
                  Your face, hands and upper body should stay in view.
                </Tip>
                <Tip icon={Sun} title="Check the recording">
                  Use a clear, well-lit video with one complete thought.
                </Tip>
              </ul>
            </details>
          </div>

          <section className="ds-tips-panel ds-desktop-tips-only">
            <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-2)" }}>
              <Video size={20} strokeWidth={1.75} style={{ color: "var(--ds-text-link)" }} aria-hidden="true" />
              <h2 className="ds-h4">Before you upload</h2>
            </div>

            <ul className="ds-tips-list" style={{ listStyle: "none" }}>
              <Tip icon={FileVideo} title="Choose a video file">
                MP4, WebM, or browser-playable AVI.
              </Tip>
              <Tip icon={ScanFace} title="Keep signing clearly visible">
                Your face, hands and upper body should stay in view.
              </Tip>
              <Tip icon={Sun} title="Check the recording">
                Use a clear, well-lit video with one complete thought.
              </Tip>
            </ul>
          </section>

          <section className="ds-tips-panel">
            <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-2)" }}>
              <PlayCircle size={20} strokeWidth={1.75} style={{ color: "var(--ds-text-link)" }} aria-hidden="true" />
              <h2 className="ds-h4">You’re in control</h2>
            </div>
            <p className="ds-body-sm" style={{ color: "var(--ds-text-secondary)" }}>
              Review your video before submitting it. You can replace or remove
              it if you picked the wrong file.
            </p>
            <div className="ds-dropzone-chips" style={{ justifyContent: "flex-start" }}>
              <span className="ds-format-chip">MP4</span>
              <span className="ds-format-chip">WEBM</span>
              <span className="ds-format-chip">AVI</span>
            </div>
          </section>
          </aside>
        </StaggerItem>
      </StaggerContainer>

      <nav
        className="ds-stepper"
        style={{ marginBlockStart: "var(--ds-space-6)" }}
        aria-label="Video workflow"
      >
        <div
          className={`ds-step ${!hasValidPreview ? "is-current" : "is-done"}`}
          aria-current={!hasValidPreview ? "step" : undefined}
        >
          <span className="ds-step-marker" aria-hidden="true">
            {hasValidPreview ? (
              <CheckCircle2 size={16} strokeWidth={2.25} />
            ) : (
              <Upload size={16} strokeWidth={2} />
            )}
          </span>
          <div>
            <span>Choose your video</span>
            <span className="ds-step-note">MP4, WebM, or AVI up to 250 MB</span>
          </div>
        </div>

        <div
          className={`ds-step ${hasValidPreview ? "is-current" : ""}`}
          aria-current={hasValidPreview ? "step" : undefined}
        >
          <span className="ds-step-marker" aria-hidden="true">
            <PlayCircle size={16} strokeWidth={2} />
          </span>
          <div>
            <span>Review your video</span>
            <span className="ds-step-note">Verify playback and framing</span>
          </div>
        </div>

        <div className="ds-step">
          <span className="ds-step-marker" aria-hidden="true">
            <FileVideo size={16} strokeWidth={2} />
          </span>
          <div>
            <span>Submit for translation</span>
            <span className="ds-step-note">Available when backend connects</span>
          </div>
        </div>
      </nav>

      <p
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--ds-space-2)",
          marginBlockStart: "var(--ds-space-4)",
          fontSize: "0.875rem",
          color: "var(--ds-text-muted)",
        }}
      >
        <Info size={16} strokeWidth={1.75} aria-hidden="true" />
        <span>
          Uploading a video does not start translation. Submission will be
          available when backend integration is ready.
        </span>
      </p>
    </UserShell>
  );
}
