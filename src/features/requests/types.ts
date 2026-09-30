export type RequestStatus =
  | "waiting_for_review"
  | "waiting_for_correction"
  | "approved"
  | "rejected";

export const REQUEST_STATUSES: RequestStatus[] = [
  "waiting_for_review",
  "waiting_for_correction",
  "approved",
  "rejected",
];

export type EnrollmentRequest = {
  _id: string;
  studentId: {
    _id: string;
    email: string;
    username: string;
    fullname: string;
    role: string;
    status: string;
  } | null;
  courseId: {
    _id: string;
    title: string;
    price: number;
    durationDays: number;
  } | null;
  paymentDoc: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
};

export type RequestAction = "approve" | "reject" | "return";
