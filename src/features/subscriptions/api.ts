import { apiFetch, type ApiResponse } from "@/lib/api";
import type {
  Subscription,
  SubscriptionAction,
  SubscriptionsQuery,
  SubscriptionsResult,
} from "@/features/subscriptions/types";

export async function fetchSubscriptions(query: SubscriptionsQuery) {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(query.limit),
  });

  if (query.status) params.set("status", query.status);
  if (query.studentId) params.set("studentId", query.studentId);
  if (query.courseId) params.set("courseId", query.courseId);
  if (query.instructorId) params.set("instructorId", query.instructorId);

  const response = await apiFetch<ApiResponse<SubscriptionsResult>>(
    `/subscriptions?${params.toString()}`
  );
  return response.data;
}

export async function runSubscriptionAction(id: string, action: SubscriptionAction) {
  const response = await apiFetch<ApiResponse<Subscription>>(`/subscriptions/${id}/${action}`, {
    method: "PATCH",
  });
  return response.data;
}
