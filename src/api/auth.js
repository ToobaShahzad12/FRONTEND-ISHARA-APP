
import {
  IS_DEMO_MODE,
  clearDemoSession,
  demoCancelPendingEmail,
  demoLoginWithCredentials,
  getDemoSessionUser,
  startDemoSession,
} from "./demoStore";

const API_BASE_URL = "https://slicing-defrost-pacemaker.ngrok-free.dev";
const TOKEN_KEY = "ishara_access_token";

function getApiErrorMessage(detail, fallback) {
  if (typeof detail === "string" && detail.trim()) return detail;

  if (Array.isArray(detail)) {
    const messages = detail.map((item) => {
      if (typeof item === "string") return item;
      if (!item || typeof item !== "object" || typeof item.msg !== "string") {
        return "";
      }

      const location = Array.isArray(item.loc)
        ? item.loc.filter((part) => part !== "body").join(" → ")
        : "";
      return location ? `${location}: ${item.msg}` : item.msg;
    }).filter(Boolean);

    if (messages.length) return messages.join(" ");
  }

  if (detail && typeof detail === "object" && typeof detail.message === "string") {
    return detail.message;
  }

  return fallback;
}

function makeApiError(response, data, fallback) {
  const error = new Error(getApiErrorMessage(data.detail, fallback));
  error.status = response.status;
  return error;
}

async function sendAuthRequest(endpoint, payload) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    const error = new Error("Cannot connect to ISHARA AI. Please check your connection and try again.");
    error.code = "NETWORK";
    throw error;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw makeApiError(response, data, "The request failed. Please try again.");
  }

  return data;
}

// Temporary frontend-only Demo Mode login helper (not real authentication)
export async function loginDemoRole(role) {
  return startDemoSession(role);
}

// Create a new account
export function signupUser({ full_name, email, password }) {
  if (IS_DEMO_MODE) {
    return Promise.resolve({
      demo: true,
      message:
        "Demo Mode active: Backend registration is disabled. No real account was created or verification email sent—return to Sign in and choose Continue as Demo User or Continue as Demo Admin.",
    });
  }

  return sendAuthRequest("/api/auth/signup", {
    full_name,
    email,
    password,
  });
}

// Verify email using the token from the email link
export function verifyEmail(token) {
  if (IS_DEMO_MODE) {
    return Promise.resolve({
      demo: true,
      message:
        "Demo Mode active: Email verification is simulated locally (not real verification).",
    });
  }

  return sendAuthRequest("/api/auth/verify-email", {
    token,
  });
}

// Login with email and password
export async function loginUser({ email, password }) {
  if (IS_DEMO_MODE) {
    return demoLoginWithCredentials({ email });
  }

  const data = await sendAuthRequest("/api/auth/login", {
    email,
    password,
  });

  if (data.access_token) {
    sessionStorage.setItem(TOKEN_KEY, data.access_token);
  }

  return data;
}

// Exchange a Google ID token for the same ISHARA application session used by email login.
export async function googleLogin(credential) {
  if (IS_DEMO_MODE) {
    return startDemoSession("user");
  }

  const data = await sendAuthRequest("/api/auth/google", { credential });

  if (data.access_token) {
    sessionStorage.setItem(TOKEN_KEY, data.access_token);
  }

  return data;
}

export function createGoogleAuthChallenge() {
  if (IS_DEMO_MODE) {
    return Promise.resolve({ nonce: "demo-nonce", demo: true });
  }

  return sendAuthRequest("/api/auth/google/challenge", {});
}

// Request password reset email
export function forgotPassword(email) {
  if (IS_DEMO_MODE) {
    return Promise.resolve({
      demo: true,
      message:
        "Demo Mode active: Password reset emails are disabled. Use Continue as Demo User or Continue as Demo Admin on the sign-in page.",
    });
  }

  return sendAuthRequest("/api/auth/forgot-password", {
    email,
  });
}

// Set a new password using reset token
export function resetPassword({ token, new_password }) {
  if (IS_DEMO_MODE) {
    return Promise.resolve({
      demo: true,
      message:
        "Demo Mode active: Password reset was simulated locally (not real authentication).",
    });
  }

  return sendAuthRequest("/api/auth/reset-password", {
    token,
    new_password,
  });
}

export function getAccessToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function logoutUser() {
  if (IS_DEMO_MODE) {
    clearDemoSession();
    return;
  }

  sessionStorage.removeItem(TOKEN_KEY);
}

// Get currently authenticated user
export async function getCurrentUser() {
  if (IS_DEMO_MODE) {
    return getDemoSessionUser();
  }

  const token = getAccessToken();

  if (!token) {
    return null;
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new Error(
      "Cannot connect to ISHARA AI. Please check that the backend is running."
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      logoutUser();
      return null;
    }

    throw makeApiError(response, data, "Unable to verify your session.");
  }

  return data;
}

async function sendAuthenticatedRequest(endpoint, method, payload) {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Your session has expired. Please log in again.");
  }

  let response;

  try {
    const headers = { Authorization: `Bearer ${token}` };
    const options = { method, headers };
    if (payload !== undefined) {
      headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(payload);
    }
    response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  } catch {
    throw new Error(
      "Cannot connect to ISHARA AI. Please check that the backend is running."
    );
  }

  if (response.status === 401) {
    logoutUser();
    window.dispatchEvent(new Event("ishara:session-expired"));
  }

  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw makeApiError(response, data, "The request failed. Please try again.");
  }

  return data;
}

export function resendMyPendingEmailConfirmation() {
  if (IS_DEMO_MODE) {
    return Promise.resolve({
      demo: true,
      message: "Demo Mode active: Confirmation email simulated locally.",
    });
  }

  return sendAuthenticatedRequest("/api/auth/me/pending-email/resend", "POST");
}

export function cancelMyPendingEmailChange() {
  if (IS_DEMO_MODE) {
    return Promise.resolve(demoCancelPendingEmail());
  }

  return sendAuthenticatedRequest("/api/auth/me/pending-email", "DELETE");
}

export function linkGoogleAccount(credential) {
  if (IS_DEMO_MODE) {
    return Promise.resolve({
      demo: true,
      message: "Demo Mode active: Google account linking is disabled in frontend demo mode.",
    });
  }

  return sendAuthenticatedRequest("/api/auth/google/link", "POST", { credential });
}
