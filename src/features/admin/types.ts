export type UserRole = "admin" | "instructor" | "student";

export type AdminUser = {
  _id: string;
  email: string;
  username: string;
  fullname: string;
  role: UserRole;
  image?: string | null;
  avatar?: string | null;
  profileImage?: string | null;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginResponse = {
  data: {
    token: string;
    user: AdminUser;
  };
};

export function getUserImageUrl(user: AdminUser | null | undefined): string | null {
  if (!user) return null;
  return user.image || user.avatar || user.profileImage || null;
}
