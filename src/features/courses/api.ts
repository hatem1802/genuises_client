import { apiFetch, apiUpload, type ApiResponse } from "@/lib/api";
import { buildCourseFormData } from "@/features/courses/drafts";
import type {
  AdminCoursesQuery,
  AdminCoursesResult,
  Course,
  CourseDraft,
  CourseStatusAction,
  CourseStructure,
  LectureDetails,
} from "@/features/courses/types";
import { fetchUsers } from "@/features/users/api";

export async function fetchAdminCourses(query: AdminCoursesQuery) {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(query.limit),
  });

  if (query.search) params.set("search", query.search);
  if (query.status) params.set("status", query.status);
  if (query.instructorId) params.set("instructorId", query.instructorId);

  const response = await apiFetch<ApiResponse<AdminCoursesResult>>(
    `/cources/admin?${params.toString()}`
  );
  return response.data;
}

export async function fetchCourseStructure(id: string) {
  const response = await apiFetch<ApiResponse<CourseStructure>>(`/cources/${id}`);
  return response.data;
}

export async function fetchLectureDetails(courseId: string, lectureId: string) {
  const response = await apiFetch<ApiResponse<LectureDetails>>(
    `/cources/${courseId}/lectures/${lectureId}`
  );
  return response.data;
}

export async function createCourse(
  draft: CourseDraft,
  onProgress?: (percent: number) => void
) {
  const response = await apiUpload<ApiResponse<Course>>(
    "/cources/admin",
    buildCourseFormData(draft),
    { onProgress }
  );
  return response.data;
}

export async function changeCourseStatus(id: string, action: CourseStatusAction) {
  const response = await apiFetch<ApiResponse<Pick<Course, "_id" | "title" | "status">>>(
    `/cources/${id}/${action}`,
    { method: "PATCH" }
  );
  return response.data;
}

export async function fetchInstructors() {
  const result = await fetchUsers({ role: "instructor", status: "approved", page: 1, limit: 100 });
  return result.users;
}
