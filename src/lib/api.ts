import { API_URL } from "@/lib/env";
import { getAdminToken } from "@/lib/auth";
import { endSession, type SessionEndReason } from "@/lib/session";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export type ApiResponse<T> = {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
};

function extractErrorMessage(status: number, body: unknown) {
  if (body && typeof body === "object" && "message" in body) {
    const { message } = body as { message?: unknown };
    if (typeof message === "string" && message) return message;
  }
  return `API error: ${status}`;
}

const UNAUTHORIZED_MESSAGE = "You are not allowed to perform this action.";

const SESSION_END_MESSAGES: Record<SessionEndReason, string> = {
  expired: "Your session has expired. Please sign in again.",
  unapproved: "Your account is no longer approved.",
};

function resolveAuthError(path: string, status: number, message: string, sentToken: boolean) {
  if (path === "/users/login") return message;

  if (status === 401 && sentToken) {
    const reason: SessionEndReason = message === "User no longer exists" ? "unapproved" : "expired";
    endSession(reason);
    return SESSION_END_MESSAGES[reason];
  }

  if (status === 403 && message === "Account is not approved") {
    endSession("unapproved");
    return SESSION_END_MESSAGES.unapproved;
  }

  if (
    status === 403 &&
    (message === "Forbidden" || message === "Not allowed to access this user")
  ) {
    return UNAUTHORIZED_MESSAGE;
  }

  return message;
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const token = getAdminToken();
  const headers = new Headers(init?.headers);

  if (!headers.has("Content-Type") && !(init?.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      // ignore JSON parse failures
    }
    throw new ApiError(
      response.status,
      resolveAuthError(path, response.status, extractErrorMessage(response.status, body), Boolean(token))
    );
  }

  return response.json() as Promise<T>;
}

type UploadOptions = {
  method?: "POST" | "PUT" | "PATCH";
  onProgress?: (percent: number) => void;
};

// fetch() cannot report upload progress, so multipart uploads go through XMLHttpRequest.
export function apiUpload<T>(
  path: string,
  body: FormData,
  { method = "POST", onProgress }: UploadOptions = {}
): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, `${API_URL}${path}`);

    const token = getAdminToken();
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      let parsed: unknown = null;
      try {
        parsed = JSON.parse(xhr.responseText);
      } catch {
        // ignore JSON parse failures
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(parsed as T);
      } else {
        reject(
          new ApiError(
            xhr.status,
            resolveAuthError(path, xhr.status, extractErrorMessage(xhr.status, parsed), Boolean(token))
          )
        );
      }
    };

    xhr.onerror = () => reject(new ApiError(0, "Network error. Is the server running?"));
    xhr.send(body);
  });
}
