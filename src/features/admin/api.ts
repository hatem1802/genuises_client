import { apiFetch } from "@/lib/api";
import type { LoginCredentials, LoginResponse } from "@/features/admin/types";

export async function loginAdmin(credentials: LoginCredentials) {
  const response = await apiFetch<LoginResponse>("/users/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  if (response.data.user.role !== "admin") {
    throw new Error("Access denied. Admin credentials required.");
  }

  return response.data;
}
