import { useEffect, useId, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { ISHARA_EASE, usePrefersReducedMotion } from "../ds/MotionPrimitives";
import { HERO_IDLE_BEATS } from "../../data/pslGuideContent";

/**
 * Multi-joint kinematic pose definitions for the 3D-shaded South Asian female guide.
 * Hierarchy: Torso/Shoulders -> UpperArm -> Elbow -> Forearm -> Wrist -> Detailed Hand,
 * plus Head -> Gaze -> Brows -> Smile.
 *
 * Strictly general conversational/welcoming gestures (never fabricated PSL signs).
 */
const KINEMATIC_POSES = {
  welcome: {
    torsoRotate: -1,
    head: { rotate: -2.5, x: 0, y: 0 },
    gaze: { x: 0, y: 0 },
    browY: -1.4,
    smilePath: "M165 137 Q180 146 195 137",
    leftShoulder: { y: -2, rotate: -3 },
    leftUpperArm: { rotate: 16 },
    leftForearm: { rotate: -28 },
    leftWrist: { rotate: -10 },
    rightShoulder: { y: -1, rotate: 2 },
    rightUpperArm: { rotate: -14 },
    rightForearm: { rotate: 26 },
    rightWrist: { rotate: 12 },
  },
  attentive: {
    torsoRotate: 0.4,
    head: { rotate: 1.5, x: 0.5, y: 0.5 },
    gaze: { x: 0.6, y: 0 },
    browY: -0.4,
    smilePath: "M166 138 Q180 144 194 138",
    leftShoulder: { y: 0, rotate: 0 },
    leftUpperArm: { rotate: 4 },
    leftForearm: { rotate: -10 },
    leftWrist: { rotate: -4 },
    rightShoulder: { y: 0, rotate: 0 },
    rightUpperArm: { rotate: -4 },
    rightForearm: { rotate: 10 },
    rightWrist: { rotate: 4 },
  },
  present: {
    torsoRotate: -1.6,
    head: { rotate: -4, x: -1.5, y: -0.5 },
    gaze: { x: -2.2, y: -0.3 },
    browY: -1.8,
    smilePath: "M165 137 Q180 146 195 137",
    leftShoulder: { y: -3, rotate: -5 },
    leftUpperArm: { rotate: 24 },
    leftForearm: { rotate: -36 },
    leftWrist: { rotate: -14 },
    rightShoulder: { y: 0.5, rotate: 1 },
    rightUpperArm: { rotate: -8 },
    rightForearm: { rotate: 16 },
    rightWrist: { rotate: 6 },
  },
  point: {
    torsoRotate: 1.2,
    head: { rotate: 3.5, x: 1, y: 0.5 },
    gaze: { x: -1.5, y: 0.4 },
    browY: -1,
    smilePath: "M166 138 Q180 144 194 138",
    leftShoulder: { y: -2.5, rotate: -4 },
    leftUpperArm: { rotate: 22 },
    leftForearm: { rotate: -34 },
    leftWrist: { rotate: -12 },
    rightShoulder: { y: 1, rotate: 0 },
    rightUpperArm: { rotate: -2 },
    rightForearm: { rotate: 6 },
    rightWrist: { rotate: 2 },
  },
  explain: {
    torsoRotate: 0,
    head: { rotate: 1, x: 0, y: 0 },
    gaze: { x: 0, y: 0 },
    browY: -1.1,
    smilePath: "M165 137 Q180 145 195 137",
    leftShoulder: { y: -1.5, rotate: -2 },
    leftUpperArm: { rotate: 12 },
    leftForearm: { rotate: -24 },
    leftWrist: { rotate: -8 },
    rightShoulder: { y: -1.5, rotate: 2 },
    rightUpperArm: { rotate: -12 },
    rightForearm: { rotate: 24 },
    rightWrist: { rotate: 8 },
  },
  inclusive: {
    torsoRotate: -0.6,
    head: { rotate: -2, x: 0, y: 1 },
    gaze: { x: 0, y: 0.3 },
    browY: 0,
    smilePath: "M167 138 Q180 144 193 138",
    leftShoulder: { y: 0.5, rotate: 1 },
    leftUpperArm: { rotate: 5 },
    leftForearm: { rotate: -12 },
    leftWrist: { rotate: -3 },
    rightShoulder: { y: -2, rotate: 4 },
    rightUpperArm: { rotate: -22 },
    rightForearm: { rotate: 38 },
    rightWrist: { rotate: 14 },
  },
  invite: {
    torsoRotate: -1.4,
    head: { rotate: -3, x: -0.5, y: -0.5 },
    gaze: { x: 0, y: 0 },
    browY: -1.6,
    smilePath: "M164 137 Q180 147 196 137",
    leftShoulder: { y: -2, rotate: -3 },
    leftUpperArm: { rotate: 18 },
    leftForearm: { rotate: -30 },
    leftWrist: { rotate: -10 },
    rightShoulder: { y: -2, rotate: 3 },
    rightUpperArm: { rotate: -16 },
    rightForearm: { rotate: 28 },
    rightWrist: { rotate: 12 },
  },
};

export default function IsharaGuide({
  pose = "welcome",
  mode = "idle",
  sequenceBeat = null,
  size = "hero",
  interactive = false,
  className = "",
}) {
  const reduced = usePrefersReducedMotion();
  const uid = useId().replace(/:/g, "");
  const containerRef = useRef(null);

  const [blinking, setBlinking] = useState(false);
  const [idleBeatIndex, setIdleBeatIndex] = useState(0);

  // Subtle pointer gaze/head-turn responsiveness on Hero
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 75, damping: 22 });
  const springY = useSpring(mouseY, { stiffness: 75, damping: 22 });
  const pointerHeadX = useTransform(springX, [-0.5, 0.5], [-2.5, 2.5]);
  const pointerHeadY = useTransform(springY, [-0.5, 0.5], [-1.8, 1.8]);
  const pointerEyeX = useTransform(springX, [-0.5, 0.5], [-1.8, 1.8]);
  const pointerEyeY = useTransform(springY, [-0.5, 0.5], [-1.2, 1.2]);

  // Organic varied blinking cadence (avoids robotic identical timing)
  useEffect(() => {
    if (reduced) return undefined;
    let blinkCloseTimer;
    let nextBlinkTimer;

    const scheduleBlink = () => {
      const delay = 3200 + Math.random() * 2400;
      nextBlinkTimer = window.setTimeout(() => {
        setBlinking(true);
        blinkCloseTimer = window.setTimeout(() => {
          setBlinking(false);
          scheduleBlink();
        }, 145);
      }, delay);
    };

    scheduleBlink();
    return () => {
      if (nextBlinkTimer) window.clearTimeout(nextBlinkTimer);
      if (blinkCloseTimer) window.clearTimeout(blinkCloseTimer);
    };
  }, [reduced]);

  // Calm multi-beat natural presence loop on Hero (strictly idle conversational posture)
  useEffect(() => {
    if (reduced || !interactive || mode !== "idle") return undefined;
    const currentBeat = HERO_IDLE_BEATS[idleBeatIndex] || HERO_IDLE_BEATS[0];
    const timer = window.setTimeout(() => {
      setIdleBeatIndex((prev) => (prev + 1) % HERO_IDLE_BEATS.length);
    }, currentBeat.durationMs);
    return () => window.clearTimeout(timer);
  }, [reduced, interactive, mode, idleBeatIndex]);

  function handlePointerMove(e) {
    if (!interactive || reduced || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handlePointerLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  // Resolve active kinematic pose: future validated PSL frame > idle choreography beat > static pose prop
  const activePoseKey =
    mode === "psl" && sequenceBeat?.pose
      ? sequenceBeat.pose
      : interactive && !reduced && mode === "idle"
        ? HERO_IDLE_BEATS[idleBeatIndex]?.pose || pose
        : pose;

  const rig = KINEMATIC_POSES[activePoseKey] || KINEMATIC_POSES.welcome;
  const poseTransition = { duration: reduced ? 0.01 : 0.95, ease: ISHARA_EASE };

  return (
    <div
      ref={containerRef}
      className={`ds-guide-figure ds-guide-figure--${size} ${className}`.trim()}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      aria-hidden="true"
    >
      {/* Generous 360x350 studio viewBox ensures full upper body & both hands stay uncropped */}
      <svg
        viewBox="0 0 360 350"
        fill="none"
        className="ds-guide-svg"
        focusable="false"
      >
        <defs>
          {/* Key Light + Warm Subsurface South Asian Skin Gradients */}
          <radialGradient id={`${uid}-skin-face`} cx="40%" cy="32%" r="66%">
            <stop offset="0%" stopColor="#fde3cc" />
            <stop offset="48%" stopColor="#efba92" />
            <stop offset="84%" stopColor="#d48c62" />
            <stop offset="100%" stopColor="#b86f49" />
          </radialGradient>

          <radialGradient id={`${uid}-skin-hand`} cx="38%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fbe0c8" />
            <stop offset="56%" stopColor="#ebb288" />
            <stop offset="100%" stopColor="#cb8258" />
          </radialGradient>

          <linearGradient id={`${uid}-skin-neck`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#bf7952" />
            <stop offset="55%" stopColor="#dd9970" />
            <stop offset="100%" stopColor="#c47e56" />
          </linearGradient>

          <radialGradient id={`${uid}-cheek`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#df7e68" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#df7e68" stopOpacity="0" />
          </radialGradient>

          {/* Cool Studio Rim Light along Hijab & Cheek Edge */}
          <linearGradient id={`${uid}-rim-teal`} x1="100%" y1="0%" x2="20%" y2="80%">
            <stop offset="0%" stopColor="#6be4d1" stopOpacity="0.48" />
            <stop offset="100%" stopColor="#6be4d1" stopOpacity="0" />
          </linearGradient>

          {/* Sculpted Deep Teal Hijab Multi-Fold Gradients */}
          <radialGradient id={`${uid}-hijab-hood`} cx="32%" cy="22%" r="76%">
            <stop offset="0%" stopColor="#269fa6" />
            <stop offset="44%" stopColor="#0d707d" />
            <stop offset="82%" stopColor="#074a59" />
            <stop offset="100%" stopColor="#042e3b" />
          </radialGradient>

          <linearGradient id={`${uid}-hijab-drape`} x1="18%" y1="0%" x2="82%" y2="100%">
            <stop offset="0%" stopColor="#1b8b96" />
            <stop offset="50%" stopColor="#0b6472" />
            <stop offset="100%" stopColor="#043947" />
          </linearGradient>

          <linearGradient id={`${uid}-hijab-fold-light`} x1="0%" y1="0%" x2="100%" y2="90%">
            <stop offset="0%" stopColor="#32beb4" stopOpacity="0.38" />
            <stop offset="55%" stopColor="#0c6e7b" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#032b37" stopOpacity="0.62" />
          </linearGradient>

          <linearGradient id={`${uid}-hair`} x1="25%" y1="0%" x2="75%" y2="100%">
            <stop offset="0%" stopColor="#462b21" />
            <stop offset="58%" stopColor="#261510" />
            <stop offset="100%" stopColor="#160b08" />
          </linearGradient>

          {/* Plain Modest Cream Tunic & Draped Sleeves */}
          <linearGradient id={`${uid}-cream-torso`} x1="22%" y1="0%" x2="86%" y2="100%">
            <stop offset="0%" stopColor="#fdf8ee" />
            <stop offset="46%" stopColor="#efe2cc" />
            <stop offset="86%" stopColor="#d9c4a5" />
            <stop offset="100%" stopColor="#c5ac8a" />
          </linearGradient>

          <linearGradient id={`${uid}-cream-sleeve`} x1="10%" y1="0%" x2="90%" y2="100%">
            <stop offset="0%" stopColor="#fbf5ea" />
            <stop offset="58%" stopColor="#e9d7bc" />
            <stop offset="100%" stopColor="#cbb291" />
          </linearGradient>

          {/* Spherical Sclera Shadow + Deep Brown Iris */}
          <linearGradient id={`${uid}-sclera`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#dce2e6" />
            <stop offset="28%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f5f7f8" />
          </linearGradient>

          <radialGradient id={`${uid}-iris`} cx="46%" cy="42%" r="54%">
            <stop offset="0%" stopColor="#724229" />
            <stop offset="58%" stopColor="#432213" />
            <stop offset="90%" stopColor="#28130a" />
            <stop offset="100%" stopColor="#1a0b05" />
          </radialGradient>

          <radialGradient id={`${uid}-studio-floor`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#042938" stopOpacity="0.34" />
            <stop offset="70%" stopColor="#042938" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#042938" stopOpacity="0" />
          </radialGradient>

          <filter id={`${uid}-cast-shadow`} x="-15%" y="-15%" width="130%" height="135%">
            <feDropShadow dx="0" dy="10" stdDeviation="9" floodColor="#042938" floodOpacity="0.22" />
          </filter>

          <filter id={`${uid}-soft-blur`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
        </defs>

        {/* Grounded soft studio contact shadow */}
        <ellipse cx="180" cy="336" rx="96" ry="11" fill={`url(#${uid}-studio-floor)`} />

        {/* Master Upper Body Group (Subtle idle breathing without vertical bouncing) */}
        <motion.g
          filter={`url(#${uid}-cast-shadow)`}
          animate={
            reduced
              ? { rotate: rig.torsoRotate }
              : {
                  y: [0, -1.8, 0],
                  rotate: rig.torsoRotate,
                }
          }
          transition={
            reduced
              ? { duration: 0.01 }
              : {
                  y: { duration: 5.2, repeat: Infinity, ease: "easeInOut" },
                  rotate: poseTransition,
                }
          }
          style={{ originX: "180px", originY: "320px" }}
        >
          {/* Back Hijab Drape Silhouette */}
          <path
            d="M120 138 C110 198, 102 268, 98 334 L262 334 C258 268, 250 198, 240 138 Z"
            fill={`url(#${uid}-hijab-hood)`}
          />

          {/* Plain Modest Cream Tunic Torso */}
          <path
            d="M126 196 C118 238, 114 286, 116 334 L244 334 C246 286, 242 238, 234 196 C214 184, 146 184, 126 196 Z"
            fill={`url(#${uid}-cream-torso)`}
          />
          {/* Subtle torso cylindrical fold shading */}
          <path
            d="M214 198 C222 242, 224 288, 222 334 L244 334 C246 286, 242 238, 234 196 Z"
            fill="#bfa380"
            fillOpacity="0.34"
          />
          <path
            d="M132 242 C142 268, 144 302, 142 334"
            stroke="#cbb190"
            strokeOpacity="0.35"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Soft cast shadow from hijab drape onto cream tunic */}
          <path
            d="M120 196 C138 238, 166 254, 184 254 C206 254, 228 234, 238 198 C224 226, 200 242, 180 242 C158 242, 134 226, 120 196 Z"
            fill="#8c7255"
            fillOpacity="0.28"
            filter={`url(#${uid}-soft-blur)`}
          />

          {/* =================================================
              LEFT SHOULDER -> UPPER ARM -> ELBOW -> FOREARM -> WRIST -> DETAILED HAND
              ================================================= */}
          <motion.g
            animate={rig.leftShoulder}
            transition={poseTransition}
            style={{ originX: "130px", originY: "204px" }}
          >
            <motion.g
              animate={rig.leftUpperArm}
              transition={poseTransition}
              style={{ originX: "128px", originY: "204px" }}
            >
              {/* Cream Upper Sleeve (Shoulder to Elbow 84,242) */}
              <path
                d="M134 192 C112 194, 88 214, 72 240 C68 248, 76 258, 88 256 C104 252, 118 232, 136 218 Z"
                fill={`url(#${uid}-cream-sleeve)`}
              />
              {/* Soft inner fabric fold crease */}
              <path
                d="M92 236 C104 224, 116 216, 126 212"
                stroke="#bfa380"
                strokeOpacity="0.45"
                strokeWidth="1.6"
                strokeLinecap="round"
              />

              {/* Elbow Pivot -> Forearm -> Wrist (52, 198) */}
              <motion.g
                animate={rig.leftForearm}
                transition={poseTransition}
                style={{ originX: "80px", originY: "246px" }}
              >
                {/* Cream Forearm Sleeve */}
                <path
                  d="M84 252 C68 254, 54 242, 46 214 C44 206, 54 200, 62 204 C70 218, 76 232, 88 240 Z"
                  fill={`url(#${uid}-cream-sleeve)`}
                />
                {/* Tailored Modest Cuff Opening */}
                <ellipse
                  cx="54"
                  cy="208"
                  rx="10"
                  ry="6.5"
                  transform="rotate(-18 54 208)"
                  fill="#bba180"
                  fillOpacity="0.48"
                />
                <path
                  d="M44 210 C49 215, 59 214, 63 207"
                  stroke="#f9f3e8"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />

                {/* Wrist Pivot -> Sculpted Detailed Left Open-Palm Hand */}
                <motion.g
                  animate={rig.leftWrist}
                  transition={poseTransition}
                  style={{ originX: "54px", originY: "206px" }}
                >
                  {/* Wrist & Palm Base */}
                  <path
                    d="M48 206 C44 196, 42 186, 46 178 C51 174, 59 175, 62 183 C64 190, 62 199, 59 206 Z"
                    fill={`url(#${uid}-skin-hand)`}
                  />
                  {/* Pinky, Ring, Middle, Index Fingers (Natural slight curve) */}
                  <path
                    d="M46 184 C40 176, 34 166, 30 158 C29 154, 33 152, 36 155 L45 170 L36 151 C35 147, 39 145, 42 148 L49 167 L44 146 C44 142, 48 141, 51 145 L55 166 L54 149 C54 145, 59 145, 60 149 L61 172 C65 168, 71 167, 73 171 C74 176, 67 183, 62 189 C60 194, 57 198, 52 198 Z"
                    fill={`url(#${uid}-skin-hand)`}
                  />
                  {/* Soft Palm Line & Thenar Cushion Shading */}
                  <path
                    d="M47 182 C52 183, 56 186, 58 191"
                    stroke="#bc734a"
                    strokeOpacity="0.42"
                    strokeWidth="1.15"
                    strokeLinecap="round"
                  />
                  <path
                    d="M49 175 C53 175, 57 177, 59 180"
                    stroke="#bc734a"
                    strokeOpacity="0.32"
                    strokeWidth="1"
                    strokeLinecap="round"
                  />
                </motion.g>
              </motion.g>
            </motion.g>
          </motion.g>

          {/* =================================================
              RIGHT SHOULDER -> UPPER ARM -> ELBOW -> FOREARM -> WRIST -> DETAILED HAND
              ================================================= */}
          <motion.g
            animate={rig.rightShoulder}
            transition={poseTransition}
            style={{ originX: "230px", originY: "204px" }}
          >
            <motion.g
              animate={rig.rightUpperArm}
              transition={poseTransition}
              style={{ originX: "232px", originY: "204px" }}
            >
              {/* Cream Upper Sleeve (Shoulder to Elbow 280,246) */}
              <path
                d="M226 192 C248 194, 272 214, 288 240 C292 248, 284 258, 272 256 C256 252, 242 232, 224 218 Z"
                fill={`url(#${uid}-cream-sleeve)`}
              />
              <path
                d="M268 236 C256 224, 244 216, 234 212"
                stroke="#bfa380"
                strokeOpacity="0.42"
                strokeWidth="1.6"
                strokeLinecap="round"
              />

              {/* Elbow Pivot -> Forearm -> Wrist (306, 208) */}
              <motion.g
                animate={rig.rightForearm}
                transition={poseTransition}
                style={{ originX: "280px", originY: "246px" }}
              >
                {/* Cream Forearm Sleeve */}
                <path
                  d="M276 252 C292 254, 306 242, 314 214 C316 206, 306 200, 298 204 C290 218, 284 232, 272 240 Z"
                  fill={`url(#${uid}-cream-sleeve)`}
                />
                <ellipse
                  cx="306"
                  cy="208"
                  rx="10"
                  ry="6.5"
                  transform="rotate(18 306 208)"
                  fill="#bba180"
                  fillOpacity="0.48"
                />
                <path
                  d="M316 210 C311 215, 301 214, 297 207"
                  stroke="#f9f3e8"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />

                {/* Wrist Pivot -> Sculpted Detailed Right Open-Palm Hand */}
                <motion.g
                  animate={rig.rightWrist}
                  transition={poseTransition}
                  style={{ originX: "306px", originY: "206px" }}
                >
                  <path
                    d="M312 206 C316 196, 318 186, 314 178 C309 174, 301 175, 298 183 C296 190, 298 199, 301 206 Z"
                    fill={`url(#${uid}-skin-hand)`}
                  />
                  <path
                    d="M314 184 C320 176, 326 166, 330 158 C331 154, 327 152, 324 155 L315 170 L324 151 C325 147, 321 145, 318 148 L311 167 L316 146 C316 142, 312 141, 309 145 L305 166 L306 149 C306 145, 301 145, 300 149 L299 172 C295 168, 289 167, 287 171 C286 176, 293 183, 298 189 C300 194, 303 198, 308 198 Z"
                    fill={`url(#${uid}-skin-hand)`}
                  />
                  <path
                    d="M313 182 C308 183, 304 186, 302 191"
                    stroke="#bc734a"
                    strokeOpacity="0.42"
                    strokeWidth="1.15"
                    strokeLinecap="round"
                  />
                  <path
                    d="M311 175 C307 175, 303 177, 301 180"
                    stroke="#bc734a"
                    strokeOpacity="0.32"
                    strokeWidth="1"
                    strokeLinecap="round"
                  />
                </motion.g>
              </motion.g>
            </motion.g>
          </motion.g>

          {/* Neck (Natural proportion supporting adult head) */}
          <path
            d="M164 152 L164 186 C172 194, 188 194, 196 186 L196 152 Z"
            fill={`url(#${uid}-skin-neck)`}
          />

          {/* Sculpted Multi-Fold Teal Hijab Chest & Shoulder Drape */}
          <path
            d="M124 140 C110 176, 112 218, 138 236 C162 252, 200 252, 224 234 C244 218, 248 176, 236 140 C220 160, 200 168, 180 168 C160 168, 140 160, 124 140 Z"
            fill={`url(#${uid}-hijab-drape)`}
          />
          {/* Deep realistic fabric fold layers */}
          <path
            d="M122 164 C146 194, 188 206, 236 182 C222 208, 182 222, 134 196 Z"
            fill={`url(#${uid}-hijab-fold-light)`}
          />
          <path
            d="M132 198 C160 224, 198 228, 228 204 C208 238, 164 246, 136 220 Z"
            fill="#032f3c"
            fillOpacity="0.38"
          />
          <path
            d="M128 176 C158 202, 198 206, 232 184"
            stroke="#3cc9bc"
            strokeOpacity="0.26"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          {/* Cool Studio Rim Light on right hijab shoulder */}
          <path
            d="M234 144 C244 176, 242 208, 222 232"
            stroke={`url(#${uid}-rim-teal)`}
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* =================================================
              HEAD -> FACE -> EXPRESSIVE EYES / GAZE -> LIPS
              ================================================= */}
          <motion.g
            animate={rig.head}
            transition={poseTransition}
            style={{
              originX: "180px",
              originY: "148px",
              x: interactive && !reduced ? pointerHeadX : 0,
              y: interactive && !reduced ? pointerHeadY : 0,
            }}
          >
            {/* Outer Teal Hijab Hood */}
            <path
              d="M120 122 C118 70, 144 40, 180 40 C216 40, 242 70, 240 122 C240 152, 222 174, 180 174 C138 174, 120 152, 120 122 Z"
              fill={`url(#${uid}-hijab-hood)`}
            />
            {/* Key Light & Cool Rim Highlight on Hijab Crown */}
            <path
              d="M128 114 C126 70, 149 46, 180 46 C209 46, 230 68, 232 106"
              stroke="#45d3c3"
              strokeOpacity="0.32"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <path
              d="M214 52 C232 68, 238 96, 236 128"
              stroke={`url(#${uid}-rim-teal)`}
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Inner Hijab Underscarf Frame */}
            <path
              d="M132 118 C132 76, 152 54, 180 54 C208 54, 228 76, 228 118 C228 146, 210 166, 180 166 C150 166, 132 146, 132 118 Z"
              fill="#064e5d"
            />

            {/* Soft Parted Hairline Frame */}
            <path
              d="M138 110 C138 74, 156 60, 180 60 C204 60, 222 74, 222 110 C214 88, 198 78, 184 76 C166 78, 148 88, 138 110 Z"
              fill={`url(#${uid}-hair)`}
            />
            <path
              d="M148 81 C161 71, 174 68, 186 69"
              stroke="#6a4437"
              strokeOpacity="0.48"
              strokeWidth="1.6"
              strokeLinecap="round"
            />

            {/* Mature Proportional South Asian Oval Face */}
            <path
              d="M140 108 C140 80, 156 68, 180 68 C204 68, 220 80, 220 108 C220 139, 202 162, 180 162 C158 162, 140 139, 140 108 Z"
              fill={`url(#${uid}-skin-face)`}
            />

            {/* Soft Warm Cheek Blush & Subtle Chin Highlight */}
            <ellipse cx="155" cy="126" rx="10" ry="6.5" fill={`url(#${uid}-cheek)`} />
            <ellipse cx="205" cy="126" rx="10" ry="6.5" fill={`url(#${uid}-cheek)`} />
            <ellipse cx="180" cy="153" rx="7" ry="3.5" fill="#fde3cc" fillOpacity="0.24" />

            {/* Expressive Natural Eyebrows */}
            <motion.g animate={{ y: rig.browY }} transition={poseTransition}>
              <path
                d="M150 98 C156 94, 164 94, 171 96.5"
                stroke="#26150f"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              <path
                d="M189 96.5 C196 94, 204 94, 210 98"
                stroke="#26150f"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
            </motion.g>

            {/* Expressive Proportional Almond Eyes with Subtle Gaze Tracking & Blinking */}
            <g>
              {/* Left Eye Socket & Spherical Sclera */}
              <path
                d="M151 110 C155 103.5, 166 103.5, 170 110 C166 115.5, 155 115.5, 151 110 Z"
                fill={`url(#${uid}-sclera)`}
              />
              <motion.g
                animate={rig.gaze}
                transition={poseTransition}
                style={{
                  x: interactive && !reduced ? pointerEyeX : 0,
                  y: interactive && !reduced ? pointerEyeY : 0,
                }}
              >
                <circle cx="160.8" cy="109.8" r="4.6" fill={`url(#${uid}-iris)`} />
                <circle cx="160.8" cy="109.8" r="2.1" fill="#120804" />
                <circle cx="162.4" cy="108" r="1.4" fill="#ffffff" />
                <circle cx="159" cy="111.2" r="0.65" fill="#ffffff" fillOpacity="0.75" />
              </motion.g>
              <path
                d="M150 110 C154 103, 167 103, 170.5 109.8"
                stroke="#1d100c"
                strokeWidth="2.1"
                strokeLinecap="round"
              />

              {/* Right Eye Socket & Spherical Sclera */}
              <path
                d="M190 110 C194 103.5, 205 103.5, 209 110 C205 115.5, 194 115.5, 190 110 Z"
                fill={`url(#${uid}-sclera)`}
              />
              <motion.g
                animate={rig.gaze}
                transition={poseTransition}
                style={{
                  x: interactive && !reduced ? pointerEyeX : 0,
                  y: interactive && !reduced ? pointerEyeY : 0,
                }}
              >
                <circle cx="199.2" cy="109.8" r="4.6" fill={`url(#${uid}-iris)`} />
                <circle cx="199.2" cy="109.8" r="2.1" fill="#120804" />
                <circle cx="200.8" cy="108" r="1.4" fill="#ffffff" />
                <circle cx="197.4" cy="111.2" r="0.65" fill="#ffffff" fillOpacity="0.75" />
              </motion.g>
              <path
                d="M189.5 109.8 C193 103, 206 103, 210 110"
                stroke="#1d100c"
                strokeWidth="2.1"
                strokeLinecap="round"
              />

              {/* Smooth Upper Eyelids During Blink */}
              {blinking && (
                <g>
                  <path
                    d="M150 110 C154 103, 167 103, 171 110 C167 115, 154 115, 150 110 Z"
                    fill="#ecb38b"
                  />
                  <path
                    d="M150.5 110.5 Q160.5 113.5 170.5 110.5"
                    stroke="#21120d"
                    strokeWidth="2.1"
                    strokeLinecap="round"
                  />
                  <path
                    d="M189 110 C193 103, 206 103, 210 110 C206 115, 193 115, 189 110 Z"
                    fill="#ecb38b"
                  />
                  <path
                    d="M189.5 110.5 Q199.5 113.5 209.5 110.5"
                    stroke="#21120d"
                    strokeWidth="2.1"
                    strokeLinecap="round"
                  />
                </g>
              )}
            </g>

            {/* Sculpted Nose (Bridge highlight + soft tip shadow) */}
            <path
              d="M179 109 L179.5 123"
              stroke="#fde3cc"
              strokeOpacity="0.42"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M175.5 124.5 C177.5 126.5, 182.5 126.5, 184.5 124.5"
              stroke="#c0764f"
              strokeOpacity="0.72"
              strokeWidth="1.6"
              strokeLinecap="round"
            />

            {/* Sculpted Natural Lips & Warm Smile */}
            <motion.path
              d={rig.smilePath}
              stroke="#8c4234"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M170 136 Q176 134 180 135.5 Q184 134 190 136"
              stroke="#b66050"
              strokeOpacity="0.55"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <path
              d="M174 143 Q180 145.5 186 143"
              stroke="#d98974"
              strokeOpacity="0.55"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </motion.g>
        </motion.g>
      </svg>
    </div>
  );
}
