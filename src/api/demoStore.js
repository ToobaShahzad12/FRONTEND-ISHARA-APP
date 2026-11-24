// Frontend-only Demo Mode store for ISHARA AI.
// Set IS_DEMO_MODE to false to immediately restore live backend API calls
// in src/api/auth.js and src/api/admin.js.
export const IS_DEMO_MODE = true;

const DEMO_SESSION_KEY = "ishara_demo_session";
const DEMO_USERS_KEY = "ishara_demo_users";
const DEMO_SIGNS_KEY = "ishara_demo_psl_signs";
const DEMO_ARTICLES_KEY = "ishara_demo_kb_articles";
const DEMO_LOGS_KEY = "ishara_demo_system_logs";
const DEMO_ACTIVITY_KEY = "ishara_demo_processing_activity";
const DEMO_HISTORY_KEY = "ishara_demo_translation_history";
const DEMO_SAVED_SIGNS_KEY = "ishara_demo_saved_signs";
const TOKEN_KEY = "ishara_access_token";

function hoursAgoIso(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function daysAgoIso(days, hourOffset = 0) {
  return new Date(
    Date.now() - days * 24 * 60 * 60 * 1000 - hourOffset * 60 * 60 * 1000
  ).toISOString();
}

export const DEMO_PROFILES = {
  user: {
    id: 102,
    full_name: "Ayesha Siddiqui",
    email: "ayesha.demo@ishara.ai",
    role: "user",
    status: "active",
    is_verified: true,
    google_linked: false,
    created_at: "2026-01-14T09:30:00Z",
    is_demo: true,
  },
  admin: {
    id: 1,
    full_name: "Tariq Mahmood",
    email: "admin.demo@ishara.ai",
    role: "admin",
    status: "active",
    is_verified: true,
    google_linked: true,
    created_at: "2025-11-02T08:00:00Z",
    is_demo: true,
  },
};

function createInitialUsers() {
  return [
    { ...DEMO_PROFILES.admin },
    { ...DEMO_PROFILES.user },
    {
      id: 103,
      full_name: "Hamza Tariq",
      email: "hamza.tariq@example.pk",
      role: "user",
      status: "active",
      is_verified: true,
      google_linked: false,
      created_at: "2026-02-04T11:15:00Z",
    },
    {
      id: 104,
      full_name: "Zainab Raza",
      email: "zainab.raza@example.pk",
      role: "user",
      status: "pending",
      is_verified: false,
      google_linked: false,
      created_at: "2026-03-19T14:40:00Z",
    },
    {
      id: 105,
      full_name: "Bilal Ahmed Khan",
      email: "bilal.khan@example.pk",
      role: "admin",
      status: "active",
      is_verified: true,
      google_linked: true,
      created_at: "2025-12-10T10:00:00Z",
    },
    {
      id: 106,
      full_name: "Sana Fatima",
      email: "sana.fatima@example.pk",
      role: "user",
      status: "active",
      is_verified: true,
      google_linked: true,
      created_at: "2026-02-22T16:20:00Z",
    },
    {
      id: 107,
      full_name: "Usman Farooq",
      email: "usman.farooq@example.pk",
      role: "user",
      status: "suspended",
      is_verified: true,
      google_linked: false,
      created_at: "2026-01-28T07:50:00Z",
    },
    {
      id: 108,
      full_name: "Hira Nawaz",
      email: "hira.nawaz@example.pk",
      role: "user",
      status: "pending",
      is_verified: false,
      google_linked: false,
      created_at: "2026-04-02T12:10:00Z",
    },
    {
      id: 109,
      full_name: "Saad Qureshi",
      email: "saad.qureshi@example.pk",
      role: "user",
      status: "active",
      is_verified: true,
      google_linked: false,
      created_at: "2026-04-15T15:05:00Z",
    },
  ];
}

function createInitialSigns() {
  return [
    {
      id: 1,
      word: "Assalam-o-Alaikum (Hello)",
      category: "Greetings",
      description:
        "Right open palm raised smoothly from chest toward forehead in respectful greeting. Sample PSL draft entry (Demo Data).",
      status: "reviewed",
      video_url: null,
      image_url: null,
      created_at: daysAgoIso(24),
      updated_at: daysAgoIso(2),
    },
    {
      id: 2,
      word: "Shukriya (Thank you)",
      category: "Greetings",
      description:
        "Flat hand touching chin lightly and extending forward toward the listener. Sample PSL reference (Demo Data).",
      status: "reviewed",
      video_url: null,
      image_url: null,
      created_at: daysAgoIso(21),
      updated_at: daysAgoIso(3),
    },
    {
      id: 3,
      word: "Paani (Water)",
      category: "Food & drink",
      description:
        "Three-finger handshape tapped gently near the lower lip. Recorded in Islamabad regional variant (Demo Data).",
      status: "reviewed",
      video_url: null,
      image_url: null,
      created_at: daysAgoIso(18),
      updated_at: daysAgoIso(4),
    },
    {
      id: 4,
      word: "Chai (Tea)",
      category: "Food & drink",
      description:
        "Pinched fingers circling above curved non-dominant palm as if stirring a cup (Demo Data).",
      status: "draft",
      video_url: null,
      image_url: null,
      created_at: daysAgoIso(12),
      updated_at: daysAgoIso(1),
    },
    {
      id: 5,
      word: "Safar / Bus Stop (Travel)",
      category: "Travel",
      description:
        "Index and middle finger walking forward over open palm; awaiting community review for regional usage (Demo Data).",
      status: "draft",
      video_url: null,
      image_url: null,
      created_at: daysAgoIso(9),
      updated_at: daysAgoIso(1),
    },
    {
      id: 6,
      word: "Madad (Help)",
      category: "Everyday communication",
      description:
        "Closed fist resting on open palm lifted upward together toward chest level (Demo Data).",
      status: "reviewed",
      video_url: null,
      image_url: null,
      created_at: daysAgoIso(15),
      updated_at: daysAgoIso(5),
    },
    {
      id: 7,
      word: "Hospital (Medical)",
      category: "Health",
      description:
        "Cross sign traced cleanly near upper arm; draft reference pending clinical reviewer confirmation (Demo Data).",
      status: "draft",
      video_url: null,
      image_url: null,
      created_at: daysAgoIso(6),
      updated_at: daysAgoIso(0, 8),
    },
    {
      id: 8,
      word: "Khuda Hafiz (Goodbye)",
      category: "Greetings",
      description:
        "Open hand waving gently near shoulder height with warm facial expression (Demo Data).",
      status: "reviewed",
      video_url: null,
      image_url: null,
      created_at: daysAgoIso(11),
      updated_at: daysAgoIso(2),
    },
  ];
}

function createInitialArticles() {
  return [
    {
      id: 1,
      title: "Framing your upper body and hands for clear PSL recording",
      category: "Recording",
      status: "published",
      content:
        "Position your camera at eye level with your head, shoulders, and both hands comfortably inside the frame. Avoid backlighting from windows and wear solid-colored clothing that contrasts with your skin tone. (Demo Data)",
      created_at: daysAgoIso(20),
      updated_at: daysAgoIso(2),
    },
    {
      id: 2,
      title: "Supported video formats and upload preparation",
      category: "Video guidance",
      status: "published",
      content:
        "ISHARA AI accepts MP4, WebM, and browser-playable AVI recordings up to 250 MB. Keep each clip focused on one complete thought with a brief pause at the start and end. (Demo Data)",
      created_at: daysAgoIso(16),
      updated_at: daysAgoIso(3),
    },
    {
      id: 3,
      title: "How PSL dictionary drafts are reviewed with the community",
      category: "PSL dictionary",
      status: "published",
      content:
        "Every new sign entry starts as an unvalidated draft. Expert reviewers and Pakistan Sign Language community members verify regional variations before an entry is marked Reviewed. (Demo Data)",
      created_at: daysAgoIso(14),
      updated_at: daysAgoIso(4),
    },
    {
      id: 4,
      title: "Lighting and background checklist for low-light rooms",
      category: "Recording",
      status: "draft",
      content:
        "Use a soft front-facing desk lamp when overhead lighting casts shadows under the eyes or hands. Keep backgrounds plain and free of moving objects. (Demo Data)",
      created_at: daysAgoIso(7),
      updated_at: daysAgoIso(1),
    },
    {
      id: 5,
      title: "Privacy and consent for submitted sign recordings",
      category: "Policy",
      status: "published",
      content:
        "Clips recorded in Live Camera remain in your browser until you explicitly submit them. Dictionary contributors must confirm signer consent prior to uploading reference videos. (Demo Data)",
      created_at: daysAgoIso(25),
      updated_at: daysAgoIso(5),
    },
    {
      id: 6,
      title: "Troubleshooting camera permission prompts in Chrome and Edge",
      category: "Support",
      status: "published",
      content:
        "If camera access was blocked earlier, click the site settings icon beside the address bar, allow Camera access, and reload the Live Camera page. (Demo Data)",
      created_at: daysAgoIso(10),
      updated_at: daysAgoIso(2),
    },
    {
      id: 7,
      title: "Preparing multi-sign sentences for translation",
      category: "Translation",
      status: "draft",
      content:
        "Pause naturally between separate thoughts and maintain consistent hand visibility throughout transitions. Draft guidance under editorial review. (Demo Data)",
      created_at: daysAgoIso(4),
      updated_at: daysAgoIso(0, 10),
    },
  ];
}

function createInitialLogs() {
  return [
    {
      id: 901,
      severity: "INFO",
      event: "Demo user workspace initialized",
      source: "frontend-demo",
      request_id: "DEMO-REQ-901",
      details:
        "Sample telemetry entry (Demo Data): Frontend demo session opened for workspace preview.",
      timestamp: hoursAgoIso(1),
    },
    {
      id: 902,
      severity: "INFO",
      event: "PSL dictionary draft updated",
      source: "dictionary-service",
      request_id: "DEMO-REQ-902",
      details:
        "Sample log (Demo Data): Reviewer notes updated on sign entry 'Hospital (Medical)'.",
      timestamp: hoursAgoIso(3),
    },
    {
      id: 903,
      severity: "WARN",
      event: "Low clip brightness detected in sample upload",
      source: "video-validator",
      request_id: "DEMO-REQ-903",
      details:
        "Sample warning (Demo Data): Frame luminance below recommended threshold during pre-check.",
      timestamp: hoursAgoIso(6),
    },
    {
      id: 904,
      severity: "ERROR",
      event: "Sample AVI codec preview rejected by browser",
      source: "upload-precheck",
      request_id: "DEMO-REQ-904",
      details:
        "Sample error (Demo Data): Unsupported video codec detected before upload queue.",
      timestamp: hoursAgoIso(11),
    },
    {
      id: 905,
      severity: "INFO",
      event: "Knowledge base article published",
      source: "content-cms",
      request_id: "DEMO-REQ-905",
      details:
        "Sample audit event (Demo Data): Guidance article marked Published by Tariq Mahmood.",
      timestamp: hoursAgoIso(18),
    },
    {
      id: 906,
      severity: "CRITICAL",
      event: "Inference worker heartbeat offline (simulated)",
      source: "ml-pipeline",
      request_id: "DEMO-REQ-906",
      details:
        "Sample critical alert (Demo Data): Backend ML inference service is disconnected in frontend-only Demo Mode.",
      timestamp: hoursAgoIso(22),
    },
    {
      id: 907,
      severity: "WARN",
      event: "Pending account verification reminder queued",
      source: "auth-service",
      request_id: "DEMO-REQ-907",
      details:
        "Sample event (Demo Data): Invitation reminder flagged for pending user account.",
      timestamp: daysAgoIso(3),
    },
    {
      id: 908,
      severity: "INFO",
      event: "System backup verification recorded",
      source: "scheduler",
      request_id: "DEMO-REQ-908",
      details:
        "Sample maintenance event (Demo Data): Routine snapshot check completed.",
      timestamp: daysAgoIso(6),
    },
  ];
}

function createInitialActivity() {
  return [
    {
      id: 501,
      request_id: "DEMO-JOB-2041",
      input_source: "camera",
      created_at: hoursAgoIso(1),
      clip_duration_seconds: 14,
      processing_time_seconds: 3,
      status: "completed",
      error_message: null,
    },
    {
      id: 502,
      request_id: "DEMO-JOB-2040",
      input_source: "upload",
      created_at: hoursAgoIso(3),
      clip_duration_seconds: 26,
      processing_time_seconds: null,
      status: "processing",
      error_message: null,
    },
    {
      id: 503,
      request_id: "DEMO-JOB-2039",
      input_source: "upload",
      created_at: hoursAgoIso(5),
      clip_duration_seconds: 9,
      processing_time_seconds: 2,
      status: "failed",
      error_message:
        "Demo Data: Video stream ended unexpectedly or lacked a readable keyframe.",
    },
    {
      id: 504,
      request_id: "DEMO-JOB-2038",
      input_source: "camera",
      created_at: hoursAgoIso(9),
      clip_duration_seconds: 18,
      processing_time_seconds: null,
      status: "pending",
      error_message: null,
    },
    {
      id: 505,
      request_id: "DEMO-JOB-2037",
      input_source: "upload",
      created_at: daysAgoIso(1, 2),
      clip_duration_seconds: 32,
      processing_time_seconds: 5,
      status: "completed",
      error_message: null,
    },
  ];
}

function createInitialTranslationHistory() {
  return [
    {
      id: "demo-tr-1",
      source: "Assalam_o_Alaikum_greeting.mp4",
      source_language: "PSL video · Demo Data",
      created_at: hoursAgoIso(2),
      duration_seconds: 12,
      status: "completed",
      gloss_preview: "ASSALAM-O-ALAIKUM · HOW ARE YOU",
    },
    {
      id: "demo-tr-2",
      source: "Live camera — Clinic reception",
      source_language: "Live capture · Demo Data",
      created_at: hoursAgoIso(7),
      duration_seconds: 19,
      status: "completed",
      gloss_preview: "DOCTOR · APPOINTMENT · PLEASE",
    },
    {
      id: "demo-tr-3",
      source: "University_helpdesk_question.webm",
      source_language: "PSL video · Demo Data",
      created_at: daysAgoIso(2),
      duration_seconds: 24,
      status: "processing",
      gloss_preview: "Awaiting backend inference",
    },
    {
      id: "demo-tr-4",
      source: "Family_introduction_clip.mp4",
      source_language: "PSL video · Demo Data",
      created_at: daysAgoIso(5),
      duration_seconds: 31,
      status: "completed",
      gloss_preview: "MY NAME · FAMILY · ISLAMABAD",
    },
    {
      id: "demo-tr-5",
      source: "Low_light_test_sample.avi",
      source_language: "PSL video · Demo Data",
      created_at: daysAgoIso(11),
      duration_seconds: 8,
      status: "failed",
      gloss_preview: "Preview codec unsupported",
    },
  ];
}

function readJson(key, fallbackFactory) {
  try {
    const raw = sessionStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Ignore parse errors and re-seed demo data.
  }
  const seeded = fallbackFactory();
  try {
    sessionStorage.setItem(key, JSON.stringify(seeded));
  } catch {
    // Ignore storage quota errors.
  }
  return seeded;
}

function writeJson(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors.
  }
}

