import { apiFetch, type ApiResponse } from "@/lib/api";
import { API_ORIGIN } from "@/lib/env";
import type {
  EnrollmentRequest,
  RequestAction,
  RequestStatus,
} from "@/features/requests/types";

export async function fetchRequests(status?: RequestStatus) {
  const query = status ? `?status=${status}` : "";
  const response = await apiFetch<ApiResponse<EnrollmentRequest[]>>(`/requests${query}`);
  return response.data;
}

export async function runRequestAction(id: string, action: RequestAction) {
  const response = await apiFetch<ApiResponse<EnrollmentRequest>>(
    `/requests/${id}/${action}`,
    { method: "PATCH" }
  );
  return response.data;
}

export function getPaymentDocUrl(paymentDoc: string) {
  return `${API_ORIGIN}/uploads/${paymentDoc}`;
}
