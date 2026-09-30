import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Field, FormError, inputClassName } from "@/components/ui/form";
import { Notice, type NoticeState } from "@/components/ui/notice";
import {
  downloadBatchCsv,
  generateAccessCodes,
  getSavedBatches,
  saveBatches,
} from "@/features/access-codes/api";
import type { AccessCodeBatch } from "@/features/access-codes/types";
import { useCourseOptions } from "@/features/courses/use-course-options";
import { formatDate } from "@/features/users/format";

const OBJECT_ID_PATTERN = /^[a-f0-9]{24}$/i;

const smallButtonClassName =
  "rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50";

async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}

export function AdminAccessCodesPage() {
  const search = useSearch({ from: "/admin/access-codes" });
  const queryClient = useQueryClient();
  const { courses, isLoading, error: coursesError } = useCourseOptions();
  const [courseId, setCourseId] = useState(search.courseId ?? "");
  const [manualEntry, setManualEntry] = useState(false);
  const [count, setCount] = useState("10");
  const [formError, setFormError] = useState<string | null>(null);
  const [batches, setBatches] = useState<AccessCodeBatch[]>(getSavedBatches);
  const [notice, setNotice] = useState<NoticeState>(null);

  const selectedKnownCourse = courses.find((course) => course._id === courseId);
  const isUnknownPreselected = Boolean(courseId) && !selectedKnownCourse && !isLoading;
  const showManualInput = manualEntry || isUnknownPreselected;

  function updateBatches(next: AccessCodeBatch[]) {
    setBatches(next);
    saveBatches(next);
  }

  const mutation = useMutation({
    mutationFn: generateAccessCodes,
    onSuccess: (codes, variables) => {
      const batch: AccessCodeBatch = {
        id: crypto.randomUUID(),
        courseId: variables.courseId,
        courseTitle: courses.find((course) => course._id === variables.courseId)?.title ?? null,
        createdAt: new Date().toISOString(),
        codes: codes.map((item) => item.code),
      };
      updateBatches([batch, ...batches]);
      void queryClient.invalidateQueries({ queryKey: ["courses"] });
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

  return (
    <div>
      <AdminPageHeader
        title="Access Codes"
        description="Generate access codes for a course. Approving a student request uses one available code."
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
                disabled={isLoading && courses.length === 0}
                className={inputClassName}
              >
                <option value="">
                  {isLoading && courses.length === 0 ? "Loading courses…" : "Select a course"}
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
            {selectedKnownCourse.stats.accessCodes.used} used codes
            {selectedKnownCourse.stats.pendingRequests > 0
              ? `, with ${selectedKnownCourse.stats.pendingRequests} pending requests`
              : ""}
            .
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

      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Generated batches</h3>
      </div>
      <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
        The server has no endpoint to list existing codes yet, so batches generated here are kept in
        this browser only. Download or copy them before clearing browser data.
      </p>

      {batches.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">
          No codes generated from this browser yet.
        </p>
      ) : (
        <div className="space-y-4">
          {batches.map((batch) => (
            <section key={batch.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">
                    {batch.courseTitle ?? "Course"}{" "}
                    <span className="font-normal text-slate-500">· {batch.codes.length} codes</span>
                  </p>
                  <p className="font-mono text-xs text-slate-500">{batch.courseId}</p>
                  <p className="text-xs text-slate-500">Generated {formatDate(batch.createdAt)}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => void handleCopy(batch.codes.join("\n"), "All codes")}
                    className={smallButtonClassName}
                  >
                    Copy all
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadBatchCsv(batch)}
                    className={smallButtonClassName}
                  >
                    Download CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => updateBatches(batches.filter((item) => item.id !== batch.id))}
                    className={`${smallButtonClassName} border-red-300 text-red-700 hover:bg-red-50`}
                  >
                    Remove from list
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {batch.codes.map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => void handleCopy(code, `Code ${code}`)}
                    title="Click to copy"
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left font-mono text-sm tracking-wider text-slate-800 transition hover:border-slate-300 hover:bg-white"
                  >
                    {code}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
