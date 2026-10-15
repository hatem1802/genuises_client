import type { UserRole } from "@/features/admin/types";

export type UserStatus = "approved" | "waiting_approval" | "rejected" | "blocked";

export const USER_ROLES: UserRole[] = ["admin", "instructor", "student"];

export const USER_STATUSES: UserStatus[] = [
  "approved",
  "waiting_approval",
  "rejected",
  "blocked",
];

export type User = {
  _id: string;
  email: string;
  username: string;
  fullname: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UsersQuery = {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
  page: number;
  limit: number;
};

export type Pagination = {
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type UsersListResult = {
  users: User[];
  pagination: Pagination;
};

export type { ApiResponse } from "@/lib/api";

export type CreateAdminInput = {
  email: string;
  password: string;
  username: string;
  fullname: string;
};

export type CourseStatus = "waiting" | "published" | "draft";

export type UpdateUserInput = Partial<{
  email: string;
  password: string;
  username: string;
  fullname: string;
  role: UserRole;
  status: UserStatus;
}>;