export function startDemoSession(role = "user") {
  const normalizedRole = role === "admin" ? "admin" : "user";
  const users = readJson(DEMO_USERS_KEY, createInitialUsers);
  const template = DEMO_PROFILES[normalizedRole];
  const existing = users.find((u) => u.id === template.id) || template;
  const sessionUser = { ...existing, is_demo: true };

  writeJson(DEMO_SESSION_KEY, sessionUser);
  sessionStorage.setItem(TOKEN_KEY, `demo-token-${normalizedRole}`);

  // Ensure demo datasets are initialized in sessionStorage
  readJson(DEMO_SIGNS_KEY, createInitialSigns);
  readJson(DEMO_ARTICLES_KEY, createInitialArticles);
  readJson(DEMO_LOGS_KEY, createInitialLogs);
  readJson(DEMO_ACTIVITY_KEY, createInitialActivity);
  readJson(DEMO_HISTORY_KEY, createInitialTranslationHistory);
  readJson(DEMO_SAVED_SIGNS_KEY, () => [1, 2, 3, 6]);

  return {
    access_token: `demo-token-${normalizedRole}`,
    token_type: "bearer",
    demo: true,
    user: sessionUser,
  };
}

export function getDemoSessionUser() {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (!token) return null;

  try {
    const raw = sessionStorage.getItem(DEMO_SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...parsed, is_demo: true };
    }
  } catch {
    // Fallback to token hint if session record was missing
  }

  if (token === "demo-token-admin") return startDemoSession("admin").user;
  if (token === "demo-token-user") return startDemoSession("user").user;
  return null;
}

