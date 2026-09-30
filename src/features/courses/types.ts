import type { CourseStatus, Pagination } from "@/features/users/types";

export type QuizQuestionDraft = {
  id: string;
  question: string;
  choices: string[];
  correctIndex: number | null;
  points: number | "";
};

export type QuizDraft = {
  id: string;
  title: string;
  questions: QuizQuestionDraft[];
};

export type LectureSource = "none" | "link" | "file";

export type LectureDraft = {
  id: string;
  title: string;
  source: LectureSource;
  lectureLink: string;
  file: File | null;
  quizzes: QuizDraft[];
};

export type CourseDraft = {
  title: string;
  description: string;
  instructorId: string;
  price: number | "";
  durationDays: number | "";
  certificateTemplate: string;
  lectures: LectureDraft[];
  fullQuiz: QuizDraft | null;
};

export type CourseStatusAction = "publish" | "unpublish";

export type Course = {
  _id: string;
  instructorId: string;
  title: string;
  description: string;
  price: number;
  durationDays: number;
  lectures: { _id: string; title: string; lectureLink: string | null }[];
  certificateTemplate: string | null;
  status: CourseStatus;
  createdAt: string;
  updatedAt: string;
};

export type QuizQuestion = {
  _id: string;
  question: string;
  choices: string[];
  correctAnswer?: string;
  points: number;
};

export type Quiz = {
  _id: string;
  title: string;
  questions: QuizQuestion[];
};

export type QuizSummary = {
  _id: string;
  title: string;
  questionsCount: number;
};

export type CourseStats = {
  totalStudents: number;
  activeStudents: number;
  accessCodes: { total: number; available: number; used: number };
  pendingRequests: number;
};

export type AdminCourse = {
  _id: string;
  title: string;
  description: string;
  price: number;
  durationDays: number;
  status: CourseStatus;
  certificateTemplate: string | null;
  createdAt: string;
  updatedAt: string;
  lectures: { _id: string; title: string; lectureLink: string | null; quizzes: Quiz[] }[];
  fullQuiz: Quiz | null;
  instructor: { _id: string; fullname: string; username: string; email: string } | null;
  stats: CourseStats;
};

export type AdminCoursesQuery = {
  search?: string;
  status?: CourseStatus;
  instructorId?: string;
  page: number;
  limit: number;
};

export type AdminCoursesResult = {
  courses: AdminCourse[];
  pagination: Pagination;
};

export type CourseStructure = {
  _id: string;
  title: string;
  description: string;
  price: number;
  durationDays: number;
  status: CourseStatus;
  instructor: { _id: string; fullname: string } | null;
  lecturesCount: number;
  lectures: { _id: string; title: string; quizzes: QuizSummary[] }[];
  fullQuiz: QuizSummary | null;
  hasCertificate: boolean;
};

export type LectureDetails = {
  courseId: string;
  courseTitle: string;
  lecture: {
    _id: string;
    title: string;
    lectureLink: string | null;
    order: number;
    quizzes: (QuizSummary & { questions: QuizQuestion[] })[];
  };
};
