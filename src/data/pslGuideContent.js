/**
 * Contextual guide captions, separated conversational idle choreography, and
 * verified Pakistan Sign Language (PSL) playback slots.
 *
 * ARCHITECTURE RULE:
 * - Never invent or simulate Pakistan Sign Language gestures.
 * - `mode: "idle"` drives natural, non-PSL human presence (breathing, eye contact,
 *   subtle head movement, welcoming/explanatory posture).
 * - `pslClip` / `validatedSequence` only activate when `verified: true` with
 *   authentic PSL video assets or validated PSL keyframe data.
 */

export const HERO_3D_MODEL_CONFIG = {
  // Set to "/assets/models/ishara-guide.glb" once a rigged humanoid .glb asset is placed in public/assets/models/
  glbUrl: null,
  expectedAssetPath: "public/assets/models/ishara-guide.glb",
  dracoDecoderPath: null,
  appearanceSpec: {
    identity: "Friendly, mature South Asian female virtual guide with natural adult proportions",
    wardrobePalette: {
      hijab: ["#F5EFE6", "#E5D8C5", "#CAB9A3"],
      tunic: ["#E6DAC8", "#CFC0AB", "#B4A28B"],
      rules: "Plain neutral hijab and modest neutral tunic — zero patterns, logos, badges, or accessories",
    },
  },
  requiredRigContract: {
    coreBones: ["Hips", "Spine", "Spine1", "Spine2", "Neck", "Head"],
    armChainBones: [
      "LeftShoulder",
      "LeftArm",
      "LeftForeArm",
      "LeftHand",
      "RightShoulder",
      "RightArm",
      "RightForeArm",
      "RightHand",
    ],
    fingerChainsPerHand: ["Thumb", "Index", "Middle", "Ring", "Pinky"],
    facialMorphTargets: [
      "eyeBlinkLeft",
      "eyeBlinkRight",
      "eyeLookInLeft",
      "eyeLookOutLeft",
      "eyeLookUpLeft",
      "eyeLookDownLeft",
      "mouthSmileLeft",
      "mouthSmileRight",
      "browInnerUp",
    ],
  },
};

export const HERO_IDLE_BEATS = [
  {
    id: "welcome-open",
    durationMs: 4200,
    pose: "welcome",
  },
  {
    id: "attentive-contact",
    durationMs: 3600,
    pose: "attentive",
  },
  {
    id: "gentle-present",
    durationMs: 4400,
    pose: "present",
  },
  {
    id: "calm-rest",
    durationMs: 3800,
    pose: "attentive",
  },
];

export const PSL_GUIDE_SECTIONS = {
  hero: {
    id: "hero",
    pose: "welcome",
    heading: "Welcome to ISHARA AI",
    caption:
      "I am here to guide you through live camera framing and video uploads for Pakistan Sign Language.",
    pslClip: {
      verified: false,
      videoUrl: null,
      title: "PSL Welcome Introduction",
      cues: [],
    },
    validatedSequence: {
      verified: false,
      signId: null,
      frames: [],
    },
  },
  workflow: {
    id: "workflow",
    pose: "point",
    heading: "Three clear steps",
    caption:
      "Choose your camera or video file, review your framing before submitting, and prepare clips for translation.",
    pslClip: {
      verified: false,
      videoUrl: null,
      title: "PSL Workflow Overview",
      cues: [],
    },
    validatedSequence: {
      verified: false,
      signId: null,
      frames: [],
    },
  },
  start: {
    id: "start",
    pose: "explain",
    heading: "Two ways to begin",
    caption:
      "Record directly with your live webcam or upload a recorded MP4, WebM, or AVI clip from your device.",
    pslClip: {
      verified: false,
      videoUrl: null,
      title: "PSL Recording & Upload Guide",
      cues: [],
    },
    validatedSequence: {
      verified: false,
      signId: null,
      frames: [],
    },
  },
  accessibility: {
    id: "accessibility",
    pose: "inclusive",
    heading: "Inclusive communication",
    caption:
      "Unmirrored previews, plain status feedback, and keyboard-friendly controls built around signers' needs.",
    pslClip: {
      verified: false,
      videoUrl: null,
      title: "PSL Accessibility Standards",
      cues: [],
    },
    validatedSequence: {
      verified: false,
      signId: null,
      frames: [],
    },
  },
  closing: {
    id: "closing",
    pose: "invite",
    heading: "Ready when you are",
    caption:
      "Create an account or sign in to open your recording workspace and review your saved clips.",
    pslClip: {
      verified: false,
      videoUrl: null,
      title: "PSL Getting Started Invitation",
      cues: [],
    },
    validatedSequence: {
      verified: false,
      signId: null,
      frames: [],
    },
  },
};
