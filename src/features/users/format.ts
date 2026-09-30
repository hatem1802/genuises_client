import type { UserRole } from "@/features/admin/types";
import type { UserStatus } from "@/features/users/types";

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  instructor: "Instructor",
  student: "Student",
};

const STATUS_LABELS: Record<UserStatus, string> = {
  approved: "Approved",
  waiting_approval: "Waiting approval",
  rejected: "Rejected",
  blocked: "Blocked",
};

export const ROLE_BADGE_CLASSES: Record<UserRole, string> = {
  admin: "bg-violet-50 text-violet-700 ring-violet-200",
  instructor: "bg-sky-50 text-sky-700 ring-sky-200",
  student: "bg-slate-50 text-slate-700 ring-slate-200",
};

export const STATUS_BADGE_CLASSES: Record<UserStatus, string> = {
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  waiting_approval: "bg-amber-50 text-amber-700 ring-amber-200",
  rejected: "bg-rose-50 text-rose-700 ring-rose-200",
  blocked: "bg-red-50 text-red-700 ring-red-200",
};

export function formatRole(role: UserRole) {
  return ROLE_LABELS[role] ?? role;
}

export function formatStatus(status: UserStatus) {
  return STATUS_LABELS[status] ?? status;
}

export function formatDate(value: string | null) {
  if (!value) return "Never";
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
