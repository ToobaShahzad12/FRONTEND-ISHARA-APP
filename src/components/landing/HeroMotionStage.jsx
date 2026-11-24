import { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { ISHARA_EASE, usePrefersReducedMotion } from "../ds/MotionPrimitives";

const HAND_TRACE_PATH =
  "M24 252C76 154 148 112 204 142C252 168 186 238 148 206C106 170 176 74 282 72C324 71 348 86 364 102";

const LANDMARK_NODES = [
  {
    id: "inflection",
    cx: 132,
    cy: 168,
    r: 5.2,
    delay: 0.92,
    pulseDelay: 2.3,
  },
  {
    id: "crest",
    cx: 296,
    cy: 72,
    r: 5.2,
    delay: 1.24,
    pulseDelay: 3.1,
  },
  {
    id: "endpoint",
    cx: 372,
    cy: 110,
    r: 6.2,
    delay: 1.54,
    pulseDelay: 3.9,
  },
];

/**
 * Translucent mint/teal glassmorphism stage for the ISHARA AI hero.
 *
 * Preserves the signature rounded glass panel, curved hand-motion trajectory,
 * glowing landmark points, and short caption below the curve—enhanced with
 * sequential path-draw landmark illumination, restrained cursor tilt & sheen,
 * gentle floating motion, and scroll depth.
 */
export default function HeroMotionStage({
  scrollProgress,
  pointerX: externalPointerX,
  pointerY: externalPointerY,
}) {
  const stageRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  const fallbackX = useMotionValue(0);
  const fallbackY = useMotionValue(0);
  const pointerX = externalPointerX ?? fallbackX;
  const pointerY = externalPointerY ?? fallbackY;

  const smoothX = useSpring(pointerX, { stiffness: 90, damping: 24, mass: 0.8 });
  const smoothY = useSpring(pointerY, { stiffness: 90, damping: 24, mass: 0.8 });

  // Restrained 3D glass tilt driven by cursor position
  const rigRotateY = useTransform(smoothX, [-1, 1], [-5.5, 5.5]);
  const rigRotateX = useTransform(smoothY, [-1, 1], [4.5, -4.5]);

  // Subtle internal parallax between glass surface and trajectory plane
  const traceShiftX = useTransform(smoothX, [-1, 1], [-8, 8]);
  const traceShiftY = useTransform(smoothY, [-1, 1], [-6, 6]);

  // Cursor-reactive specular highlight across the frosted glass
  const sheenPercentX = useTransform(smoothX, [-1, 1], [22, 78]);
  const sheenPercentY = useTransform(smoothY, [-1, 1], [18, 72]);
  const sheenBackground = useMotionTemplate`radial-gradient(280px circle at ${sheenPercentX}% ${sheenPercentY}%, rgba(255, 255, 255, 0.22), rgba(196, 243, 231, 0.07) 44%, transparent 74%)`;

  // Smooth vertical scroll parallax
  const stageScrollY = useTransform(scrollProgress, [0, 1], [0, -42]);
  const stageOpacity = useTransform(scrollProgress, [0, 0.92], [1, 0.3]);

  function handleLocalMove(e) {
    if (reduced || externalPointerX || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / Math.max(rect.width, 1) - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / Math.max(rect.height, 1) - 0.5) * 2;
    fallbackX.set(Math.max(-1, Math.min(1, nx)));
    fallbackY.set(Math.max(-1, Math.min(1, ny)));
  }

  function handleLocalLeave() {
    if (externalPointerX) return;
    fallbackX.set(0);
    fallbackY.set(0);
  }

  return (
    <motion.div
      ref={stageRef}
      className="ds-hero-visual-stage"
      onPointerMove={handleLocalMove}
      onPointerLeave={handleLocalLeave}
      style={reduced ? undefined : { y: stageScrollY, opacity: stageOpacity }}
    >
      {/* Subtle mint/teal atmospheric halo behind the glass panel */}
      <div className="ds-hero-stage-atmosphere" aria-hidden="true" />

      {/* 3D tilt + entrance rig */}
      <motion.div
        className="ds-hero-glass-rig"
        initial={reduced ? false : { opacity: 0, y: 26, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: reduced ? 0.01 : 0.82, delay: 0.14, ease: ISHARA_EASE }}
        style={
          reduced
            ? undefined
            : {
                rotateX: rigRotateX,
                rotateY: rigRotateY,
              }
        }
      >
        {/* Gentle ambient floating movement */}
        <motion.div
          className="ds-hero-glass-float"
          animate={reduced ? undefined : { y: [0, -8, 0] }}
          transition={
            reduced
              ? undefined
              : {
                  duration: 6.4,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                }
          }
        >
          {/* Translucent mint/teal glassmorphism panel */}
          <div className="ds-hero-glass-panel">
            <div className="ds-hero-glass-inner-glow" aria-hidden="true" />
            {!reduced && (
              <motion.div
                className="ds-hero-glass-sheen"
                style={{ background: sheenBackground }}
                aria-hidden="true"
              />
            )}

            {/* Elevated hand-motion trajectory curve & sequential landmark nodes */}
            <div className="ds-hero-trace-depth">
              <motion.div
                className="ds-hero-trace-stage"
                style={reduced ? undefined : { x: traceShiftX, y: traceShiftY }}
                aria-hidden="true"
              >
                <svg
                  className="ds-hero-trace-svg"
                  viewBox="0 0 400 300"
                  fill="none"
                  preserveAspectRatio="xMidYMid meet"
                  focusable="false"
                >
                  <defs>
                    <linearGradient
                      id="ishHeroTraceStroke"
                      x1="6%"
                      y1="84%"
                      x2="94%"
                      y2="24%"
                    >
                      <stop offset="0%" stopColor="rgba(232, 250, 244, 0.72)" />
                      <stop offset="48%" stopColor="rgba(255, 255, 255, 0.96)" />
                      <stop offset="100%" stopColor="#c4f3e7" />
                    </linearGradient>

                    <linearGradient
                      id="ishHeroTracePulse"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="rgba(255, 255, 255, 0)" />
                      <stop offset="50%" stopColor="rgba(255, 232, 130, 0.92)" />
                      <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
                    </linearGradient>

                    <radialGradient id="ishLandmarkHalo" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="rgba(255, 246, 207, 0.85)" />
                      <stop offset="42%" stopColor="rgba(196, 243, 231, 0.45)" />
                      <stop offset="100%" stopColor="rgba(47, 199, 163, 0)" />
                    </radialGradient>

                    <filter
                      id="ishTraceSoftGlow"
                      x="-20%"
                      y="-20%"
                      width="140%"
                      height="140%"
                    >
                      <feGaussianBlur stdDeviation="4.5" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Soft luminous under-glow drawn synchronously with the main curve */}
                  <motion.path
                    d={HAND_TRACE_PATH}
                    stroke="rgba(196, 243, 231, 0.34)"
                    strokeWidth="6.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#ishTraceSoftGlow)"
                    initial={reduced ? false : { pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{
                      pathLength: {
                        duration: reduced ? 0.01 : 1.55,
                        delay: 0.26,
                        ease: ISHARA_EASE,
                      },
                      opacity: {
                        duration: reduced ? 0.01 : 0.4,
                        delay: 0.26,
                      },
                    }}
                  />

                  {/* Crisp curved hand-motion trajectory */}
                  <motion.path
                    d={HAND_TRACE_PATH}
                    stroke="url(#ishHeroTraceStroke)"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={reduced ? false : { pathLength: 0, opacity: 0.4 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{
                      pathLength: {
                        duration: reduced ? 0.01 : 1.55,
                        delay: 0.26,
                        ease: ISHARA_EASE,
                      },
                      opacity: {
                        duration: reduced ? 0.01 : 0.45,
                        delay: 0.26,
                      },
                    }}
                  />

                  {/* Restrained traveling highlight along the trajectory */}
                  {!reduced && (
                    <motion.path
                      d={HAND_TRACE_PATH}
                      stroke="url(#ishHeroTracePulse)"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="62 540"
                      initial={{ strokeDashoffset: 602, opacity: 0 }}
                      animate={{
                        strokeDashoffset: [602, -40],
                        opacity: [0, 0.9, 0.9, 0],
                      }}
                      transition={{
                        duration: 5.2,
                        delay: 2.0,
                        repeat: Infinity,
                        repeatDelay: 1.4,
                        ease: "easeInOut",
                      }}
                    />
                  )}

                  {/* Sequential glowing landmark points along the curve */}
                  {LANDMARK_NODES.map((node) => (
                    <g key={node.id}>
                      {/* Soft ambient glow halo behind each landmark */}
                      <motion.circle
                        cx={node.cx}
                        cy={node.cy}
                        r={node.r * 3.1}
                        fill="url(#ishLandmarkHalo)"
                        style={{ transformOrigin: "center", transformBox: "fill-box" }}
                        initial={reduced ? false : { scale: 0.35, opacity: 0 }}
                        animate={
                          reduced
                            ? { scale: 1, opacity: 0.62 }
                            : { scale: [0.94, 1.16], opacity: [0.54, 0.84] }
                        }
                        transition={
                          reduced
                            ? { duration: 0.01 }
                            : {
                                duration: 2.6,
                                delay: node.delay,
                                repeat: Infinity,
                                repeatType: "mirror",
                                ease: "easeInOut",
                              }
                        }
                      />

                      {/* Subtle one-shot arrival ring expansion when curve reaches node */}
                      {!reduced && (
                        <motion.circle
                          cx={node.cx}
                          cy={node.cy}
                          r={node.r}
                          stroke="#fff6cf"
                          strokeWidth="1.5"
                          style={{ transformOrigin: "center", transformBox: "fill-box" }}
                          initial={{ scale: 0.85, opacity: 0 }}
                          animate={{ scale: [0.85, 2.35], opacity: [0.75, 0] }}
                          transition={{
                            duration: 0.85,
                            delay: node.delay,
                            ease: ISHARA_EASE,
                          }}
                        />
                      )}

                      {/* Crisp landmark ring */}
                      <motion.circle
                        cx={node.cx}
                        cy={node.cy}
                        r={node.r}
                        fill="rgba(16, 143, 120, 0.38)"
                        stroke="#f6fffc"
                        strokeWidth="2.1"
                        style={{ transformOrigin: "center", transformBox: "fill-box" }}
                        initial={reduced ? false : { scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          duration: reduced ? 0.01 : 0.42,
                          delay: reduced ? 0 : node.delay,
                          ease: ISHARA_EASE,
                        }}
                      />

                      {/* Warm inner luminous pinpoint */}
                      <motion.circle
                        cx={node.cx}
                        cy={node.cy}
                        r={1.9}
                        fill="#fff6cf"
                        style={{ transformOrigin: "center", transformBox: "fill-box" }}
                        initial={reduced ? false : { scale: 0, opacity: 0 }}
                        animate={
                          reduced
                            ? { scale: 1, opacity: 0.95 }
                            : { scale: [0, 1.3, 1], opacity: [0, 1, 0.92] }
                        }
                        transition={{
                          duration: reduced ? 0.01 : 0.5,
                          delay: reduced ? 0 : node.delay + 0.06,
                          ease: ISHARA_EASE,
                        }}
                      />
                    </g>
                  ))}
                </svg>
              </motion.div>
            </div>

            {/* Explanatory caption anchored below the trajectory inside the glass panel */}
            <div className="ds-hero-glass-caption-depth">
              <motion.p
                className="ds-hero-glass-caption"
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: reduced ? 0.01 : 0.65,
                  delay: 0.5,
                  ease: ISHARA_EASE,
                }}
              >
                Natural{" "}
                <span className="ds-hero-glass-caption-accent">
                  hand motion and clear
                </span>
                <br />
                visual space for every sign.
              </motion.p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
