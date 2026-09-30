import type { RequestAction, RequestStatus } from "@/features/requests/types";

export const REQUEST_STATUS_META: Record<RequestStatus, { label: string; className: string }> = {
  waiting_for_review: {
    label: "Waiting for review",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  waiting_for_correction: {
    label: "Returned for correction",
    className: "bg-sky-50 text-sky-700 ring-sky-200",
  },
  approved: { label: "Approved", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  rejected: { label: "Rejected", className: "bg-rose-50 text-rose-700 ring-rose-200" },
};

export const REQUEST_ACTION_META: Record<
  RequestAction,
  {
    title: string;
    confirmLabel: string;
    pendingLabel: string;
    variant: "primary" | "danger";
    description: string;
    success: string;
  }
> = {
  approve: {
    title: "Approve request",
    confirmLabel: "Approve",
    pendingLabel: "Approving…",
    variant: "primary",
    description:
      "An available access code for this course will be assigned to the student and a subscription will start immediately.",
    success: "approved",
  },
  reject: {
    title: "Reject request",
    confirmLabel: "Reject",
    pendingLabel: "Rejecting…",
    variant: "danger",
    description: "The student will not get access to this course. This cannot be undone.",
    success: "rejected",
  },
  return: {
    title: "Return for correction",
    confirmLabel: "Return request",
    pendingLabel: "Returning…",
    variant: "primary",
    description:
      "The student will be asked to fix the request (for example, upload a clearer payment document) and resubmit it.",
    success: "returned for correction",
  },
};
