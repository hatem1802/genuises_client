import type { SubscriptionAction, SubscriptionStatus } from "@/features/subscriptions/types";

export const SUBSCRIPTION_STATUSES: SubscriptionStatus[] = ["active", "expired", "cancelled"];

export const SUBSCRIPTION_STATUS_META: Record<
  SubscriptionStatus,
  { label: string; className: string }
> = {
  active: { label: "Active", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  expired: { label: "Expired", className: "bg-slate-100 text-slate-600 ring-slate-200" },
  cancelled: { label: "Cancelled", className: "bg-rose-50 text-rose-700 ring-rose-200" },
};

export const SUBSCRIPTION_ACTION_META: Record<
  SubscriptionAction,
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
  cancel: {
    label: "Cancel",
    title: "Cancel subscription",
    confirmLabel: "Cancel subscription",
    pendingLabel: "Cancelling…",
    variant: "danger",
    description: "The student loses access to this course immediately.",
    success: "cancelled",
    buttonClassName: "border-rose-300 text-rose-700 hover:bg-rose-50",
  },
  reactivate: {
    label: "Reactivate",
    title: "Reactivate subscription",
    confirmLabel: "Reactivate",
    pendingLabel: "Reactivating…",
    variant: "primary",
    description:
      "Access is restored until the original end date. This fails if that date has already passed.",
    success: "reactivated",
    buttonClassName: "border-emerald-300 text-emerald-700 hover:bg-emerald-50",
  },
};

export function subscriptionActionFor(status: SubscriptionStatus): SubscriptionAction | null {
  if (status === "active") return "cancel";
  if (status === "cancelled") return "reactivate";
  return null;
}

export const formatDay = (value: string) =>
  new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
