import { ApiError, apiFetch } from "@/lib/api";
import type {
  ApiResponse,
  CreateAdminInput,
  UpdateUserInput,
  User,
  UsersListResult,
  UsersQuery,
} from "@/features/users/types";

export async function fetchUserById(id: string) {
  let page = 1;

  for (;;) {
    const result = await fetchUsers({ page, limit: 100 });
    const user = result.users.find((item) => item._id === id);
    if (user) return user;
    if (page >= result.pagination.pages) break;
    page += 1;
  }

  throw new ApiError(404, "User not found");
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
