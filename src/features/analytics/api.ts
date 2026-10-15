import { apiFetch, type ApiResponse } from "@/lib/api";
import type { PlatformOverview } from "@/features/analytics/types";

export async function fetchPlatformOverview() {
  const response = await apiFetch<ApiResponse<PlatformOverview>>("/analytics/overview");
  return response.data;
}
