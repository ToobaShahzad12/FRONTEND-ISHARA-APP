import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { ISHARA_EASE, usePrefersReducedMotion } from "../ds/MotionPrimitives";
import { HERO_3D_MODEL_CONFIG, PSL_GUIDE_SECTIONS } from "../../data/pslGuideContent";
import HandTrace from "../ds/HandTrace";
import HeroCharacter3D from "./HeroCharacter3D";
import HeroInterimGuide from "./HeroInterimGuide";
import IsharaGuide from "./IsharaGuide";

export default function GuideCompanion({
  sectionKey = "hero",
  variant = "compact",
  surface = "light",
  active = true,
  className = "",
}) {
  const reduced = usePrefersReducedMotion();
  const content = PSL_GUIDE_SECTIONS[sectionKey] || PSL_GUIDE_SECTIONS.hero;

  const hasVerifiedVideo = Boolean(content.pslClip?.verified && content.pslClip?.videoUrl);
  const hasValidatedSequence = Boolean(
    content.validatedSequence?.verified && content.validatedSequence?.frames?.length > 0
  );

  const [activeCueText, setActiveCueText] = useState(content.caption);
  const [sequenceFrameIndex, setSequenceFrameIndex] = useState(0);
  const [heroRigState, setHeroRigState] = useState(
    HERO_3D_MODEL_CONFIG.glbUrl ? "loading" : "awaiting-glb"
  );

  const handleHeroDiagnostics = useCallback((diag) => {
    setHeroRigState(diag.status);
  }, []);

  // Sync verified PSL keyframe sequence if validated PSL animation frames are supplied
  useEffect(() => {
    if (!hasValidatedSequence || reduced) return undefined;
    const frames = content.validatedSequence.frames;
    const currentFrame = frames[sequenceFrameIndex] || frames[0];
    if (currentFrame?.caption) {
      setActiveCueText(currentFrame.caption);
    }
    const timer = window.setTimeout(() => {
      setSequenceFrameIndex((prev) => (prev + 1) % frames.length);
    }, currentFrame?.durationMs || 1800);

    return () => window.clearTimeout(timer);
  }, [hasValidatedSequence, reduced, content.validatedSequence.frames, sequenceFrameIndex]);

  // Reset caption cleanly when section changes
  useEffect(() => {
    setActiveCueText(content.caption);
    setSequenceFrameIndex(0);
  }, [content.caption]);

  function handlePslVideoTimeUpdate(e) {
    const cues = content.pslClip?.cues;
    if (!cues?.length) return;
    const currentTime = e.currentTarget.currentTime;
    const matched = cues.find((c) => currentTime >= c.start && currentTime <= c.end);
    if (matched) {
      setActiveCueText(matched.text);
    }
  }

  const activeSequenceFrame = hasValidatedSequence
    ? content.validatedSequence.frames[sequenceFrameIndex]
    : null;

  // Dedicated Right-Side Hero Visual Box Stage
  if (variant === "hero") {
    const showInterimPortrait =
      !HERO_3D_MODEL_CONFIG.glbUrl || heroRigState === "awaiting-glb" || heroRigState === "error";

    const modeNote =
      hasVerifiedVideo || hasValidatedSequence
        ? "Verified PSL guide"
        : heroRigState === "ready"
          ? "3D virtual guide"
          : heroRigState === "loading"
            ? "Loading 3D guide…"
            : "Interim preview · 3D GLB pending";

    return (
      <motion.aside
        className={`ds-hero-guide-box ${className}`.trim()}
        aria-label={`Virtual guide introduction: ${content.heading}`}
        initial={reduced ? false : { opacity: 0, scale: 0.97, y: 16 }}
        animate={active ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.97, y: 16 }}
        transition={{ duration: reduced ? 0.01 : 0.56, delay: 0.14, ease: ISHARA_EASE }}
      >
        {/* Subtle studio framing brackets echoing clear PSL framing */}
        <span className="ds-hero-bracket ds-hero-bracket--tl" aria-hidden="true" />
        <span className="ds-hero-bracket ds-hero-bracket--tr" aria-hidden="true" />
        <span className="ds-hero-bracket ds-hero-bracket--bl" aria-hidden="true" />
        <span className="ds-hero-bracket ds-hero-bracket--br" aria-hidden="true" />

        <div className="ds-hero-guide-viewport">
          <div className="ds-hero-guide-studio-light" aria-hidden="true" />
          <div className="ds-hero-guide-trace" aria-hidden="true">
            <HandTrace variant="arc" animated={!reduced} />
          </div>

          {hasVerifiedVideo ? (
            <div className="ds-guide-psl-hero-player">
              <video
                src={content.pslClip.videoUrl}
                controls
                playsInline
                preload="metadata"
                onTimeUpdate={handlePslVideoTimeUpdate}
                aria-label={content.pslClip.title}
                className="ds-guide-psl-video-hero"
              />
            </div>
          ) : (
            <>
              <HeroCharacter3D
                glbUrl={HERO_3D_MODEL_CONFIG.glbUrl}
                dracoDecoderPath={HERO_3D_MODEL_CONFIG.dracoDecoderPath}
                activeClipName={
                  hasValidatedSequence && activeSequenceFrame?.clipName
                    ? activeSequenceFrame.clipName
                    : "Idle"
                }
                active={active}
                onDiagnostics={handleHeroDiagnostics}
              />
              {showInterimPortrait && <HeroInterimGuide interactive active={active} />}
            </>
          )}
        </div>

        <div className="ds-hero-guide-caption-bar">
          <div className="ds-hero-guide-caption-meta">
            <span className="ds-hero-guide-caption-title">{content.heading}</span>
            <span className="ds-hero-guide-mode-note">{modeNote}</span>
          </div>
          <p className="ds-hero-guide-caption-text">{activeCueText}</p>
        </div>
      </motion.aside>
    );
  }

  return (
    <motion.aside
      className={`ds-guide-companion ds-guide-companion--${variant} ds-guide-companion--${surface} ${className}`.trim()}
      aria-label={`Guide explanation: ${content.heading}`}
      initial={reduced ? false : { opacity: 0, y: 14 }}
      animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
      transition={{ duration: reduced ? 0.01 : 0.48, delay: 0.14, ease: ISHARA_EASE }}
    >
      <div className="ds-guide-stage">
        <IsharaGuide
          pose={content.pose}
          mode={hasValidatedSequence ? "psl" : "idle"}
          sequenceBeat={activeSequenceFrame}
          size="compact"
          interactive={false}
        />
      </div>

      <div className="ds-guide-caption-box">
        <p className="ds-guide-caption-title">{content.heading}</p>
        <p className="ds-guide-caption-text">{activeCueText}</p>

        {hasVerifiedVideo && (
          <div className="ds-guide-psl-slot">
            <video
              src={content.pslClip.videoUrl}
              controls
              playsInline
              preload="metadata"
              onTimeUpdate={handlePslVideoTimeUpdate}
              aria-label={content.pslClip.title}
              className="ds-guide-psl-video"
            />
          </div>
        )}
      </div>
    </motion.aside>
  );
}
