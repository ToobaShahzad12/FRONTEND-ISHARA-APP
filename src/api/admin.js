import { getAccessToken, logoutUser } from "./auth";
import {
  IS_DEMO_MODE,
  demoCreateKnowledgeArticle,
  demoCreatePSLSign,
  demoCreateUser,
  demoDeleteKnowledgeArticle,
  demoDeletePSLSign,
  demoDeleteUser,
  demoGetAllKnowledgeArticles,
  demoGetAllPSLSigns,
  demoGetAllProcessingActivities,
  demoGetAllUsers,
  demoGetDashboardSummary,
  demoGetKnowledgeArticleById,
  demoGetPSLSignById,
  demoGetProcessingActivityById,
  demoGetSystemLogs,
  demoGetUserById,
  demoUpdateKnowledgeArticle,
  demoUpdatePSLSign,
  demoUpdateProcessingActivity,
  demoUpdateUser,
  demoUpdateUserStatus,
  demoUploadPSLSignMedia,
} from "./demoStore";

const API_BASE_URL = "https://slicing-defrost-pacemaker.ngrok-free.dev";

async function adminRequest(endpoint, options = {}) {
  const token = getAccessToken();

  if (!token) {
    const error = new Error("Your session has expired. Please log in again.");
    error.status = 401;
    throw error;
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      "Cannot connect to ISHARA AI. Please check that the backend is running."
    );
  }

  if (response.status === 401) {
    logoutUser();
    window.dispatchEvent(new Event("ishara:session-expired"));
  }

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data.detail;
    const message = Array.isArray(detail)
      ? detail.map((item) => item?.msg).filter(Boolean).join(" ")
      : typeof detail === "string"
        ? detail
        : response.status === 401
          ? "Your session has expired. Please log in again."
          : "Admin request failed. Please try again.";
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}

export function getAllUsers() {
  if (IS_DEMO_MODE) return Promise.resolve(demoGetAllUsers());
  return adminRequest("/api/admin/users");
}

export function getUserById(userId) {
  if (IS_DEMO_MODE) return Promise.resolve(demoGetUserById(userId));
  return adminRequest(`/api/admin/users/${encodeURIComponent(userId)}`);
}

export function updateUser(userId, userData) {
  if (IS_DEMO_MODE) return Promise.resolve(demoUpdateUser(userId, userData));
  return adminRequest(`/api/admin/users/${encodeURIComponent(userId)}`, {
    method: "PUT",
    body: JSON.stringify(userData),
  });
}

