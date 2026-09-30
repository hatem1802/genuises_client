export type AccessCode = {
  _id: string;
  code: string;
  courseId: string;
  studentId: string | null;
  status: "available" | "used";
  createdAt: string;
};

export type AccessCodeBatch = {
  id: string;
  courseId: string;
  courseTitle: string | null;
  createdAt: string;
  codes: string[];
};
