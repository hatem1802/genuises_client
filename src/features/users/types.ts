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

export type SubscriptionStatus = "active" | "expired" | "cancelled";

export type CourseStatus = "waiting" | "published" | "draft";

export type StudentSubscription = {
  _id: string;
  status: SubscriptionStatus;
  startAt: string;
  endAt: string;
  durationDays: number;
  course: {
    _id: string;
    title: string;
    price: number;
    durationDays: number;
    lecturesCount: number;
    instructor: { _id: string; fullname: string } | null;
  } | null;
  progress: {
    percentage: number;
    completedLectures: number;
    totalLectures: number;
    completedQuizzes: { quizTitle: string; score: number }[];
    certificate: { issued: boolean; url: string | null };
  };
};

export type StudentDetails = {
  stats: {
    totalSubscriptions: number;
    activeSubscriptions: number;
    averageProgress: number;
    certificatesIssued: number;
  };
  subscriptions: StudentSubscription[];
};

export type InstructorCourse = {
  _id: string;
  title: string;
  status: CourseStatus;
  price: number;
  durationDays: number;
  lecturesCount: number;
  createdAt: string;
  studentsCount: number;
  activeStudentsCount: number;
  averageProgress: number;
  accessCodes: { total: number; used: number; available: number };
};

export type InstructorDetails = {
  stats: {
    totalCourses: number;
    publishedCourses: number;
    totalStudents: number;
    activeStudents: number;
  };
  courses: InstructorCourse[];
};

export type UserDetails = {
  user: User;
  student?: StudentDetails;
  instructor?: InstructorDetails;
};

export type UpdateUserInput = Partial<{
  email: string;
  password: string;
  username: string;
  fullname: string;
  role: UserRole;
  status: UserStatus;
}>;