export function clearDemoSession() {
  sessionStorage.removeItem(DEMO_SESSION_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

export function demoLoginWithCredentials({ email }) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  const users = readJson(DEMO_USERS_KEY, createInitialUsers);
  const matched = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (matched) {
    const sessionUser = { ...matched, is_demo: true };
    writeJson(DEMO_SESSION_KEY, sessionUser);
    sessionStorage.setItem(TOKEN_KEY, `demo-token-${sessionUser.role}`);
    return {
      access_token: `demo-token-${sessionUser.role}`,
      token_type: "bearer",
      demo: true,
      user: sessionUser,
    };
  }
  const inferredRole = cleanEmail.includes("admin") ? "admin" : "user";
  return startDemoSession(inferredRole);
}

export function getDemoTranslationHistory() {
  return readJson(DEMO_HISTORY_KEY, createInitialTranslationHistory);
}

export function getDemoSavedSignIds() {
  return readJson(DEMO_SAVED_SIGNS_KEY, () => [1, 2, 3, 6]);
}

export function toggleDemoSavedSign(signId) {
  const current = getDemoSavedSignIds();
  const exists = current.includes(signId);
  const next = exists ? current.filter((id) => id !== signId) : [signId, ...current];
  writeJson(DEMO_SAVED_SIGNS_KEY, next);
  return next;
}

export function getDemoUserDashboardInsights() {
  const history = getDemoTranslationHistory();
  const signs = readJson(DEMO_SIGNS_KEY, createInitialSigns);
  const savedIds = getDemoSavedSignIds();

  return {
    stats: {
      totalTranslations: history.length,
      completedTranslations: history.filter((item) => item.status === "completed").length,
      processingTranslations: history.filter((item) => item.status === "processing").length,
      savedSignsCount: savedIds.length,
      reviewedSignsAvailable: signs.filter((item) => item.status === "reviewed").length,
    },
    learningProgress: [
      {
        id: "greetings",
        label: "Everyday Greetings",
        completed: 4,
        total: 5,
        percent: 80,
      },
      {
        id: "essentials",
        label: "Essential Phrases & Requests",
        completed: 3,
        total: 5,
        percent: 60,
      },
      {
        id: "public-services",
        label: "Clinic & Campus Navigation",
        completed: 2,
        total: 5,
        percent: 40,
      },
    ],
    signs: signs.map((sign) => ({
      ...sign,
      saved: savedIds.includes(sign.id),
    })),
  };
}

export function getDemoAdminAnalyticsSeries() {
  return [
    { day: "Mon", camera: 12, upload: 8, reviewed: 4 },
    { day: "Tue", camera: 16, upload: 11, reviewed: 6 },
    { day: "Wed", camera: 14, upload: 9, reviewed: 5 },
    { day: "Thu", camera: 21, upload: 13, reviewed: 8 },
    { day: "Fri", camera: 18, upload: 15, reviewed: 7 },
    { day: "Sat", camera: 11, upload: 7, reviewed: 3 },
    { day: "Sun", camera: 15, upload: 10, reviewed: 5 },
  ];
}

// --- Admin Demo Store CRUD ---

export function demoGetAllUsers() {
  return readJson(DEMO_USERS_KEY, createInitialUsers);
}

export function demoGetUserById(userId) {
  const users = demoGetAllUsers();
  const found = users.find((u) => String(u.id) === String(userId));
  if (!found) {
    const err = new Error("Demo user not found.");
    err.status = 404;
    throw err;
  }
  return found;
}

export function demoCreateUser(userData) {
  const users = demoGetAllUsers();
  const nextId = users.reduce((max, u) => Math.max(max, Number(u.id) || 0), 100) + 1;
  const created = {
    id: nextId,
    full_name: userData.full_name,
    email: userData.email,
    role: userData.role || "user",
    status: userData.status || "pending",
    is_verified: userData.status === "active",
    google_linked: false,
    created_at: new Date().toISOString(),
  };
  const updatedList = [created, ...users];
  writeJson(DEMO_USERS_KEY, updatedList);
  return created;
}

export function demoUpdateUser(userId, userData) {
  const users = demoGetAllUsers();
  const index = users.findIndex((u) => String(u.id) === String(userId));
  if (index === -1) {
    const err = new Error("Demo user not found.");
    err.status = 404;
    throw err;
  }
  const current = users[index];
  const emailChanged =
    userData.email &&
    userData.email.trim().toLowerCase() !== current.email.trim().toLowerCase();

  const updated = {
    ...current,
    full_name: userData.full_name ?? current.full_name,
    role: userData.role ?? current.role,
    status: userData.status ?? current.status,
    pending_email: emailChanged ? userData.email.trim().toLowerCase() : current.pending_email,
  };
  users[index] = updated;
  writeJson(DEMO_USERS_KEY, users);

  const sessionUser = getDemoSessionUser();
  if (sessionUser && String(sessionUser.id) === String(updated.id)) {
    writeJson(DEMO_SESSION_KEY, { ...updated, is_demo: true });
  }
  return updated;
}

export function demoUpdateUserStatus(userId, status) {
  const users = demoGetAllUsers();
  const index = users.findIndex((u) => String(u.id) === String(userId));
  if (index === -1) {
    const err = new Error("Demo user not found.");
    err.status = 404;
    throw err;
  }
  users[index] = { ...users[index], status };
  writeJson(DEMO_USERS_KEY, users);
  return users[index];
}

export function demoDeleteUser(userId) {
  const users = demoGetAllUsers();
  const filtered = users.filter((u) => String(u.id) !== String(userId));
  writeJson(DEMO_USERS_KEY, filtered);
  return null;
}

export function demoCancelPendingEmail() {
  const sessionUser = getDemoSessionUser();
  if (!sessionUser) return null;
  const users = demoGetAllUsers();
  const index = users.findIndex((u) => String(u.id) === String(sessionUser.id));
  if (index !== -1) {
    const updated = { ...users[index] };
    delete updated.pending_email;
    users[index] = updated;
    writeJson(DEMO_USERS_KEY, users);
    writeJson(DEMO_SESSION_KEY, { ...updated, is_demo: true });
  }
  return { message: "Pending email change cleared in demo session." };
}

export function demoGetDashboardSummary() {
  const users = demoGetAllUsers();
  return {
    total_users: users.length,
    active_users: users.filter((u) => u.status === "active" && u.is_verified).length,
    pending_users: users.filter((u) => u.status === "pending" || !u.is_verified).length,
    admin_users: users.filter((u) => u.role === "admin").length,
  };
}

export function demoGetSystemLogs(limit = 500) {
  const logs = readJson(DEMO_LOGS_KEY, createInitialLogs);
  return logs.slice(0, limit);
}

export function demoGetAllPSLSigns() {
  return readJson(DEMO_SIGNS_KEY, createInitialSigns);
}

export function demoGetPSLSignById(signId) {
  const signs = demoGetAllPSLSigns();
  const found = signs.find((s) => String(s.id) === String(signId));
  if (!found) {
    const err = new Error("Demo PSL sign entry not found.");
    err.status = 404;
    throw err;
  }
  return found;
}

export function demoCreatePSLSign(signData) {
  const signs = demoGetAllPSLSigns();
  const nextId = signs.reduce((max, s) => Math.max(max, Number(s.id) || 0), 0) + 1;
  const now = new Date().toISOString();
  const created = {
    id: nextId,
    word: signData.word,
    description: signData.description || null,
    category: signData.category || "Everyday communication",
    video_url: signData.video_url || null,
    image_url: signData.image_url || null,
    status: signData.status || "draft",
    created_at: now,
    updated_at: now,
  };
  writeJson(DEMO_SIGNS_KEY, [created, ...signs]);
  return created;
}

export function demoUpdatePSLSign(signId, signData) {
  const signs = demoGetAllPSLSigns();
  const index = signs.findIndex((s) => String(s.id) === String(signId));
  if (index === -1) {
    const err = new Error("Demo PSL sign entry not found.");
    err.status = 404;
    throw err;
  }
  const updated = {
    ...signs[index],
    ...signData,
    updated_at: new Date().toISOString(),
  };
  signs[index] = updated;
  writeJson(DEMO_SIGNS_KEY, signs);
  return updated;
}

export function demoDeletePSLSign(signId) {
  const signs = demoGetAllPSLSigns();
  writeJson(
    DEMO_SIGNS_KEY,
    signs.filter((s) => String(s.id) !== String(signId))
  );
  return null;
}

export function demoUploadPSLSignMedia(signId, file, mediaType) {
  const signs = demoGetAllPSLSigns();
  const index = signs.findIndex((s) => String(s.id) === String(signId));
  if (index === -1) return null;
  const field = mediaType === "video" ? "video_url" : "image_url";
  const blobUrl = file ? URL.createObjectURL(file) : null;
  signs[index] = {
    ...signs[index],
    [field]: blobUrl,
    updated_at: new Date().toISOString(),
  };
  writeJson(DEMO_SIGNS_KEY, signs);
  return signs[index];
}

export function demoGetAllKnowledgeArticles() {
  return readJson(DEMO_ARTICLES_KEY, createInitialArticles);
}

export function demoGetKnowledgeArticleById(articleId) {
  const articles = demoGetAllKnowledgeArticles();
  const found = articles.find((a) => String(a.id) === String(articleId));
  if (!found) {
    const err = new Error("Demo knowledge article not found.");
    err.status = 404;
    throw err;
  }
  return found;
}

export function demoCreateKnowledgeArticle(articleData) {
  const articles = demoGetAllKnowledgeArticles();
  const nextId =
    articles.reduce((max, a) => Math.max(max, Number(a.id) || 0), 0) + 1;
  const now = new Date().toISOString();
  const created = {
    id: nextId,
    title: articleData.title,
    content: articleData.content,
    category: articleData.category,
    status: articleData.status || "draft",
    created_at: now,
    updated_at: now,
  };
  writeJson(DEMO_ARTICLES_KEY, [created, ...articles]);
  return created;
}

export function demoUpdateKnowledgeArticle(articleId, articleData) {
  const articles = demoGetAllKnowledgeArticles();
  const index = articles.findIndex((a) => String(a.id) === String(articleId));
  if (index === -1) {
    const err = new Error("Demo knowledge article not found.");
    err.status = 404;
    throw err;
  }
  const updated = {
    ...articles[index],
    ...articleData,
    updated_at: new Date().toISOString(),
  };
  articles[index] = updated;
  writeJson(DEMO_ARTICLES_KEY, articles);
  return updated;
}

export function demoDeleteKnowledgeArticle(articleId) {
  const articles = demoGetAllKnowledgeArticles();
  writeJson(
    DEMO_ARTICLES_KEY,
    articles.filter((a) => String(a.id) !== String(articleId))
  );
  return null;
}

export function demoGetAllProcessingActivities() {
  return readJson(DEMO_ACTIVITY_KEY, createInitialActivity);
}

export function demoGetProcessingActivityById(activityId) {
  const activities = demoGetAllProcessingActivities();
  const found = activities.find((a) => String(a.id) === String(activityId));
  if (!found) {
    const err = new Error("Demo processing activity record not found.");
    err.status = 404;
    throw err;
  }
  return found;
}

export function demoUpdateProcessingActivity(activityId, activityData) {
  const activities = demoGetAllProcessingActivities();
  const index = activities.findIndex((a) => String(a.id) === String(activityId));
  if (index === -1) {
    const err = new Error("Demo processing activity record not found.");
    err.status = 404;
    throw err;
  }
  activities[index] = { ...activities[index], ...activityData };
  writeJson(DEMO_ACTIVITY_KEY, activities);
  return activities[index];
}