export function updateUserStatus(userId, status) {
  if (IS_DEMO_MODE) return Promise.resolve(demoUpdateUserStatus(userId, status));
  return adminRequest(`/api/admin/users/${encodeURIComponent(userId)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function deleteUser(userId) {
  if (IS_DEMO_MODE) return Promise.resolve(demoDeleteUser(userId));
  return adminRequest(`/api/admin/users/${encodeURIComponent(userId)}`, {
    method: "DELETE",
  });
}

export function resendUserPendingEmailConfirmation(userId) {
  if (IS_DEMO_MODE) {
    return Promise.resolve({
      demo: true,
      message: "Demo Mode active: Pending email confirmation simulated locally.",
    });
  }
  return adminRequest(
    `/api/admin/users/${encodeURIComponent(userId)}/pending-email/resend`,
    { method: "POST" }
  );
}

export function getDashboardSummary() {
  if (IS_DEMO_MODE) return Promise.resolve(demoGetDashboardSummary());
  return adminRequest("/api/admin/dashboard/summary");
}
export function getSystemLogs(limit = 500) {
  if (IS_DEMO_MODE) return Promise.resolve(demoGetSystemLogs(limit));
  return adminRequest(
    `/api/admin/system-logs?limit=${encodeURIComponent(limit)}`
  );
}

export function createUser(userData) {
  if (IS_DEMO_MODE) return Promise.resolve(demoCreateUser(userData));
  return adminRequest("/api/admin/users", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}
// PSL Dictionary API

export function getAllPSLSigns() {
  if (IS_DEMO_MODE) return Promise.resolve(demoGetAllPSLSigns());
  return adminRequest("/api/admin/psl-dictionary");
}

export function getPSLSignById(signId) {
  if (IS_DEMO_MODE) return Promise.resolve(demoGetPSLSignById(signId));
  return adminRequest(`/api/admin/psl-dictionary/${encodeURIComponent(signId)}`);
}

export function createPSLSign(signData) {
  if (IS_DEMO_MODE) return Promise.resolve(demoCreatePSLSign(signData));
  return adminRequest("/api/admin/psl-dictionary", {
    method: "POST",
    body: JSON.stringify(signData),
  });
}

export function updatePSLSign(signId, signData) {
  if (IS_DEMO_MODE) return Promise.resolve(demoUpdatePSLSign(signId, signData));
  return adminRequest(`/api/admin/psl-dictionary/${encodeURIComponent(signId)}`, {
    method: "PUT",
    body: JSON.stringify(signData),
  });
}

export function deletePSLSign(signId) {
  if (IS_DEMO_MODE) return Promise.resolve(demoDeletePSLSign(signId));
  return adminRequest(`/api/admin/psl-dictionary/${encodeURIComponent(signId)}`, {
    method: "DELETE",
  });
}

export async function uploadPSLSignMedia(signId, file, mediaType) {
  if (IS_DEMO_MODE) {
    return demoUploadPSLSignMedia(signId, file, mediaType);
  }

  const token = getAccessToken();

  if (!token) {
    const error = new Error("Your session has expired. Please log in again.");
    error.status = 401;
    throw error;
  }

  const formData = new FormData();
  formData.append("file", file);

  let response;

  try {
    response = await fetch(
      `${API_BASE_URL}/api/admin/psl-dictionary/${encodeURIComponent(signId)}/media?media_type=${encodeURIComponent(mediaType)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );
  } catch {
    throw new Error(
      "Cannot connect to ISHARA AI. Please check that the backend is running."
    );
  }

  if (response.status === 401) {
    logoutUser();
    window.dispatchEvent(new Event("ishara:session-expired"));
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail = data.detail;
    const message = Array.isArray(detail)
      ? detail.map((item) => item?.msg).filter(Boolean).join(" ")
      : typeof detail === "string"
        ? detail
        : "Media upload failed. Please try again.";

    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}

// Knowledge Base API

export function getAllKnowledgeArticles() {
  if (IS_DEMO_MODE) return Promise.resolve(demoGetAllKnowledgeArticles());
  return adminRequest("/api/admin/knowledge-base");
}

export function getKnowledgeArticleById(articleId) {
  if (IS_DEMO_MODE) return Promise.resolve(demoGetKnowledgeArticleById(articleId));
  return adminRequest(
    `/api/admin/knowledge-base/${encodeURIComponent(articleId)}`
  );
}

export function createKnowledgeArticle(articleData) {
  if (IS_DEMO_MODE) return Promise.resolve(demoCreateKnowledgeArticle(articleData));
  return adminRequest("/api/admin/knowledge-base", {
    method: "POST",
    body: JSON.stringify(articleData),
  });
}

export function updateKnowledgeArticle(articleId, articleData) {
  if (IS_DEMO_MODE) {
    return Promise.resolve(demoUpdateKnowledgeArticle(articleId, articleData));
  }
  return adminRequest(
    `/api/admin/knowledge-base/${encodeURIComponent(articleId)}`,
    {
      method: "PUT",
      body: JSON.stringify(articleData),
    }
  );
}

export function deleteKnowledgeArticle(articleId) {
  if (IS_DEMO_MODE) return Promise.resolve(demoDeleteKnowledgeArticle(articleId));
  return adminRequest(
    `/api/admin/knowledge-base/${encodeURIComponent(articleId)}`,
    {
      method: "DELETE",
    }
  );
}
// ==============================
// Processing Activity API
// ==============================

export function getAllProcessingActivities() {
  if (IS_DEMO_MODE) return Promise.resolve(demoGetAllProcessingActivities());
  return adminRequest("/api/admin/processing-activity");
}

export function getProcessingActivityById(activityId) {
  if (IS_DEMO_MODE) {
    return Promise.resolve(demoGetProcessingActivityById(activityId));
  }
  return adminRequest(
    `/api/admin/processing-activity/${encodeURIComponent(activityId)}`
  );
}

export function updateProcessingActivity(activityId, activityData) {
  if (IS_DEMO_MODE) {
    return Promise.resolve(demoUpdateProcessingActivity(activityId, activityData));
  }
  return adminRequest(
    `/api/admin/processing-activity/${encodeURIComponent(activityId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(activityData),
    }
  );
}
