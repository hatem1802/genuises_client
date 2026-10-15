import { useState } from "react";
import { keepPreviousData, useQueries, useQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { inputClassName } from "@/components/ui/form";
import { Notice, type NoticeState } from "@/components/ui/notice";
import { fetchInstructors } from "@/features/courses/api";
import { useCourseOptions } from "@/features/courses/use-course-options";
import { fetchSubscriptions } from "@/features/subscriptions/api";
import { SubscriptionActionModal } from "@/features/subscriptions/components/subscription-action-modal";
import { SubscriptionsTable } from "@/features/subscriptions/components/subscriptions-table";
import { SUBSCRIPTION_STATUSES, SUBSCRIPTION_STATUS_META } from "@/features/subscriptions/format";
import type { Subscription, SubscriptionAction, SubscriptionStatus } from "@/features/subscriptions/types";
import { fetchUsers } from "@/features/users/api";

const PAGE_SIZE = 10;

type Tab = SubscriptionStatus | "all";

const TABS: { value: Tab; label: string }[] = [
  { value: "all", label: "All" },
  ...SUBSCRIPTION_STATUSES.map((status) => ({
    value: status,
    label: SUBSCRIPTION_STATUS_META[status].label,
  })),
];

export function AdminSubscriptionsPage() {
  const search = useSearch({ from: "/admin/subscriptions" });
  const [tab, setTab] = useState<Tab>("all");
  const [studentId, setStudentId] = useState(search.studentId ?? "");
  const [courseId, setCourseId] = useState(search.courseId ?? "");
  const [instructorId, setInstructorId] = useState(search.instructorId ?? "");
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState<NoticeState>(null);
  const [pendingAction, setPendingAction] = useState<{
    subscription: Subscription;
    action: SubscriptionAction;
  } | null>(null);

  const filters = {
    studentId: studentId || undefined,
    courseId: courseId || undefined,
    instructorId: instructorId || undefined,
  };

  const query = {
    ...filters,
    status: tab === "all" ? undefined : tab,
    page,
    limit: PAGE_SIZE,
  };

  const subscriptionsQuery = useQuery({
    queryKey: ["subscriptions", "list", query],
    queryFn: () => fetchSubscriptions(query),
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
        queryKey: ["subscriptions", "count", countQuery],
        queryFn: () => fetchSubscriptions(countQuery),
        select: (data: Awaited<ReturnType<typeof fetchSubscriptions>>) => data.pagination.total,
      };
    }),
  });

  const studentsQuery = useQuery({
    queryKey: ["users", "student-options"],
    queryFn: () => fetchUsers({ role: "student", page: 1, limit: 100 }),
  });

  const instructorsQuery = useQuery({
    queryKey: ["users", "instructors-options"],
    queryFn: fetchInstructors,
  });

  const { courses, isLoading: coursesLoading } = useCourseOptions();

  const subscriptions = subscriptionsQuery.data?.subscriptions ?? [];
  const pagination = subscriptionsQuery.data?.pagination;
  const totalPages = Math.max(1, pagination?.pages ?? 1);
  const hasFilters = Boolean(studentId || courseId || instructorId);

  return (
    <div>
      <AdminPageHeader
        title="Subscriptions"
        description="Every enrollment, with the student, course, instructor, access code, and progress."
      />

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

        <div className="grid gap-3 border-b border-slate-200 p-4 md:grid-cols-[1fr_1fr_1fr_auto]">
          <select
            value={studentId}
            onChange={(event) => {
              setStudentId(event.target.value);
              setPage(1);
            }}
            className={inputClassName}
          >
            <option value="">All students</option>
            {(studentsQuery.data?.users ?? []).map((student) => (
              <option key={student._id} value={student._id}>
                {student.fullname}
              </option>
            ))}
          </select>
          <select
            value={courseId}
            onChange={(event) => {
              setCourseId(event.target.value);
              setPage(1);
            }}
            className={inputClassName}
          >
            <option value="">{coursesLoading ? "Loading courses…" : "All courses"}</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
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
              setStudentId("");
              setCourseId("");
              setInstructorId("");
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Clear
          </button>
        </div>

        {subscriptionsQuery.isPending ? (
          <p className="px-6 py-16 text-center text-sm text-slate-500">Loading subscriptions…</p>
        ) : subscriptionsQuery.isError ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-red-700">{subscriptionsQuery.error.message}</p>
            <button
              type="button"
              onClick={() => void subscriptionsQuery.refetch()}
              className="mt-3 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              Try again
            </button>
          </div>
        ) : subscriptions.length === 0 ? (
          <p className="px-6 py-16 text-center text-sm text-slate-500">
            {hasFilters ? "No subscriptions match these filters." : "No subscriptions here yet."}
          </p>
        ) : (
          <div className={subscriptionsQuery.isFetching ? "opacity-60 transition" : "transition"}>
            <SubscriptionsTable
              subscriptions={subscriptions}
              onAction={(subscription, action) => setPendingAction({ subscription, action })}
            />
          </div>
        )}

        {pagination && pagination.total > 0 ? (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
            <span>
              Page {pagination.page} of {totalPages} · {pagination.total} subscriptions
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
        <SubscriptionActionModal
          subscription={pendingAction.subscription}
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
