import { apiFetch } from "@/lib/api";
import { buildMockUserDetails } from "@/features/users/mock-details";
import type {
  ApiResponse,
  CreateAdminInput,
  UpdateUserInput,
  User,
  UserDetails,
  UsersListResult,
  UsersQuery,
} from "@/features/users/types";

export const USER_DETAILS_IS_MOCK = true;

// TODO: replace with apiFetch(`/users/${id}/details`) once the server endpoint exists.
export async function fetchUserDetails(id: string, knownUser?: User): Promise<UserDetails> {
  await new Promise((resolve) => window.setTimeout(resolve, 300));
  return buildMockUserDetails(id, knownUser);
}

export async function fetchUsers(query: UsersQuery) {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(query.limit),
  });

  if (query.role) params.set("role", query.role);
  if (query.status) params.set("status", query.status);
  if (query.search) params.set("search", query.search);

  const response = await apiFetch<ApiResponse<UsersListResult>>(
    `/users?${params.toString()}`
  );
  return response.data;
}

export async function createAdmin(input: CreateAdminInput) {
  const response = await apiFetch<ApiResponse<User>>("/users/register/admin", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.data;
}

export async function updateUser(id: string, input: UpdateUserInput) {
  const response = await apiFetch<ApiResponse<User>>(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return response.data;
}

export async function deleteUser(id: string) {
  const response = await apiFetch<ApiResponse<User>>(`/users/${id}`, {
    method: "DELETE",
  });
  return response.data;
}

export async function blockUser(id: string) {
  const response = await apiFetch<ApiResponse<User>>(`/users/${id}/block`, {
    method: "PATCH",
  });
  return response.data;
}

export async function unblockUser(id: string) {
  const response = await apiFetch<ApiResponse<User>>(`/users/${id}/unblock`, {
    method: "PATCH",
  });
  return response.data;
}
