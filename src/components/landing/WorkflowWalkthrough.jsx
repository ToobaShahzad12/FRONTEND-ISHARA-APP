import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Eye,
  FileVideo,
  Hand,
  Pause,
  Play,
  ScanFace,
  Sun,
  Upload,
  Video,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { ISHARA_EASE } from "../ds/MotionPrimitives";

const WALKTHROUGH_STEPS = [
  {
    id: "record-upload",
    num: "01",
    shortLabel: "Record or upload",
    title: "Record or upload",
    statusNote: null,
    instruction:
      "Start from Live Camera in your browser when you want to sign directly, or choose an existing MP4, WebM, or AVI file up to 250 MB from your device.",
    takeaways: [
      "Camera permission is always requested first—recording never starts automatically.",
      "Uploaded videos are checked locally for browser playback support before review.",
    ],
  },
  {
    id: "review-recording",
    num: "02",
    shortLabel: "Review your recording",
    title: "Review your recording",
    statusNote: null,
    instruction:
      "Watch your clip inside an unmirrored preview frame before submitting. Keeping your face, upper body, and both hands visible preserves facial expressions and spatial sign cues.",
    takeaways: [
      "Facial expressions carry grammatical meaning in Pakistan Sign Language alongside handshape.",
      "Unmirrored framing ensures directional signs read naturally without left-right reversal.",
    ],
  },
  {
    id: "translation",
    num: "03",
    shortLabel: "Translation",
    title: "Translation",
    statusNote: "Coming soon",
    instruction:
      "Once automated Pakistan Sign Language processing connects to this workspace, reviewed clips will move directly into readable text translation. Translation is not active yet.",
    takeaways: [
      "Today’s platform lets you capture, validate, and review clean signing clips.",
      "Automated translation output is clearly marked Coming soon until live inference launches.",
    ],
  },
];

