import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Film,
  Hand,
  Info,
  PlayCircle,
  RotateCcw,
  ScanFace,
  ShieldCheck,
  Square,
  Sun,
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

const INITIAL_MESSAGE =
  "Allow camera access to preview and record your signing. Recording will not start automatically.";

function formatTime(seconds) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(safeSeconds / 60)).padStart(2, "0")}:${String(safeSeconds % 60).padStart(2, "0")}`;
}

function getCameraError(error) {
  if (
    error?.name === "NotAllowedError" ||
    error?.name === "PermissionDeniedError"
  ) {
    return "Camera access was denied. Allow camera permission in your browser settings, then try again.";
  }
  if (
    error?.name === "NotFoundError" ||
    error?.name === "DevicesNotFoundError"
  ) {
    return "No camera was found. Connect a camera and try again.";
  }
  if (
    error?.name === "NotReadableError" ||
    error?.name === "TrackStartError"
  ) {
    return "Your camera could not be started. It may be in use by another app.";
  }
  if (error?.name === "OverconstrainedError") {
    return "The available camera does not meet the browser's video requirements.";
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    return "Camera access is not supported in this browser or page context. Open the site in a supported browser over HTTPS or localhost.";
  }
  return "The camera could not be started. Check your browser permissions and try again.";
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

export default function LiveCamera({ user }) {
  const navigate = useNavigate();
  const reduced = usePrefersReducedMotion();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const recordingUrlRef = useRef("");
  const timerRef = useRef(null);
  const startedAtRef = useRef(0);
  const mountedRef = useRef(true);

  const [phase, setPhase] = useState("permission");
  const [cameraError, setCameraError] = useState("");
  const [recordingError, setRecordingError] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [clipDuration, setClipDuration] = useState(null);
  const [clipDurationLoading, setClipDurationLoading] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState("");
  const [requestingCamera, setRequestingCamera] = useState(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      window.clearInterval(timerRef.current);
      if (recorderRef.current?.state === "recording") {
        try {
          recorderRef.current.stop();
        } catch {
          /* Browser may already be stopping it. */
        }
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (recordingUrlRef.current) URL.revokeObjectURL(recordingUrlRef.current);
    };
  }, []);

  useEffect(() => {
    if (phase === "ready" || phase === "recording") {
      if (
        videoRef.current &&
        streamRef.current &&
        videoRef.current.srcObject !== streamRef.current
      ) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [phase]);

  async function requestCamera() {
    if (streamRef.current || requestingCamera) return;
    setCameraError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(getCameraError());
      return;
    }
    setRequestingCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      stream.getVideoTracks().forEach((track) => {
        track.addEventListener(
          "ended",
          () => {
            if (!mountedRef.current) return;
            streamRef.current = null;
            setCameraError(
              "The camera connection ended. Reconnect or re-enable your camera to continue."
            );
            setPhase("permission");
          },
          { once: true }
        );
      });
      setPhase("ready");
    } catch (error) {
      if (mountedRef.current) setCameraError(getCameraError(error));
    } finally {
      if (mountedRef.current) setRequestingCamera(false);
    }
  }

  function startRecording() {
    const stream = streamRef.current;
    if (!stream || !window.MediaRecorder) {
      setRecordingError("Video recording is not supported in this browser.");
      return;
    }
    if (recorderRef.current?.state === "recording") return;

    setRecordingError("");
    chunksRef.current = [];
    setElapsed(0);
    setClipDuration(null);
    setClipDurationLoading(false);

    let recorder;
    try {
      const preferredType = [
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/webm",
      ].find((type) => MediaRecorder.isTypeSupported?.(type));
      recorder = new MediaRecorder(
        stream,
        preferredType ? { mimeType: preferredType } : undefined
      );
    } catch {
      setRecordingError(
        "This browser could not prepare a video recording. Please try another supported browser."
      );
      return;
    }

    recorderRef.current = recorder;
    let recordingFailed = false;

    recorder.ondataavailable = (event) => {
      if (event.data?.size) chunksRef.current.push(event.data);
    };
    recorder.onerror = () => {
      recordingFailed = true;
      window.clearInterval(timerRef.current);
      if (mountedRef.current) {
        setRecordingError("A recording error occurred. Please try recording again.");
      }
      if (recorder.state === "recording") {
        try {
          recorder.stop();
        } catch {
          /* Recorder may have already stopped. */
        }
      }
    };
    recorder.onstop = () => {
      window.clearInterval(timerRef.current);
      if (!mountedRef.current) {
        chunksRef.current = [];
        return;
      }
      const blob = new Blob(chunksRef.current, {
        type: recorder.mimeType || "video/webm",
      });
      chunksRef.current = [];
      setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
      if (recordingFailed) {
        setClipDurationLoading(false);
        setPhase("ready");
        return;
      }
      if (!blob.size) {
        setRecordingError(
          "No video data was captured. Please try recording again."
        );
        setClipDurationLoading(false);
        setPhase("ready");
        return;
      }
      const nextUrl = URL.createObjectURL(blob);
      if (recordingUrlRef.current) URL.revokeObjectURL(recordingUrlRef.current);
      recordingUrlRef.current = nextUrl;
      setRecordingUrl(nextUrl);
      setClipDuration(null);
      setClipDurationLoading(true);
      setPhase("review");
    };

    try {
      recorder.start(250);
      startedAtRef.current = Date.now();
      setPhase("recording");
      timerRef.current = window.setInterval(() => {
        setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
      }, 250);
    } catch {
      recorderRef.current = null;
      setRecordingError(
        "Recording could not be started. Check your camera and try again."
      );
    }
  }

  function stopRecording() {
    window.clearInterval(timerRef.current);
    setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
    const recorder = recorderRef.current;
    if (recorder?.state === "recording") recorder.stop();
  }

  function recordAgain() {
    chunksRef.current = [];
    if (recordingUrlRef.current) URL.revokeObjectURL(recordingUrlRef.current);
    recordingUrlRef.current = "";
    setRecordingUrl("");
    setClipDuration(null);
    setClipDurationLoading(false);
    setElapsed(0);
    setRecordingError("");
    setPhase("ready");
  }

  function handleLogout() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    logoutUser();
    navigate("/login", { replace: true });
  }

  const reviewing = phase === "review";
  const status =
    phase === "permission"
      ? "Permission required"
      : phase === "recording"
        ? "Recording"
        : reviewing
          ? "Recording stopped"
          : "Camera ready";

  const statusTone =
    phase === "permission"
      ? "warning"
      : phase === "recording"
        ? "error"
        : reviewing
          ? "neutral"
          : "success";

  return (
    <UserShell user={user} onLogout={handleLogout} pageTitle="Live Camera">
      <PageHeader
        eyebrow="Live capture"
        title="Live Camera"
        description="Record your signing to translate it into text."
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

      <StaggerContainer className="ds-media-layout" stagger={0.07} delay={0.03}>
        <StaggerItem y={14}>
          <section
            className="ds-stage-card ds-stage-card--edge-mobile"
            aria-label={reviewing ? "Recorded video review" : "Camera preview"}
          >
          <div className="ds-stage-card-head">
            <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-2)" }}>
              {reviewing ? (
                <Film size={18} strokeWidth={2} aria-hidden="true" />
              ) : (
                <Video size={18} strokeWidth={2} aria-hidden="true" />
              )}
              <strong style={{ fontSize: "1rem" }}>
                {reviewing ? "Recorded clip" : "Camera preview"}
              </strong>
            </div>

            <StatusBadge status={status} tone={statusTone} />
          </div>

          <div className="ds-stage-viewport ds-stage-viewport--camera ds-on-dark">
            {reviewing && recordingUrl ? (
              <video
                className="ds-stage-video ds-stage-video--contain"
                src={recordingUrl}
                controls
                playsInline
                aria-label="Recorded signing video"
                onLoadedMetadata={(event) => {
                  const mediaDuration = event.currentTarget.duration;
                  setClipDuration(
                    Number.isFinite(mediaDuration) && mediaDuration >= 0
                      ? mediaDuration
                      : null
                  );
                  setClipDurationLoading(false);
                }}
                onDurationChange={(event) => {
                  const mediaDuration = event.currentTarget.duration;
                  if (Number.isFinite(mediaDuration) && mediaDuration >= 0) {
                    setClipDuration(mediaDuration);
                    setClipDurationLoading(false);
                  }
                }}
                onError={() => setClipDurationLoading(false)}
              />
            ) : (
              <>
                <video
                  ref={videoRef}
                  className={`ds-stage-video ${phase === "permission" ? "is-hidden" : ""}`.trim()}
                  autoPlay
                  muted
                  playsInline
                  aria-label="Live webcam preview"
                />

                <div className="ds-stage-overlay-top">
                  <StatusBadge
                    status={
                      phase === "recording"
                        ? "Recording"
                        : phase === "ready"
                          ? "Camera ready"
                          : "Permission required"
                    }
                    tone={statusTone}
                  />
                  {(phase === "recording" || phase === "ready") && (
                    <span className="ds-stage-timer-pill" aria-hidden="true">
                      {formatTime(elapsed)}
                    </span>
                  )}
                </div>

                {phase !== "permission" && (
                  <div
                    className={`ds-framing-guide ${phase === "recording" ? "is-recording" : ""}`.trim()}
                    aria-hidden="true"
                  >
                    <span className="ds-framing-corner ds-framing-corner--tl" />
                    <span className="ds-framing-corner ds-framing-corner--tr" />
                    <span className="ds-framing-corner ds-framing-corner--bl" />
                    <span className="ds-framing-corner ds-framing-corner--br" />
                  </div>
                )}

                {phase === "permission" && (
                  <div className="ds-stage-placeholder">
                    <span className="ds-stage-placeholder-icon" aria-hidden="true">
                      <ShieldCheck size={28} strokeWidth={1.75} />
                    </span>
                    <strong className="ds-h4" style={{ color: "var(--ds-text-on-brand)" }}>
                      Your camera is not on yet
                    </strong>
                    <span style={{ color: "var(--ds-text-on-brand-secondary)" }}>
                      Allow camera access to see your preview here.
                    </span>
                    <span style={{ fontSize: "0.875rem", color: "var(--ds-text-on-brand-secondary)", opacity: 0.85 }}>
                      No camera footage or sample signing is shown.
                    </span>
                  </div>
                )}

                {phase !== "permission" && (
                  <p className="ds-stage-bottom-caption">
                    {phase === "recording"
                      ? "Recording your clip — Sign naturally. Select Stop when you have finished."
                      : "Camera ready — Position yourself comfortably, then select Record."}
                  </p>
                )}
              </>
            )}
          </div>

          {phase === "permission" ? (
            <div className="ds-stage-controls">
              <div style={{ flex: "1 1 16rem" }}>
                <strong style={{ display: "block" }}>
                  Let’s set up your camera
                </strong>
                <span className="ds-body-sm" style={{ color: "var(--ds-text-secondary)" }}>
                  {INITIAL_MESSAGE}
                </span>
              </div>
              <Button
                variant="primary"
                size="lg"
                onClick={requestCamera}
                loading={requestingCamera}
                loadingLabel="Requesting…"
              >
                <Video size={18} strokeWidth={2} aria-hidden="true" />
                <span>Allow Camera</span>
              </Button>
            </div>
          ) : reviewing ? (
            <div className="ds-stage-controls">
              <div className="ds-timer-readout">
                <span>Complete clip</span>
                <strong className="ds-timer-value">
                  {clipDurationLoading
                    ? "Reading…"
                    : clipDuration === null
                      ? "Unavailable"
                      : formatTime(clipDuration)}
                </strong>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--ds-space-3)" }}>
                <Button variant="secondary" onClick={recordAgain}>
                  <RotateCcw size={16} strokeWidth={2} aria-hidden="true" />
                  <span>Record Again</span>
                </Button>
                <Button
                  variant="primary"
                  onClick={() =>
                    setRecordingError(
                      "Translation backend integration is not available yet. Your recording has not been submitted."
                    )
                  }
                >
                  <span>Submit for Translation</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="ds-stage-controls">
              <div className="ds-timer-readout">
                <span>Recording time</span>
                <strong className="ds-timer-value" aria-live="off">
                  {formatTime(elapsed)}
                </strong>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--ds-space-3)" }}>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={startRecording}
                  disabled={phase === "recording"}
                >
                  <CircleDot size={18} strokeWidth={2} aria-hidden="true" />
                  <span>Record</span>
                </Button>
                <Button
                  variant="danger"
                  size="lg"
                  onClick={stopRecording}
                  disabled={phase !== "recording"}
                >
                  <Square size={16} strokeWidth={2} aria-hidden="true" />
                  <span>Stop</span>
                </Button>
              </div>
            </div>
          )}

          <AnimatePresence>
            {(cameraError || recordingError) && (
              <motion.div
                style={{ padding: "0 var(--ds-space-5) var(--ds-space-5)" }}
                initial={reduced ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0.01 : 0.2, ease: ISHARA_EASE }}
              >
                <AuthFeedback variant="error">
                  <p>{cameraError || recordingError}</p>
                </AuthFeedback>
              </motion.div>
            )}
          </AnimatePresence>
          </section>
        </StaggerItem>

        <StaggerItem y={14}>
          <aside style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-4)" }}>
          {phase === "permission" && cameraError && (
            <AuthFeedback variant="warning" title="Camera unavailable">
              <p>{cameraError}</p>
            </AuthFeedback>
          )}

          <div className="ds-mobile-tips-only">
            <details className="ds-mobile-tips-details">
              <summary>
                <span>
                  {reviewing ? "Check your clip" : "Recording tips"}
                </span>
                <ChevronDown size={18} strokeWidth={2} aria-hidden="true" />
              </summary>
              <ul
                className="ds-tips-list"
                style={{ listStyle: "none", marginTop: "var(--ds-space-3)" }}
              >
                <Tip icon={ScanFace} title="Face and upper body visible">
                  Sit back so your expressions stay in frame.
                </Tip>
                <Tip icon={Hand} title="Keep both hands in view">
                  Leave room around you for natural movement.
                </Tip>
                <Tip icon={Sun} title="Use good, even lighting">
                  Face a light source and keep the camera steady.
                </Tip>
              </ul>
            </details>
          </div>

          <section className="ds-tips-panel ds-desktop-tips-only">
            <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-2)" }}>
              {reviewing ? (
                <CheckCircle2 size={20} strokeWidth={1.75} style={{ color: "var(--ds-text-link)" }} aria-hidden="true" />
              ) : (
                <ScanFace size={20} strokeWidth={1.75} style={{ color: "var(--ds-text-link)" }} aria-hidden="true" />
              )}
              <h2 className="ds-h4">
                {reviewing ? "Check your clip" : "For a clear recording"}
              </h2>
            </div>

            <ul className="ds-tips-list" style={{ listStyle: "none" }}>
              <Tip icon={ScanFace} title="Face and upper body visible">
                Sit back so your expressions stay in frame.
              </Tip>
              <Tip icon={Hand} title="Keep both hands in view">
                Leave room around you for natural movement.
              </Tip>
              <Tip icon={Sun} title="Use good, even lighting">
                Face a light source and keep the camera steady.
              </Tip>
            </ul>
          </section>

          <section className="ds-tips-panel">
            <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-2)" }}>
              {reviewing ? (
                <PlayCircle size={20} strokeWidth={1.75} style={{ color: "var(--ds-text-link)" }} aria-hidden="true" />
              ) : phase === "permission" ? (
                <ShieldCheck size={20} strokeWidth={1.75} style={{ color: "var(--ds-text-link)" }} aria-hidden="true" />
              ) : (
                <Video size={20} strokeWidth={1.75} style={{ color: "var(--ds-text-link)" }} aria-hidden="true" />
              )}
              <h2 className="ds-h4">
                {reviewing
                  ? "Happy with your recording?"
                  : phase === "recording"
                    ? "Take your time"
                    : phase === "permission"
                      ? "Camera permission required"
                      : "Ready when you are"}
              </h2>
            </div>

            <p className="ds-body-sm" style={{ color: "var(--ds-text-secondary)" }}>
              {reviewing
                ? "Play the clip to check it captured your complete thought. Select Record Again to replace it, or keep it for later."
                : phase === "recording"
                  ? "Finish your signing, then select Stop. You’ll be able to play your complete recording or record again before submitting."
                  : phase === "permission"
                    ? INITIAL_MESSAGE
                    : "Select Record to begin. Stop becomes available once recording starts. Capture one complete thought, then review your clip."}
            </p>
          </section>
          </aside>
        </StaggerItem>
      </StaggerContainer>

      <nav
        className="ds-stepper"
        style={{ marginBlockStart: "var(--ds-space-6)" }}
        aria-label="Recording workflow"
      >
        <div
          className={`ds-step ${phase !== "review" ? "is-current" : "is-done"}`}
          aria-current={phase !== "review" ? "step" : undefined}
        >
          <span className="ds-step-marker" aria-hidden="true">
            {phase === "review" ? (
              <CheckCircle2 size={16} strokeWidth={2.25} />
            ) : (
              <Video size={16} strokeWidth={2} />
            )}
          </span>
          <div>
            <span>Record your clip</span>
            <span className="ds-step-note">Allow camera and sign naturally</span>
          </div>
        </div>

        <div
          className={`ds-step ${phase === "review" ? "is-current" : ""}`}
          aria-current={phase === "review" ? "step" : undefined}
        >
          <span className="ds-step-marker" aria-hidden="true">
            <PlayCircle size={16} strokeWidth={2} />
          </span>
          <div>
            <span>Review your recording</span>
            <span className="ds-step-note">Confirm hands and expression</span>
          </div>
        </div>

        <div className="ds-step">
          <span className="ds-step-marker" aria-hidden="true">
            <Film size={16} strokeWidth={2} />
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
          Translation starts only after you finish, review and submit your clip.
        </span>
      </p>
    </UserShell>
  );
}
