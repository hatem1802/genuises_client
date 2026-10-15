import type { Pagination } from "@/features/users/types";
import type { CourseStatus } from "@/features/users/types";
import type { SubscriptionStatus } from "@/features/subscriptions/types";

export type AccessCodeStatus = "available" | "used";

export type GeneratedAccessCode = {
  _id: string;
  code: string;
  courseId: string;
  status: AccessCodeStatus;
  createdAt: string;
};

export type ListedAccessCode = {
  _id: string;
  code: string;
  status: AccessCodeStatus;
  course: {
    _id: string;
    title: string;
    status: CourseStatus;
    price: number;
  } | null;
  student: {
    _id: string;
    fullname: string;
    username: string;
    email: string;
  } | null;
  subscription: {
    _id: string;
    status: SubscriptionStatus;
    startAt: string;
    endAt: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type AccessCodesQuery = {
  status?: AccessCodeStatus;
  courseId?: string;
  studentId?: string;
  search?: string;
  page: number;
  limit: number;
};

export type AccessCodesResult = {
  summary: { total: number; available: number; used: number };
  codes: ListedAccessCode[];
  pagination: Pagination;
};