function Step01Demo({ reduced }) {
  const [inputMode, setInputMode] = useState("camera");
  const [simulatedRecording, setSimulatedRecording] = useState(false);

  return (
    <div className="ds-wt-workspace">
      <div className="ds-wt-workspace-bar">
        <div className="ds-wt-workspace-title">
          <Video size={16} strokeWidth={2} aria-hidden="true" />
          <span>{inputMode === "camera" ? "Live Camera workspace" : "Video Upload workspace"}</span>
        </div>

        <div className="ds-wt-mode-switch" role="group" aria-label="Input mode preview">
          <button
            type="button"
            className={`ds-wt-mode-btn ${inputMode === "camera" ? "is-active" : ""}`.trim()}
            onClick={() => setInputMode("camera")}
            aria-pressed={inputMode === "camera"}
          >
            <Video size={14} strokeWidth={2} aria-hidden="true" />
            <span>Camera</span>
          </button>
          <button
            type="button"
            className={`ds-wt-mode-btn ${inputMode === "upload" ? "is-active" : ""}`.trim()}
            onClick={() => {
              setInputMode("upload");
              setSimulatedRecording(false);
            }}
            aria-pressed={inputMode === "upload"}
          >
            <Upload size={14} strokeWidth={2} aria-hidden="true" />
            <span>Upload</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {inputMode === "camera" ? (
          <motion.div
            key="mode-camera"
            className="ds-wt-demo-body"
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: reduced ? 0.01 : 0.24, ease: ISHARA_EASE }}
          >
            <div className="ds-wt-viewport ds-on-dark">
              <div className="ds-wt-viewport-top">
                <span className="ds-wt-status-text">
                  <span
                    className={`ds-wt-rec-indicator ${simulatedRecording ? "is-recording" : ""}`.trim()}
                    aria-hidden="true"
                  />
                  {simulatedRecording ? "Recording sample (illustrative)" : "Camera ready"}
                </span>
                <span className="ds-wt-timer ds-tabular">
                  {simulatedRecording ? "00:04" : "00:00"}
                </span>
              </div>

              <div className="ds-wt-framing-overlay" aria-hidden="true">
                <span className="ds-wt-corner ds-wt-corner--tl" />
                <span className="ds-wt-corner ds-wt-corner--tr" />
                <span className="ds-wt-corner ds-wt-corner--bl" />
                <span className="ds-wt-corner ds-wt-corner--br" />

                <svg className="ds-wt-guide-svg" viewBox="0 0 360 176" fill="none">
                  <path
                    d="M126 148 C138 114, 222 114, 234 148"
                    stroke="rgba(196, 243, 231, 0.34)"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="180"
                    cy="56"
                    r="18"
                    stroke="rgba(196, 243, 231, 0.36)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <motion.path
                    d="M84 126 C118 76, 162 72, 182 96 C202 120, 236 74, 276 84"
                    stroke={simulatedRecording ? "#ffd84d" : "#2fc7a3"}
                    strokeWidth="2.1"
                    strokeLinecap="round"
                    initial={false}
                    animate={
                      reduced
                        ? { opacity: 0.8 }
                        : { opacity: simulatedRecording ? [0.65, 1, 0.65] : 0.72 }
                    }
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                </svg>
              </div>

              <p className="ds-wt-viewport-caption">
                {simulatedRecording
                  ? "Signing naturally inside the unmirrored frame—click Stop recording below when finished."
                  : "Unmirrored camera preview waits for your click before recording starts."}
              </p>
            </div>

            <div className="ds-wt-control-row">
              <div className="ds-wt-control-meta">
                <strong>{simulatedRecording ? "Recording in progress" : "Ready when you are"}</strong>
                <span>Select Record to test the simulated capture state</span>
              </div>
              <div className="ds-wt-control-actions">
                <button
                  type="button"
                  className={`ds-wt-action-btn ${simulatedRecording ? "ds-wt-action-btn--stop" : "ds-wt-action-btn--primary"}`.trim()}
                  onClick={() => setSimulatedRecording((prev) => !prev)}
                >
                  {simulatedRecording ? "Stop recording" : "Start recording"}
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="mode-upload"
            className="ds-wt-demo-body"
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: reduced ? 0.01 : 0.24, ease: ISHARA_EASE }}
          >
            <div className="ds-wt-upload-zone">
              <div className="ds-wt-upload-drop">
                <span className="ds-wt-upload-icon" aria-hidden="true">
                  <Upload size={20} strokeWidth={1.85} />
                </span>
                <strong>Drop an MP4, WebM, or AVI video here</strong>
                <span>Maximum 250 MB · Validated locally in your browser before review</span>
              </div>

              <div className="ds-wt-file-row">
                <div className="ds-wt-file-info">
                  <FileVideo size={18} strokeWidth={1.85} aria-hidden="true" />
                  <div>
                    <strong>psl_greeting_sample.mp4</strong>
                    <span>Illustrative sample · 4.2 MB · 00:08</span>
                  </div>
                </div>
                <span className="ds-wt-file-check">
                  <Check size={14} strokeWidth={2.2} aria-hidden="true" />
                  <span>Playable</span>
                </span>
              </div>
            </div>

            <div className="ds-wt-control-row">
              <div className="ds-wt-control-meta">
                <strong>Local file validation</strong>
                <span>Supports MP4, WebM, and browser-playable AVI files</span>
              </div>
              <span className="ds-wt-inline-note">Ready for Step 02 review</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Step02Demo({ reduced }) {
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (reduced) setIsPlaying(false);
  }, [reduced]);

  return (
    <div className="ds-wt-workspace">
      <div className="ds-wt-workspace-bar">
        <div className="ds-wt-workspace-title">
          <Eye size={16} strokeWidth={2} aria-hidden="true" />
          <span>Recorded clip review</span>
        </div>
        <span className="ds-wt-bar-meta">Unmirrored playback</span>
      </div>

      <div className="ds-wt-demo-body">
        <div className="ds-wt-viewport ds-wt-viewport--review ds-on-dark">
          <div className="ds-wt-viewport-top">
            <span className="ds-wt-status-text">Framing guides visible</span>
            <span className="ds-wt-timer ds-tabular">00:08</span>
          </div>

          <div className="ds-wt-framing-overlay ds-wt-framing-overlay--annotated" aria-hidden="true">
            <span className="ds-wt-corner ds-wt-corner--tl" />
            <span className="ds-wt-corner ds-wt-corner--tr" />
            <span className="ds-wt-corner ds-wt-corner--bl" />
            <span className="ds-wt-corner ds-wt-corner--br" />

            <div className="ds-wt-zone-labels">
              <span className="ds-wt-zone-tag">Face &amp; expressions clear</span>
              <span className="ds-wt-zone-tag ds-wt-zone-tag--hands">Both hands inside frame</span>
            </div>

            <svg className="ds-wt-guide-svg" viewBox="0 0 360 168" fill="none">
              {/* Rule-of-thirds optical lines */}
              <line x1="120" y1="12" x2="120" y2="156" stroke="rgba(255,255,255,0.12)" strokeDasharray="3 4" />
              <line x1="240" y1="12" x2="240" y2="156" stroke="rgba(255,255,255,0.12)" strokeDasharray="3 4" />
              <line x1="24" y1="64" x2="336" y2="64" stroke="rgba(255,255,255,0.12)" strokeDasharray="3 4" />

              {/* Head & upper-body framing boundary */}
              <circle
                cx="180"
                cy="48"
                r="19"
                stroke="rgba(196, 243, 231, 0.65)"
                strokeWidth="1.6"
              />
              <path
                d="M116 144 C132 104, 228 104, 244 144"
                stroke="rgba(196, 243, 231, 0.48)"
                strokeWidth="1.6"
                strokeLinecap="round"
              />

              {/* Signing trajectory moving smoothly inside safe area */}
              <path
                d="M78 122 C112 70, 158 66, 180 94 C204 122, 242 70, 282 82"
                stroke="#2fc7a3"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              {!reduced && isPlaying && (
                <motion.path
                  d="M78 122 C112 70, 158 66, 180 94 C204 122, 242 70, 282 82"
                  stroke="#ffd84d"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeDasharray="36 240"
                  animate={{ strokeDashoffset: [276, 0] }}
                  transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
            </svg>
          </div>

          <div className="ds-wt-scrubber-bar" aria-hidden="true">
            <div className="ds-wt-scrubber-track">
              <motion.div
                className="ds-wt-scrubber-fill"
                animate={
                  reduced || !isPlaying
                    ? { scaleX: 0.48 }
                    : { scaleX: [0.12, 0.94, 0.12] }
                }
                transition={
                  reduced || !isPlaying
                    ? { duration: 0.2 }
                    : { duration: 6.4, repeat: Infinity, ease: "easeInOut" }
                }
              />
            </div>
          </div>
        </div>

        <ul className="ds-wt-checklist" aria-label="Framing review checks">
          <li>
            <ScanFace size={15} strokeWidth={2} aria-hidden="true" />
            <span>Face &amp; expressions unobstructed</span>
          </li>
          <li>
            <Hand size={15} strokeWidth={2} aria-hidden="true" />
            <span>Both hands stay inside guides</span>
          </li>
          <li>
            <Sun size={15} strokeWidth={2} aria-hidden="true" />
            <span>Even lighting &amp; steady camera</span>
          </li>
        </ul>

        <div className="ds-wt-control-row">
          <div className="ds-wt-control-meta">
            <strong>Complete clip · 00:08</strong>
            <span>Check clarity before moving forward, or record again</span>
          </div>
          <div className="ds-wt-control-actions">
            <button
              type="button"
              className="ds-wt-action-btn ds-wt-action-btn--secondary"
              onClick={() => setIsPlaying((prev) => !prev)}
            >
              {isPlaying ? (
                <>
                  <Pause size={14} strokeWidth={2} aria-hidden="true" />
                  <span>Pause preview</span>
                </>
              ) : (
                <>
                  <Play size={14} strokeWidth={2} aria-hidden="true" />
                  <span>Play preview</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step03Demo({ reduced }) {
  return (
    <div className="ds-wt-workspace">
      <div className="ds-wt-workspace-bar">
        <div className="ds-wt-workspace-title">
          <Clock size={16} strokeWidth={2} aria-hidden="true" />
          <span>Translation output</span>
        </div>
        <span className="ds-wt-coming-soon-label">Coming soon</span>
      </div>

      <div className="ds-wt-demo-body">
        <div className="ds-wt-translation-notice" role="note">
          <strong>Coming soon — Automated PSL translation is not connected yet</strong>
          <p>
            No live sign-to-text model runs in this preview. The layout below is
            strictly conceptual to illustrate how reviewed clips will pair with
            written output once translation services connect.
          </p>
        </div>

        <div className="ds-wt-translation-grid">
          <div className="ds-wt-clip-summary">
            <span className="ds-wt-sub-eyebrow">Reviewed source clip</span>
            <div className="ds-wt-clip-card-lite">
              <FileVideo size={18} strokeWidth={1.85} aria-hidden="true" />
              <div>
                <strong>psl_greeting_sample.mp4</strong>
                <span>00:08 · Framing verified</span>
              </div>
            </div>
            <span className="ds-wt-clip-footnote">
              Clips wait for explicit user review before submission.
            </span>
          </div>

          <div className="ds-wt-output-preview">
            <span className="ds-wt-sub-eyebrow">
              Conceptual output format (illustrative only)
            </span>

            <div className="ds-wt-output-lines" aria-hidden="true">
              <div className="ds-wt-output-row">
                <span className="ds-wt-output-lang">English</span>
                <motion.span
                  className="ds-wt-skeleton-bar ds-wt-skeleton-bar--wide"
                  initial={reduced ? false : { scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: reduced ? 0.01 : 0.6, delay: 0.1, ease: ISHARA_EASE }}
                />
                <motion.span
                  className="ds-wt-skeleton-bar ds-wt-skeleton-bar--mid"
                  initial={reduced ? false : { scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: reduced ? 0.01 : 0.6, delay: 0.22, ease: ISHARA_EASE }}
                />
              </div>

              <div className="ds-wt-output-row">
                <span className="ds-wt-output-lang">اردو</span>
                <motion.span
                  className="ds-wt-skeleton-bar ds-wt-skeleton-bar--urdu"
                  initial={reduced ? false : { scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: reduced ? 0.01 : 0.6, delay: 0.34, ease: ISHARA_EASE }}
                />
              </div>
            </div>

            <span className="ds-wt-output-status">
              Translation service status: Coming soon
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorkflowWalkthrough({ reduced }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef([]);

  const activeStep = WALKTHROUGH_STEPS[activeIndex];
  const panelId = `ish-wt-panel-${activeStep.id}`;
  const activeTabId = `ish-wt-tab-${activeStep.id}`;

  function selectStep(nextIndex, shouldFocus = false) {
    const bounded = Math.max(0, Math.min(WALKTHROUGH_STEPS.length - 1, nextIndex));
    setActiveIndex(bounded);
    if (shouldFocus) {
      requestAnimationFrame(() => {
        tabRefs.current[bounded]?.focus();
      });
    }
  }

  function handleTabKeyDown(event, index) {
    const last = WALKTHROUGH_STEPS.length - 1;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      selectStep(index === last ? 0 : index + 1, true);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      selectStep(index === 0 ? last : index - 1, true);
    } else if (event.key === "Home") {
      event.preventDefault();
      selectStep(0, true);
    } else if (event.key === "End") {
      event.preventDefault();
      selectStep(last, true);
    }
  }

  return (
    <div className="ds-wt-layout">
      {/* Left Column: Selectable Step Indicators + Instructional Guide + Prev/Next */}
      <div className="ds-wt-sidebar">
        <div
          className="ds-wt-tablist"
          role="tablist"
          aria-label="ISHARA AI workflow steps"
        >
          {WALKTHROUGH_STEPS.map((step, idx) => {
            const isActive = idx === activeIndex;
            const tabId = `ish-wt-tab-${step.id}`;
            const controlsId = `ish-wt-panel-${step.id}`;
            return (
              <button
                key={step.id}
                ref={(el) => {
                  tabRefs.current[idx] = el;
                }}
                type="button"
                role="tab"
                id={tabId}
                aria-selected={isActive}
                aria-controls={controlsId}
                tabIndex={isActive ? 0 : -1}
                className={`ds-wt-step-btn ${isActive ? "is-active" : ""}`.trim()}
                onClick={() => selectStep(idx)}
                onKeyDown={(e) => handleTabKeyDown(e, idx)}
              >
                {isActive && (
                  <motion.span
                    layoutId={reduced ? undefined : "ish-wt-active-bar"}
                    className="ds-wt-step-active-bar"
                    aria-hidden="true"
                    transition={{ duration: reduced ? 0.01 : 0.34, ease: ISHARA_EASE }}
                  />
                )}
                <span className="ds-wt-step-num ds-tabular">{step.num}</span>
                <span className="ds-wt-step-meta">
                  <span className="ds-wt-step-label">{step.shortLabel}</span>
                  {step.statusNote && (
                    <span className="ds-wt-step-status">{step.statusNote}</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Instructional panel tied to the currently selected step */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep.id}
            className="ds-wt-instruction-block"
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: reduced ? 0.01 : 0.28, ease: ISHARA_EASE }}
          >
            <div className="ds-wt-instruction-head">
              <h3 className="ds-h2">{activeStep.title}</h3>
              {activeStep.statusNote && (
                <span className="ds-workflow-status-note">
                  · {activeStep.statusNote}
                </span>
              )}
            </div>

            <p className="ds-body ds-wt-instruction-copy">
              {activeStep.instruction}
            </p>

            <ul className="ds-wt-takeaways">
              {activeStep.takeaways.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>

        {/* Optional Previous / Next navigation */}
        <div className="ds-wt-nav-footer">
          <span className="ds-wt-step-counter ds-tabular">
            Step {activeStep.num} of 0{WALKTHROUGH_STEPS.length}
          </span>

          <div className="ds-wt-prev-next">
            <button
              type="button"
              className="ds-wt-nav-btn"
              onClick={() => selectStep(activeIndex - 1)}
              disabled={activeIndex === 0}
              aria-label="Previous walkthrough step"
            >
              <ArrowLeft size={16} strokeWidth={2} className="ds-rtl-flip" aria-hidden="true" />
              <span>Previous</span>
            </button>
            <button
              type="button"
              className="ds-wt-nav-btn ds-wt-nav-btn--next"
              onClick={() => selectStep(activeIndex + 1)}
              disabled={activeIndex === WALKTHROUGH_STEPS.length - 1}
              aria-label="Next walkthrough step"
            >
              <span>Next</span>
              <ArrowRight size={16} strokeWidth={2} className="ds-rtl-flip" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Large Interactive Product Demonstration Area */}
      <div
        role="tabpanel"
        id={panelId}
        aria-labelledby={activeTabId}
        tabIndex={0}
        className="ds-wt-stage-frame"
      >
        <div className="ds-wt-stage-banner">
          <span className="ds-wt-stage-product">ISHARA AI Workspace</span>
          <span className="ds-wt-stage-disclaimer">
            Illustrative walkthrough · Step {activeStep.num}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep.id}
            className="ds-wt-stage-content"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: reduced ? 0.01 : 0.34, ease: ISHARA_EASE }}
          >
            {activeIndex === 0 && <Step01Demo reduced={reduced} />}
            {activeIndex === 1 && <Step02Demo reduced={reduced} />}
            {activeIndex === 2 && <Step03Demo reduced={reduced} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
