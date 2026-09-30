import { useState } from "react";
import { keepPreviousData, useQueries, useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { inputClassName } from "@/components/ui/form";
import { Notice, type NoticeState } from "@/components/ui/notice";
import { fetchAdminCourses, fetchInstructors } from "@/features/courses/api";
import { CourseStatusModal } from "@/features/courses/components/course-status-modal";
import {
  COURSE_STATUSES,
  COURSE_STATUS_ACTION,
  COURSE_STATUS_ACTION_META,
  COURSE_STATUS_META,
  formatPrice,
} from "@/features/courses/format";
import type { AdminCourse, CourseStatusAction } from "@/features/courses/types";
import { formatDate } from "@/features/users/format";
import type { CourseStatus } from "@/features/users/types";
import { useDebouncedValue } from "@/lib/use-debounced-value";

const PAGE_SIZE = 10;

type Tab = CourseStatus | "all";

const TABS: { value: Tab; label: string }[] = [
  { value: "all", label: "All courses" },
  ...COURSE_STATUSES.map((status) => ({ value: status, label: COURSE_STATUS_META[status].label })),
];

function countQuizzes(course: AdminCourse) {
  return (
    course.lectures.reduce((sum, lecture) => sum + (lecture.quizzes?.length ?? 0), 0) +
    (course.fullQuiz ? 1 : 0)
  );
}

function AccessCodesCell({ course }: { course: AdminCourse }) {
  const { total, available, used } = course.stats.accessCodes;
  const usedPercent = total ? Math.round((used / total) * 100) : 0;

  return (
    <div className="min-w-[120px]">
      <p className={available === 0 ? "font-medium text-red-700" : "font-medium text-slate-900"}>
        {available} available
      </p>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-sky-500" style={{ width: `${usedPercent}%` }} />
      </div>
      <p className="mt-1 text-xs text-slate-500">
        {used} used of {total}
      </p>
    </div>
  );
}

export function AdminCoursesPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState<NoticeState>(null);
  const [pendingAction, setPendingAction] = useState<{
    course: AdminCourse;
    action: CourseStatusAction;
  } | null>(null);
  const debouncedSearch = useDebouncedValue(search.trim());

  const filters = {
    search: debouncedSearch || undefined,
    instructorId: instructorId || undefined,
  };

  const query = {
    ...filters,
    status: tab === "all" ? undefined : tab,
    page,
    limit: PAGE_SIZE,
  };

  const coursesQuery = useQuery({
    queryKey: ["courses", "list", query],
    queryFn: () => fetchAdminCourses(query),
    placeholderData: keepPreviousData,
  });

  const countQueries = useQueries({
    queries: TABS.map((item) => {
      const countQuery = {
        ...filters,
        status: item.value === "all" ? undefined : item.value,
        page: 1,
        limit: 1,
      };
      return {
        queryKey: ["courses", "count", countQuery],
        queryFn: () => fetchAdminCourses(countQuery),
        select: (data: Awaited<ReturnType<typeof fetchAdminCourses>>) => data.pagination.total,
      };
    }),
  });

  const instructorsQuery = useQuery({
    queryKey: ["users", "instructors-options"],
    queryFn: fetchInstructors,
  });

  const courses = coursesQuery.data?.courses ?? [];
  const pagination = coursesQuery.data?.pagination;
  const totalPages = Math.max(1, pagination?.pages ?? 1);
  const hasFilters = Boolean(search || instructorId);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <AdminPageHeader
          title="Courses"
          description="All courses with their students, access codes, and pending requests."
        />
        <Link
          to="/admin/courses/new"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          New course
        </Link>
      </div>

      <Notice notice={notice} onDismiss={() => setNotice(null)} />

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap gap-1 border-b border-slate-200 px-4 pt-3">
          {TABS.map((item, index) => {
            const count = countQueries[index]?.data;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  setTab(item.value);
                  setPage(1);
                }}
                className={`-mb-px flex items-center gap-2 border-b-2 px-3 pb-2.5 text-sm font-medium transition ${
                  tab === item.value
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {item.label}
                {count !== undefined ? (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                    {count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="grid gap-3 border-b border-slate-200 p-4 md:grid-cols-[1fr_240px_auto]">
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search by title or description"
            className={inputClassName}
          />
          <select
            value={instructorId}
            onChange={(event) => {
              setInstructorId(event.target.value);
              setPage(1);
            }}
            className={inputClassName}
          >
            <option value="">All instructors</option>
            {(instructorsQuery.data ?? []).map((instructor) => (
              <option key={instructor._id} value={instructor._id}>
                {instructor.fullname}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!hasFilters}
            onClick={() => {
              setSearch("");
              setInstructorId("");
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Clear
          </button>
        </div>

        {coursesQuery.isPending ? (
          <p className="px-6 py-16 text-center text-sm text-slate-500">Loading courses…</p>
        ) : coursesQuery.isError ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-red-700">{coursesQuery.error.message}</p>
            <button
              type="button"
              onClick={() => void coursesQuery.refetch()}
              className="mt-3 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              Try again
            </button>
          </div>
        ) : courses.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-slate-600">
              {hasFilters ? "No courses match your filters." : "No courses here yet."}
            </p>
            {!hasFilters ? (
              <Link
                to="/admin/courses/new"
                className="mt-3 inline-block text-sm font-medium text-sky-700 hover:underline"
              >
                Create a course
              </Link>
            ) : null}
          </div>
        ) : (
          <div
            className={`overflow-x-auto ${coursesQuery.isFetching ? "opacity-60 transition" : "transition"}`}
          >
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Instructor</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Content</th>
                  <th className="px-4 py-3">Students</th>
                  <th className="px-4 py-3">Access codes</th>
                  <th className="px-4 py-3">Pending</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.map((course) => {
                  const statusMeta = COURSE_STATUS_META[course.status];
                  const quizzesCount = countQuizzes(course);
                  const statusAction = COURSE_STATUS_ACTION[course.status];

                  return (
                    <tr key={course._id} className="align-top">
                      <td className="max-w-xs px-4 py-3">
                        <Link
                          to="/admin/courses/$courseId"
                          params={{ courseId: course._id }}
                          className="font-medium text-slate-900 hover:text-sky-700 hover:underline"
                        >
                          {course.title}
                        </Link>
                        <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                          {course.description}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Created {formatDate(course.createdAt)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        {course.instructor ? (
                          <>
                            <Link
                              to="/admin/users/$userId"
                              params={{ userId: course.instructor._id }}
                              className="text-slate-800 hover:text-sky-700 hover:underline"
                            >
                              {course.instructor.fullname}
                            </Link>
                            <p className="text-xs text-slate-500">@{course.instructor.username}</p>
                          </>
                        ) : (
                          <span className="text-slate-400">Deleted instructor</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <p className="font-medium text-slate-900">{formatPrice(course.price)}</p>
                        <p className="text-xs text-slate-500">{course.durationDays} days access</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                        <p>{course.lectures.length} lectures</p>
                        <p className="text-xs text-slate-500">
                          {quizzesCount} quizzes
                          {course.certificateTemplate ? " · Certificate" : ""}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <p className="font-medium text-slate-900">{course.stats.totalStudents}</p>
                        <p className="text-xs text-slate-500">
                          {course.stats.activeStudents} active
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <AccessCodesCell course={course} />
                      </td>
                      <td className="px-4 py-3">
                        {course.stats.pendingRequests > 0 ? (
                          <Link
                            to="/admin/requests"
                            className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 hover:bg-amber-200"
                          >
                            {course.stats.pendingRequests}
                          </Link>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={statusMeta.className}>{statusMeta.label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1.5">
                          <Link
                            to="/admin/courses/$courseId"
                            params={{ courseId: course._id }}
                            className="whitespace-nowrap rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-800 transition hover:bg-slate-50"
                          >
                            View
                          </Link>
                          {statusAction ? (
                            <button
                              type="button"
                              onClick={() => setPendingAction({ course, action: statusAction })}
                              className={`whitespace-nowrap rounded-md border px-2.5 py-1 text-xs font-medium transition ${COURSE_STATUS_ACTION_META[statusAction].buttonClassName}`}
                            >
                              {COURSE_STATUS_ACTION_META[statusAction].label}
                            </button>
                          ) : null}
                          <Link
                            to="/admin/access-codes"
                            search={{ courseId: course._id }}
                            className="whitespace-nowrap rounded-md border border-sky-300 px-2.5 py-1 text-xs font-medium text-sky-700 transition hover:bg-sky-50"
                          >
                            Codes
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.total > 0 ? (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
            <span>
              Page {pagination.page} of {totalPages} · {pagination.total} courses
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {pendingAction ? (
        <CourseStatusModal
          course={pendingAction.course}
          action={pendingAction.action}
          onClose={() => setPendingAction(null)}
          onSuccess={(message) => {
            setPendingAction(null);
            setNotice({ tone: "success", message });
          }}
        />
      ) : null}
    </div>
  );
}
