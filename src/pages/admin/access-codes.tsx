import { useState, type FormEvent } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useSearch } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Field, FormError, inputClassName } from "@/components/ui/form";
import { Notice, type NoticeState } from "@/components/ui/notice";
import { downloadCodesCsv, fetchAccessCodes, generateAccessCodes } from "@/features/access-codes/api";
import type { AccessCodeStatus, GeneratedAccessCode } from "@/features/access-codes/types";
import { useCourseOptions } from "@/features/courses/use-course-options";
import { SUBSCRIPTION_STATUS_META, formatDay } from "@/features/subscriptions/format";
import { fetchUsers } from "@/features/users/api";
import { formatDate } from "@/features/users/format";
import { useDebouncedValue } from "@/lib/use-debounced-value";

const PAGE_SIZE = 10;
const OBJECT_ID_PATTERN = /^[a-f0-9]{24}$/i;

const STATUS_META: Record<AccessCodeStatus, { label: string; className: string }> = {
  available: { label: "Available", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  used: { label: "Used", className: "bg-slate-100 text-slate-600 ring-slate-200" },
};

type Tab = AccessCodeStatus | "all";

const TABS: { value: Tab; label: string; countKey: "total" | "available" | "used" }[] = [
  { value: "all", label: "All", countKey: "total" },
  { value: "available", label: "Available", countKey: "available" },
  { value: "used", label: "Used", countKey: "used" },
];

const smallButtonClassName =
  "rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50";

async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}

