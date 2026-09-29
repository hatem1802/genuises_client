import type { AdminUser } from "@/features/admin/types";

const ADMIN_TOKEN_KEY = "adminToken";
const ADMIN_USER_KEY = "adminUser";

export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function getAdminUser(): AdminUser | null {
  const raw = localStorage.getItem(ADMIN_USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AdminUser;
  } catch {
    localStorage.removeItem(ADMIN_USER_KEY);
    return null;
  }
}

export function setAdminUser(user: AdminUser): void {
  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
}

export function clearAdminUser(): void {
  localStorage.removeItem(ADMIN_USER_KEY);
}

export function clearAdminSession(): void {
  clearAdminToken();
  clearAdminUser();
}

export function isAdminAuthenticated(): boolean {
  return Boolean(getAdminToken());
}
