import type { CourseStatusAction } from "@/features/courses/types";
import type { CourseStatus } from "@/features/users/types";

export const COURSE_STATUSES: CourseStatus[] = ["published", "waiting", "draft"];

export const COURSE_STATUS_META: Record<CourseStatus, { label: string; className: string }> = {
  published: { label: "Published", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  waiting: { label: "Waiting review", className: "bg-amber-50 text-amber-700 ring-amber-200" },
  draft: { label: "Draft", className: "bg-slate-100 text-slate-600 ring-slate-200" },
};

export const COURSE_STATUS_ACTION: Record<CourseStatus, CourseStatusAction | null> = {
  waiting: "publish",
  published: "unpublish",
  draft: null,
};

export const COURSE_STATUS_ACTION_META: Record<
  CourseStatusAction,
  {
    label: string;
    title: string;
    confirmLabel: string;
    pendingLabel: string;
    variant: "primary" | "danger";
    description: string;
    success: string;
    buttonClassName: string;
  }
> = {
  publish: {
    label: "Approve",
    title: "Approve and publish course",
    confirmLabel: "Publish course",
    pendingLabel: "Publishing…",
    variant: "primary",
    description:
      "The course will be published and appear in the public course list, so students can request to join it.",
    success: "approved and published",
    buttonClassName: "border-emerald-300 text-emerald-700 hover:bg-emerald-50",
  },
  unpublish: {
    label: "Unpublish",
    title: "Unpublish course",
    confirmLabel: "Move to drafts",
    pendingLabel: "Unpublishing…",
    variant: "danger",
    description:
      "The course will be moved to drafts and hidden from the public course list. A draft course cannot be published again from the dashboard.",
    success: "moved to drafts",
    buttonClassName: "border-rose-300 text-rose-700 hover:bg-rose-50",
  },
};

export const formatPrice = (value: number) =>
  value === 0 ? "Free" : `${value.toLocaleString("en-US")} EGP`;
