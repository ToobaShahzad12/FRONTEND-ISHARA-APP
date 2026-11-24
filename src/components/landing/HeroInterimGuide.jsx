import { useEffect, useId, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { usePrefersReducedMotion } from "../ds/MotionPrimitives";

/**
 * Anatomically continuous, neutral-wardrobe interim 2D portrait shown ONLY inside the hero
 * stage while no external rigged humanoid `.glb` asset is configured in HERO_3D_MODEL_CONFIG.
 *
 * - Unified continuous shoulder -> upper arm -> elbow -> forearm -> cuff -> wrist -> 5-finger hand anatomy.
 * - Neutral warm ivory hijab & plain stone-taupe modest tunic (no logos, patterns, badges, or accessories).
 * - Calm, subtle idle presence (breathing, natural blinking, soft eye gaze) respecting prefers-reduced-motion.
 */
export default function HeroInterimGuide({ interactive = true, active = true }) {
  const reduced = usePrefersReducedMotion();
  const uid = useId().replace(/:/g, "");
  const containerRef = useRef(null);
  const [blinking, setBlinking] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 70, damping: 24 });
  const springY = useSpring(mouseY, { stiffness: 70, damping: 24 });
  const headTiltX = useTransform(springX, [-0.5, 0.5], [-2.2, 2.2]);
  const headTiltY = useTransform(springY, [-0.5, 0.5], [-1.5, 1.5]);
  const eyeGazeX = useTransform(springX, [-0.5, 0.5], [-1.6, 1.6]);
  const eyeGazeY = useTransform(springY, [-0.5, 0.5], [-1.0, 1.0]);

  useEffect(() => {
    if (reduced || !active) return undefined;
    let closeTimer;
    let nextTimer;

    const scheduleBlink = () => {
      const delay = 3100 + Math.random() * 2500;
      nextTimer = window.setTimeout(() => {
        setBlinking(true);
        closeTimer = window.setTimeout(() => {
          setBlinking(false);
          scheduleBlink();
        }, 145);
      }, delay);
    };

    scheduleBlink();
    return () => {
      if (nextTimer) window.clearTimeout(nextTimer);
      if (closeTimer) window.clearTimeout(closeTimer);
    };
  }, [reduced, active]);

  function handlePointerMove(e) {
    if (!interactive || reduced || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handlePointerLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <div
      ref={containerRef}
      className="ds-hero-interim-figure"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 400 370"
        fill="none"
        className="ds-hero-interim-svg"
        focusable="false"
      >
        <defs>
          {/* South Asian Warm Subsurface Skin Tones */}
          <radialGradient id={`${uid}-face-skin`} cx="42%" cy="34%" r="66%">
            <stop offset="0%" stopColor="#F9DEC4" />
            <stop offset="48%" stopColor="#E9B084" />
            <stop offset="84%" stopColor="#CD855B" />
            <stop offset="100%" stopColor="#B26A44" />
          </radialGradient>

          <radialGradient id={`${uid}-hand-skin`} cx="40%" cy="32%" r="68%">
            <stop offset="0%" stopColor="#F6D8BC" />
            <stop offset="56%" stopColor="#E4A77B" />
            <stop offset="100%" stopColor="#C47B52" />
          </radialGradient>

          <linearGradient id={`${uid}-neck-skin`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#B9714A" />
            <stop offset="55%" stopColor="#D79268" />
            <stop offset="100%" stopColor="#BD764F" />
          </linearGradient>

          <radialGradient id={`${uid}-cheek`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#DA7963" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#DA7963" stopOpacity="0" />
          </radialGradient>

          {/* Neutral Warm Ivory / Cream Hijab Gradients */}
          <radialGradient id={`${uid}-hijab-hood`} cx="36%" cy="22%" r="76%">
            <stop offset="0%" stopColor="#FBF7F0" />
            <stop offset="46%" stopColor="#EDE2D2" />
            <stop offset="84%" stopColor="#D4C3AE" />
            <stop offset="100%" stopColor="#B8A48C" />
          </radialGradient>

          <linearGradient id={`${uid}-hijab-drape`} x1="20%" y1="0%" x2="82%" y2="100%">
            <stop offset="0%" stopColor="#F6EFE4" />
            <stop offset="52%" stopColor="#E5D8C5" />
            <stop offset="100%" stopColor="#C4B19A" />
          </linearGradient>

          <linearGradient id={`${uid}-hijab-fold`} x1="0%" y1="0%" x2="100%" y2="95%">
            <stop offset="0%" stopColor="#FFFDF9" stopOpacity="0.45" />
            <stop offset="55%" stopColor="#D6C6B1" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#9E8B74" stopOpacity="0.44" />
          </linearGradient>

          {/* Neutral Plain Modest Stone-Taupe / Warm Beige Tunic */}
          <linearGradient id={`${uid}-tunic-torso`} x1="24%" y1="0%" x2="84%" y2="100%">
            <stop offset="0%" stopColor="#ECE3D5" />
            <stop offset="48%" stopColor="#DACCB8" />
            <stop offset="86%" stopColor="#C1AF98" />
            <stop offset="100%" stopColor="#A9967F" />
          </linearGradient>

          <linearGradient id={`${uid}-tunic-sleeve-l`} x1="12%" y1="0%" x2="90%" y2="100%">
            <stop offset="0%" stopColor="#EAE0D1" />
            <stop offset="54%" stopColor="#D5C6B1" />
            <stop offset="100%" stopColor="#B5A28A" />
          </linearGradient>

          <linearGradient id={`${uid}-tunic-sleeve-r`} x1="88%" y1="0%" x2="10%" y2="100%">
            <stop offset="0%" stopColor="#E4D9C9" />
            <stop offset="54%" stopColor="#CDBDA7" />
            <stop offset="100%" stopColor="#AE9B83" />
          </linearGradient>

          <linearGradient id={`${uid}-hair`} x1="25%" y1="0%" x2="75%" y2="100%">
            <stop offset="0%" stopColor="#42281F" />
            <stop offset="60%" stopColor="#24140F" />
            <stop offset="100%" stopColor="#140A07" />
          </linearGradient>

          <linearGradient id={`${uid}-sclera`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#DDE2E6" />
            <stop offset="30%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F7F8F9" />
          </linearGradient>

          <radialGradient id={`${uid}-iris`} cx="46%" cy="42%" r="54%">
            <stop offset="0%" stopColor="#6D3F27" />
            <stop offset="58%" stopColor="#3F1F11" />
            <stop offset="92%" stopColor="#231008" />
            <stop offset="100%" stopColor="#170904" />
          </radialGradient>

          <linearGradient id={`${uid}-rim-soft`} x1="100%" y1="0%" x2="10%" y2="85%">
            <stop offset="0%" stopColor="#9DF2E5" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#9DF2E5" stopOpacity="0" />
          </linearGradient>

          <radialGradient id={`${uid}-floor-shadow`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#042938" stopOpacity="0.34" />
            <stop offset="72%" stopColor="#042938" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#042938" stopOpacity="0" />
          </radialGradient>

          <filter id={`${uid}-drop-shadow`} x="-15%" y="-15%" width="130%" height="135%">
            <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#042938" floodOpacity="0.24" />
          </filter>

          <filter id={`${uid}-soft-blur`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
        </defs>

        {/* Soft Studio Ground Contact Shadow */}
        <ellipse cx="200" cy="356" rx="116" ry="11" fill={`url(#${uid}-floor-shadow)`} />

        {/* Unified Upper-Body Container (gentle calm breathing anchored at waist) */}
        <motion.g
          filter={`url(#${uid}-drop-shadow)`}
          animate={reduced || !active ? undefined : { y: [0, -1.5, 0] }}
          transition={
            reduced || !active
              ? undefined
              : { y: { duration: 5.4, repeat: Infinity, ease: "easeInOut" } }
          }
          style={{ originX: "200px", originY: "352px" }}
        >
          {/* Back Hijab Silhouette Framing Shoulders */}
          <path
            d="M142 132 C126 176, 120 226, 118 286 L282 286 C280 226, 274 176, 258 132 Z"
            fill={`url(#${uid}-hijab-hood)`}
          />

          {/* =========================================================
              UNIFIED TORSO + CONTINUOUS LEFT & RIGHT SLEEVE ANATOMY
              Shoulder -> Upper Arm -> Elbow -> Forearm -> Tailored Cuff
              (Single unbroken anatomical geometry — never disconnected)
              ========================================================= */}
          <path
            d="M164 176
               C148 180, 134 186, 124 196
               C102 218, 86 250, 82 276
               C79 292, 92 302, 108 292
               C116 286, 122 274, 126 260
               L132 356
               L268 356
               L274 260
               C278 274, 284 286, 292 292
               C308 302, 321 292, 318 276
               C314 250, 298 218, 276 196
               C266 186, 252 180, 236 176
               Z"
            fill={`url(#${uid}-tunic-torso)`}
          />

          {/* Subtle Cylindrical Torso Shading & Natural Tunic Drape */}
          <path
            d="M240 192 C248 242, 250 298, 248 356 L268 356 L272 252 C266 226, 256 206, 240 192 Z"
            fill="#9E8B74"
            fillOpacity="0.28"
          />
          <path
            d="M154 258 C158 290, 158 324, 156 356"
            stroke="#AC9880"
            strokeOpacity="0.32"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M242 260 C238 292, 238 326, 240 356"
            stroke="#9E8B74"
            strokeOpacity="0.3"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Continuous Left Sleeve Forearm Rising From Elbow (82,276..108,292) to Cuff (110,228..132,236) */}
          <path
            d="M84 274
               C82 290, 96 300, 110 290
               C122 280, 128 260, 134 236
               C128 228, 116 225, 108 230
               C100 246, 92 260, 84 274 Z"
            fill={`url(#${uid}-tunic-sleeve-l)`}
          />
          {/* Left Elbow Crease & Underarm Depth Shadow */}
          <path
            d="M126 246 C128 262, 124 276, 114 286"
            stroke="#9B8770"
            strokeOpacity="0.45"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M100 264 C106 258, 114 256, 120 260"
            stroke="#A5917A"
            strokeOpacity="0.38"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          {/* Left Tailored Sleeve Cuff */}
          <ellipse
            cx="121"
            cy="232"
            rx="13.5"
            ry="6.8"
            transform="rotate(14 121 232)"
            fill="#9B8770"
            fillOpacity="0.52"
          />
          <path
            d="M108 231 C114 237, 127 238, 133 234"
            stroke="#FBF6EE"
            strokeWidth="1.6"
            strokeLinecap="round"
          />

          {/* Continuous Right Sleeve Forearm Rising From Elbow (316,274..290,290) to Cuff (266,236..292,230) */}
          <path
            d="M316 274
               C318 290, 304 300, 290 290
               C278 280, 272 260, 266 236
               C272 228, 284 225, 292 230
               C300 246, 308 260, 316 274 Z"
            fill={`url(#${uid}-tunic-sleeve-r)`}
          />
          {/* Right Elbow Crease & Underarm Depth Shadow */}
          <path
            d="M274 246 C272 262, 276 276, 286 286"
            stroke="#948069"
            strokeOpacity="0.45"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M300 264 C294 258, 286 256, 280 260"
            stroke="#9B8770"
            strokeOpacity="0.38"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          {/* Right Tailored Sleeve Cuff */}
          <ellipse
            cx="279"
            cy="232"
            rx="13.5"
            ry="6.8"
            transform="rotate(-14 279 232)"
            fill="#948069"
            fillOpacity="0.52"
          />
          <path
            d="M292 231 C286 237, 273 238, 267 234"
            stroke="#FBF6EE"
            strokeWidth="1.6"
            strokeLinecap="round"
          />

          {/* =========================================================
              CONNECTED WRISTS & ANATOMICALLY DETAILED 5-FINGER HANDS
              Both hands stay completely visible inside the hero stage
              ========================================================= */}
          {/* LEFT HAND (Connected directly into Left Cuff at 121, 232) */}
          <g>
            {/* Wrist Stem Inside Cuff */}
            <path
              d="M114 233 C112 224, 111 217, 112 210 L129 212 C129 219, 128 226, 127 234 Z"
              fill={`url(#${uid}-hand-skin)`}
            />
            {/* Palm & Thenar Cushion */}
            <path
              d="M107 206 C105 196, 108 188, 118 187 C127 187, 134 193, 134 203 C134 211, 130 216, 121 217 C113 217, 108 212, 107 206 Z"
              fill={`url(#${uid}-hand-skin)`}
            />
            {/* 1. Pinky Finger (outer) */}
            <path
              d="M107 200 C103 192, 99 183, 98 176 C97.5 172.5, 102 171.5, 103.8 175 L110 192 Z"
              fill={`url(#${uid}-hand-skin)`}
            />
            {/* 2. Ring Finger */}
            <path
              d="M111 192 C108 181, 106 170, 106 162 C106 158.5, 110.5 158, 112 162 L117 189 Z"
              fill={`url(#${uid}-hand-skin)`}
            />
            {/* 3. Middle Finger */}
            <path
              d="M117 189 C116 176, 115.5 164, 116 156 C116.3 152.5, 121 152.5, 122 156 L123.5 189 Z"
              fill={`url(#${uid}-hand-skin)`}
            />
            {/* 4. Index Finger */}
            <path
              d="M124 190 C125 178, 126.5 167, 127.5 160 C128.2 156.5, 132.8 157.5, 132.8 161 L130 193 Z"
              fill={`url(#${uid}-hand-skin)`}
            />
            {/* 5. Thumb (natural opposable saddle angle) */}
            <path
              d="M129 208 C134 200, 140 191, 145 186 C147.8 183.5, 151.2 186.5, 149 190.5 C144 198, 138 207, 131 214 Z"
              fill={`url(#${uid}-hand-skin)`}
            />
            {/* Subtle Anatomical Finger Separation & Palm Creases */}
            <path
              d="M110 192 L106 176 M117 189 L115 163 M123.5 189 L126 164"
              stroke="#B87049"
              strokeOpacity="0.34"
              strokeWidth="1.05"
              strokeLinecap="round"
            />
            <path
              d="M113 196 C118 195, 124 196, 128 200 M115 203 C121 203, 126 206, 128 211"
              stroke="#B87049"
              strokeOpacity="0.36"
              strokeWidth="1.1"
              strokeLinecap="round"
            />
          </g>

          {/* RIGHT HAND (Connected directly into Right Cuff at 279, 232) */}
          <g>
            {/* Wrist Stem Inside Cuff */}
            <path
              d="M286 233 C288 224, 289 217, 288 210 L271 212 C271 219, 272 226, 273 234 Z"
              fill={`url(#${uid}-hand-skin)`}
            />
            {/* Palm & Thenar Cushion */}
            <path
              d="M293 206 C295 196, 292 188, 282 187 C273 187, 266 193, 266 203 C266 211, 270 216, 279 217 C287 217, 292 212, 293 206 Z"
              fill={`url(#${uid}-hand-skin)`}
            />
            {/* 1. Pinky Finger (outer) */}
            <path
              d="M293 200 C297 192, 301 183, 302 176 C302.5 172.5, 298 171.5, 296.2 175 L290 192 Z"
              fill={`url(#${uid}-hand-skin)`}
            />
            {/* 2. Ring Finger */}
            <path
              d="M289 192 C292 181, 294 170, 294 162 C294 158.5, 289.5 158, 288 162 L283 189 Z"
              fill={`url(#${uid}-hand-skin)`}
            />
            {/* 3. Middle Finger */}
            <path
              d="M283 189 C284 176, 284.5 164, 284 156 C283.7 152.5, 279 152.5, 278 156 L276.5 189 Z"
              fill={`url(#${uid}-hand-skin)`}
            />
            {/* 4. Index Finger */}
            <path
              d="M276 190 C275 178, 273.5 167, 272.5 160 C271.8 156.5, 267.2 157.5, 267.2 161 L270 193 Z"
              fill={`url(#${uid}-hand-skin)`}
            />
            {/* 5. Thumb (natural opposable saddle angle) */}
            <path
              d="M271 208 C266 200, 260 191, 255 186 C252.2 183.5, 248.8 186.5, 251 190.5 C256 198, 262 207, 269 214 Z"
              fill={`url(#${uid}-hand-skin)`}
            />
            {/* Subtle Anatomical Finger Separation & Palm Creases */}
            <path
              d="M290 192 L294 176 M283 189 L285 163 M276.5 189 L274 164"
              stroke="#B87049"
              strokeOpacity="0.34"
              strokeWidth="1.05"
              strokeLinecap="round"
            />
            <path
              d="M287 196 C282 195, 276 196, 272 200 M285 203 C279 203, 274 206, 272 211"
              stroke="#B87049"
              strokeOpacity="0.36"
              strokeWidth="1.1"
              strokeLinecap="round"
            />
          </g>

          {/* Soft Cast Shadow Under Hijab Drape onto Stone-Taupe Tunic */}
          <path
            d="M140 196 C158 232, 182 246, 200 246 C220 246, 244 232, 260 196 C244 222, 222 234, 200 234 C178 234, 156 222, 140 196 Z"
            fill="#8D7963"
            fillOpacity="0.28"
            filter={`url(#${uid}-soft-blur)`}
          />

          {/* Neck Connecting Head Seamlessly Into Hijab Collar */}
          <path
            d="M182 146 L182 182 C190 190, 210 190, 218 182 L218 146 Z"
            fill={`url(#${uid}-neck-skin)`}
          />

          {/* Layered Neutral Warm Ivory Hijab Chest & Shoulder Drape */}
          <path
            d="M144 134 C128 170, 132 214, 158 232 C180 246, 220 246, 242 232 C268 214, 272 170, 256 134 C238 156, 220 166, 200 166 C180 166, 162 156, 144 134 Z"
            fill={`url(#${uid}-hijab-drape)`}
          />
          {/* Subtle Plain Fabric Folds (Zero patterns or accessories) */}
          <path
            d="M142 160 C168 188, 210 198, 256 176 C240 202, 200 214, 152 190 Z"
            fill={`url(#${uid}-hijab-fold)`}
          />
          <path
            d="M150 194 C178 220, 220 222, 248 200 C228 232, 182 238, 154 214 Z"
            fill="#A6927A"
            fillOpacity="0.24"
          />
          <path
            d="M254 140 C266 172, 264 204, 242 228"
            stroke={`url(#${uid}-rim-soft)`}
            strokeWidth="2.6"
            strokeLinecap="round"
          />

          {/* =========================================================
              HEAD -> ADULT FACIAL PROPORTIONS -> EXPRESSIVE EYES / GAZE
              Pivots gently around neck center inside hijab frame
              ========================================================= */}
          <motion.g
            style={{
              originX: "200px",
              originY: "148px",
              x: interactive && !reduced ? headTiltX : 0,
              y: interactive && !reduced ? headTiltY : 0,
            }}
          >
            {/* Outer Hijab Hood */}
            <path
              d="M138 116 C136 64, 162 34, 200 34 C238 34, 264 64, 262 116 C262 146, 244 168, 200 168 C156 168, 138 146, 138 116 Z"
              fill={`url(#${uid}-hijab-hood)`}
            />
            {/* Key & Cool Rim Edge Light on Crown */}
            <path
              d="M146 108 C144 64, 168 40, 200 40 C230 40, 250 62, 254 100"
              stroke="#FFFDF9"
              strokeOpacity="0.46"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M234 46 C252 62, 260 90, 258 122"
              stroke={`url(#${uid}-rim-soft)`}
              strokeWidth="2.8"
              strokeLinecap="round"
            />

            {/* Soft Inner Underscarf Band */}
            <path
              d="M150 112 C150 70, 170 48, 200 48 C230 48, 250 70, 250 112 C250 140, 232 160, 200 160 C168 160, 150 140, 150 112 Z"
              fill="#CBB9A3"
            />

            {/* Softly Parted Dark Hairline Framing Forehead */}
            <path
              d="M156 104 C156 68, 174 54, 200 54 C226 54, 244 68, 244 104 C236 82, 220 72, 204 70 C186 72, 168 82, 156 104 Z"
              fill={`url(#${uid}-hair)`}
            />

            {/* Mature Proportional South Asian Adult Oval Face */}
            <path
              d="M158 103 C158 74, 174 62, 200 62 C226 62, 242 74, 242 103 C242 134, 224 157, 200 157 C176 157, 158 134, 158 103 Z"
              fill={`url(#${uid}-face-skin)`}
            />

            {/* Subtle Natural Cheek & Chin Light */}
            <ellipse cx="174" cy="121" rx="10" ry="6" fill={`url(#${uid}-cheek)`} />
            <ellipse cx="226" cy="121" rx="10" ry="6" fill={`url(#${uid}-cheek)`} />
            <ellipse cx="200" cy="148" rx="7" ry="3.2" fill="#F9DEC4" fillOpacity="0.24" />

            {/* Natural Arched Eyebrows */}
            <path
              d="M169 92.5 C175 88.5, 183 88.5, 190 91"
              stroke="#24140E"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M210 91 C217 88.5, 225 88.5, 231 92.5"
              stroke="#24140E"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Realistic Proportional Expressive Brown Eyes */}
            <g>
              {/* Left Eye */}
              <path
                d="M170 104 C174 98, 185 98, 189 104 C185 109.2, 174 109.2, 170 104 Z"
                fill={`url(#${uid}-sclera)`}
              />
              <motion.g
                style={{
                  x: interactive && !reduced ? eyeGazeX : 0,
                  y: interactive && !reduced ? eyeGazeY : 0,
                }}
              >
                <circle cx="179.8" cy="103.8" r="4.3" fill={`url(#${uid}-iris)`} />
                <circle cx="179.8" cy="103.8" r="1.95" fill="#120804" />
                <circle cx="181.3" cy="102.2" r="1.3" fill="#FFFFFF" />
                <circle cx="178.1" cy="105.1" r="0.6" fill="#FFFFFF" fillOpacity="0.72" />
              </motion.g>
              <path
                d="M169.5 104 C173.5 97.5, 185.5 97.5, 189.5 103.8"
                stroke="#1D100C"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Right Eye */}
              <path
                d="M211 104 C215 98, 226 98, 230 104 C226 109.2, 215 109.2, 211 104 Z"
                fill={`url(#${uid}-sclera)`}
              />
              <motion.g
                style={{
                  x: interactive && !reduced ? eyeGazeX : 0,
                  y: interactive && !reduced ? eyeGazeY : 0,
                }}
              >
                <circle cx="220.2" cy="103.8" r="4.3" fill={`url(#${uid}-iris)`} />
                <circle cx="220.2" cy="103.8" r="1.95" fill="#120804" />
                <circle cx="221.7" cy="102.2" r="1.3" fill="#FFFFFF" />
                <circle cx="218.5" cy="105.1" r="0.6" fill="#FFFFFF" fillOpacity="0.72" />
              </motion.g>
              <path
                d="M210.5 103.8 C214.5 97.5, 226.5 97.5, 230.5 104"
                stroke="#1D100C"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Natural Eyelids During Blink */}
              {blinking && (
                <g>
                  <path
                    d="M169.5 104 C173.5 97.5, 185.5 97.5, 189.5 104 C185.5 109, 173.5 109, 169.5 104 Z"
                    fill="#E5AC81"
                  />
                  <path
                    d="M170 104.5 Q179.5 107.2 189 104.5"
                    stroke="#21120D"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M210.5 104 C214.5 97.5, 226.5 97.5, 230.5 104 C226.5 109, 214.5 109, 210.5 104 Z"
                    fill="#E5AC81"
                  />
                  <path
                    d="M211 104.5 Q220.5 107.2 230 104.5"
                    stroke="#21120D"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </g>
              )}
            </g>

            {/* Sculpted Nose */}
            <path
              d="M199.5 104 L200 118"
              stroke="#F9DEC4"
              strokeOpacity="0.4"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
            <path
              d="M195.8 119.5 C197.8 121.4, 202.2 121.4, 204.2 119.5"
              stroke="#BA724C"
              strokeOpacity="0.7"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            {/* Gentle Confident Smile & Natural Lips */}
            <path
              d="M186 132.5 Q200 140.5 214 132.5"
              stroke="#8B4133"
              strokeWidth="2.1"
              strokeLinecap="round"
            />
            <path
              d="M190.5 131.5 Q196 129.6 200 131 Q204 129.6 209.5 131.5"
              stroke="#B45F4F"
              strokeOpacity="0.52"
              strokeWidth="1.25"
              strokeLinecap="round"
            />
            <path
              d="M194 138 Q200 140.5 206 138"
              stroke="#D68671"
              strokeOpacity="0.5"
              strokeWidth="1.25"
              strokeLinecap="round"
            />
          </motion.g>
        </motion.g>
      </svg>
    </div>
  );
}