export function AdminAccessCodesPage() {
  const searchParams = useSearch({ from: "/admin/access-codes" });
  const queryClient = useQueryClient();
  const { courses, isLoading: coursesLoading, error: coursesError } = useCourseOptions();

  const [courseId, setCourseId] = useState(searchParams.courseId ?? "");
  const [manualEntry, setManualEntry] = useState(false);
  const [count, setCount] = useState("10");
  const [formError, setFormError] = useState<string | null>(null);
  const [latestBatch, setLatestBatch] = useState<GeneratedAccessCode[] | null>(null);

  const [tab, setTab] = useState<Tab>("all");
  const [filterCourseId, setFilterCourseId] = useState(searchParams.courseId ?? "");
  const [studentId, setStudentId] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState<NoticeState>(null);
  const debouncedSearch = useDebouncedValue(search.trim());

  const selectedKnownCourse = courses.find((course) => course._id === courseId);
  const isUnknownPreselected = Boolean(courseId) && !selectedKnownCourse && !coursesLoading;
  const showManualInput = manualEntry || isUnknownPreselected;

  const listQuery = {
    status: tab === "all" ? undefined : tab,
    courseId: filterCourseId || undefined,
    studentId: studentId || undefined,
    search: debouncedSearch || undefined,
    page,
    limit: PAGE_SIZE,
  };

  const codesQuery = useQuery({
    queryKey: ["access-codes", listQuery],
    queryFn: () => fetchAccessCodes(listQuery),
    placeholderData: keepPreviousData,
  });

  const studentsQuery = useQuery({
    queryKey: ["users", "student-options"],
    queryFn: () => fetchUsers({ role: "student", page: 1, limit: 100 }),
  });

  const mutation = useMutation({
    mutationFn: generateAccessCodes,
    onSuccess: async (codes) => {
      setLatestBatch(codes);
      setTab("available");
      setFilterCourseId(courseId.trim());
      setPage(1);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["access-codes"] }),
        queryClient.invalidateQueries({ queryKey: ["courses"] }),
      ]);
      setNotice({ tone: "success", message: `${codes.length} access codes were generated.` });
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedId = courseId.trim();
    const amount = Number(count);

    if (!OBJECT_ID_PATTERN.test(trimmedId)) {
      setFormError("Select a course or enter a valid course ID (24 hex characters).");
      return;
    }
    if (!Number.isInteger(amount) || amount < 1 || amount > 100) {
      setFormError("Number of codes must be between 1 and 100.");
      return;
    }

    setFormError(null);
    mutation.mutate({ courseId: trimmedId, count: amount });
  }

  async function handleCopy(text: string, label: string) {
    try {
      await copyText(text);
      setNotice({ tone: "success", message: `${label} copied to clipboard.` });
    } catch {
      setNotice({ tone: "error", message: "Could not access the clipboard." });
    }
  }

  const codes = codesQuery.data?.codes ?? [];
  const summary = codesQuery.data?.summary;
  const pagination = codesQuery.data?.pagination;
  const totalPages = Math.max(1, pagination?.pages ?? 1);
  const hasFilters = Boolean(filterCourseId || studentId || search);

  return (
    <div>
      <AdminPageHeader
        title="Access Codes"
        description="Generate codes and see which ones are still available or already assigned to a student."
      />

      <Notice notice={notice} onDismiss={() => setNotice(null)} />

      <form
        onSubmit={handleSubmit}
        className="mb-6 max-w-3xl space-y-4 rounded-xl border border-slate-200 bg-white p-6"
      >
        <h3 className="text-base font-semibold text-slate-900">Generate codes</h3>

        <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
          {showManualInput ? (
            <Field label="Course ID" hint="Paste the MongoDB ID of the course.">
              <input
                value={courseId}
                onChange={(event) => setCourseId(event.target.value)}
                placeholder="e.g. 665f1c2a9b1e8a0012345678"
                className={`${inputClassName} font-mono`}
              />
            </Field>
          ) : (
            <Field label="Course">
              <select
                value={courseId}
                onChange={(event) => setCourseId(event.target.value)}
                disabled={coursesLoading && courses.length === 0}
                className={inputClassName}
              >
                <option value="">
                  {coursesLoading && courses.length === 0 ? "Loading courses…" : "Select a course"}
                </option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title} ({course.stats.accessCodes.available} available)
                  </option>
                ))}
              </select>
            </Field>
          )}

          <Field label="Number of codes" hint="1 to 100.">
            <input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(event) => setCount(event.target.value)}
              className={inputClassName}
            />
          </Field>
        </div>

        {coursesError ? (
          <p className="text-sm text-red-700">Could not load courses: {coursesError.message}</p>
        ) : null}

        {selectedKnownCourse ? (
          <p className="text-sm text-slate-600">
            <span className="font-medium text-slate-900">{selectedKnownCourse.title}</span> currently
            has {selectedKnownCourse.stats.accessCodes.available} available and{" "}
            {selectedKnownCourse.stats.accessCodes.used} used codes.
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => {
            setManualEntry(!showManualInput);
            setCourseId("");
          }}
          className="text-sm font-medium text-sky-700 hover:underline"
        >
          {showManualInput ? "Choose from the course list instead" : "Enter a course ID manually"}
        </button>

        <FormError message={formError ?? mutation.error?.message ?? null} />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {mutation.isPending ? "Generating…" : "Generate codes"}
          </button>
        </div>
      </form>

      {latestBatch ? (
        <section className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-semibold text-emerald-900">
              Latest batch · {latestBatch.length} codes
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => void handleCopy(latestBatch.map((item) => item.code).join("\n"), "All codes")}
                className={smallButtonClassName}
              >
                Copy all
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadCodesCsv(`access-codes-${new Date().toISOString().slice(0, 10)}.csv`, latestBatch.map((item) => ({
                    code: item.code,
                    course: selectedKnownCourse?.title ?? item.courseId,
                  })))
                }
                className={smallButtonClassName}
              >
                Download CSV
              </button>
              <button
                type="button"
                onClick={() => setLatestBatch(null)}
                className={smallButtonClassName}
              >
                Dismiss
              </button>
            </div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {latestBatch.map((item) => (
              <button
                key={item._id}
                type="button"
                onClick={() => void handleCopy(item.code, `Code ${item.code}`)}
                title="Click to copy"
                className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-left font-mono text-sm tracking-wider text-slate-800 transition hover:border-emerald-300"
              >
                {item.code}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap gap-1 border-b border-slate-200 px-4 pt-3">
          {TABS.map((item) => {
            const countValue = summary?.[item.countKey];
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
                {countValue !== undefined ? (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                    {countValue}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="grid gap-3 border-b border-slate-200 p-4 md:grid-cols-[1fr_1fr_1fr_auto]">
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search by code"
            className={inputClassName}
          />
          <select
            value={filterCourseId}
            onChange={(event) => {
              setFilterCourseId(event.target.value);
              setPage(1);
            }}
            className={inputClassName}
          >
            <option value="">All courses</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
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
          <button
            type="button"
            disabled={!hasFilters}
            onClick={() => {
              setSearch("");
              setFilterCourseId("");
              setStudentId("");
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Clear
          </button>
        </div>

        {codesQuery.isPending ? (
          <p className="px-6 py-16 text-center text-sm text-slate-500">Loading access codes…</p>
        ) : codesQuery.isError ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-red-700">{codesQuery.error.message}</p>
            <button
              type="button"
              onClick={() => void codesQuery.refetch()}
              className="mt-3 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              Try again
            </button>
          </div>
        ) : codes.length === 0 ? (
          <p className="px-6 py-16 text-center text-sm text-slate-500">
            {hasFilters ? "No access codes match these filters." : "No access codes yet."}
          </p>
        ) : (
          <div className={`overflow-x-auto ${codesQuery.isFetching ? "opacity-60 transition" : "transition"}`}>
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Subscription</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {codes.map((item) => {
                  const statusMeta = STATUS_META[item.status];
                  return (
                    <tr key={item._id} className="align-top">
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => void handleCopy(item.code, `Code ${item.code}`)}
                          title="Click to copy"
                          className="font-mono text-sm tracking-wider text-slate-900 hover:text-sky-700"
                        >
                          {item.code}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        {item.course ? (
                          <Link
                            to="/admin/courses/$courseId"
                            params={{ courseId: item.course._id }}
                            className="font-medium text-slate-900 hover:text-sky-700 hover:underline"
                          >
                            {item.course.title}
                          </Link>
                        ) : (
                          <span className="text-slate-400">Deleted course</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={statusMeta.className}>{statusMeta.label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        {item.student ? (
                          <>
                            <Link
                              to="/admin/users/$userId"
                              params={{ userId: item.student._id }}
                              className="font-medium text-slate-900 hover:text-sky-700 hover:underline"
                            >
                              {item.student.fullname}
                            </Link>
                            <p className="text-xs text-slate-500">{item.student.email}</p>
                          </>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {item.subscription ? (
                          <>
                            <Badge className={SUBSCRIPTION_STATUS_META[item.subscription.status].className}>
                              {SUBSCRIPTION_STATUS_META[item.subscription.status].label}
                            </Badge>
                            <p className="mt-1 text-xs text-slate-500">
                              {formatDay(item.subscription.startAt)} – {formatDay(item.subscription.endAt)}
                            </p>
                          </>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                        {formatDate(item.createdAt)}
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
              Page {pagination.page} of {totalPages} · {pagination.total} codes
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
    </div>
  );
}
