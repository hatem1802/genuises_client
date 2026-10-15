import type { CourseStatus, Pagination } from "@/features/users/types";

export type SubscriptionStatus = "active" | "expired" | "cancelled";

export type SubscriptionAction = "cancel" | "reactivate";

export type SubscriptionPerson = {
  _id: string | null;
  fullname: string | null;
  username?: string | null;
  email?: string | null;
};

export type Subscription = {
  _id: string;
  status: SubscriptionStatus;
  isActive: boolean;
  startAt: string;
  endAt: string;
  durationDays: number;
  createdAt: string;
  progress: {
    totalLectures: number;
    completedLectures: number;
    completedQuizzes: number;
    percentage: number;
  };
  student: SubscriptionPerson;
  course: {
    _id: string;
    title: string;
    price: number;
    status: CourseStatus;
  };
  instructor: SubscriptionPerson;
  accessCode: { _id: string; code: string };
};

export type SubscriptionsQuery = {
  status?: SubscriptionStatus;
  studentId?: string;
  courseId?: string;
  instructorId?: string;
  page: number;
  limit: number;
};

export type SubscriptionsResult = {
  subscriptions: Subscription[];
  pagination: Pagination;
};
