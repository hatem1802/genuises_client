import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { FieldArray, Form, Formik, useFormikContext } from "formik";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Field, FormError } from "@/components/ui/form";
import { FormikInput, FormikSelect, FormikTextarea } from "@/components/ui/formik-fields";
import { createCourse, fetchInstructors } from "@/features/courses/api";
import { LectureEditor } from "@/features/courses/components/lecture-editor";
import { QuizEditor } from "@/features/courses/components/quiz-editor";
import { createCourseDraft, createLectureDraft, createQuizDraft } from "@/features/courses/drafts";
import type { Course, CourseDraft } from "@/features/courses/types";
import { validateCourseDraft } from "@/features/courses/validation";

const sectionClassName = "space-y-4 rounded-xl border border-slate-200 bg-white p-6";

const addButtonClassName =
  "rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50";

function ScrollToFirstError() {
  const { errors, isSubmitting, submitCount } = useFormikContext<CourseDraft>();
  const handledSubmitCount = useRef(0);
  const hasErrors = Object.keys(errors).length > 0;

  useEffect(() => {
    if (isSubmitting || submitCount === handledSubmitCount.current) return;
    handledSubmitCount.current = submitCount;
    if (!hasErrors) return;

    document
      .querySelector('[aria-invalid="true"], [data-field-error]')
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [hasErrors, isSubmitting, submitCount]);

  return null;
}

export function AdminCourseNewPage() {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [createdCourse, setCreatedCourse] = useState<Course | null>(null);

  const instructorsQuery = useQuery({
    queryKey: ["users", "instructors-options"],
    queryFn: fetchInstructors,
  });

  const mutation = useMutation({
    mutationFn: (courseDraft: CourseDraft) => createCourse(courseDraft, setUploadProgress),
    onSuccess: (course) => {
      void queryClient.invalidateQueries({ queryKey: ["courses"] });
      setCreatedCourse(course);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
  });

  function startAnotherCourse() {
    setCreatedCourse(null);
    mutation.reset();
  }

  if (createdCourse) {
    return (
      <div className="max-w-2xl space-y-6">
        <AdminPageHeader title="Course created" description="The course is now published." />
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
          <p className="text-lg font-semibold text-emerald-900">{createdCourse.title}</p>
          <p className="mt-1 text-sm text-emerald-800">
            {createdCourse.lectures.length} lectures · {createdCourse.price} EGP ·{" "}
            {createdCourse.durationDays} days access
          </p>
          <p className="mt-1 font-mono text-xs text-emerald-700">ID: {createdCourse._id}</p>
          <p className="mt-4 text-sm text-emerald-900">
            Students can only be approved for this course when it has available access codes.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to="/admin/access-codes"
              search={{ courseId: createdCourse._id }}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Generate access codes
            </Link>
            <Link
              to="/admin/courses/$courseId"
              params={{ courseId: createdCourse._id }}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              View course
            </Link>
            <button
              type="button"
              onClick={startAnotherCourse}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              Create another course
            </button>
            <Link
              to="/admin/courses"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              Back to courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const instructors = instructorsQuery.data ?? [];

  return (
    <div className="max-w-4xl">
      <Link
        to="/admin/courses"
        className="mb-4 inline-flex text-sm font-medium text-slate-600 transition hover:text-slate-900"
      >
        ← Back to courses
      </Link>
      <AdminPageHeader
        title="New course"
        description="Courses created by an admin are published immediately."
      />

      <Formik<CourseDraft>
        initialValues={createCourseDraft()}
        validate={validateCourseDraft}
        onSubmit={(values, { setSubmitting }) => {
          setUploadProgress(0);
          mutation.mutate(values);
          setSubmitting(false);
        }}
      >
        {({ values, errors, submitCount, setFieldValue }) => {
          const hasFiles = values.lectures.some(
            (lecture) => lecture.source === "file" && lecture.file
          );
          const showFixFieldsError = submitCount > 0 && Object.keys(errors).length > 0;

          return (
            <Form className="space-y-6" noValidate>
              <ScrollToFirstError />

              <section className={sectionClassName}>
                <h3 className="text-base font-semibold text-slate-900">Course details</h3>

                <Field label="Instructor">
                  <FormikSelect name="instructorId" disabled={instructorsQuery.isPending}>
                    <option value="">
                      {instructorsQuery.isPending ? "Loading instructors…" : "Select an instructor"}
                    </option>
                    {instructors.map((instructor) => (
                      <option key={instructor._id} value={instructor._id}>
                        {instructor.fullname} (@{instructor.username})
                      </option>
                    ))}
                  </FormikSelect>
                </Field>
                {instructorsQuery.isError ? (
                  <p className="text-sm text-red-700">{instructorsQuery.error.message}</p>
                ) : null}
                {instructorsQuery.isSuccess && instructors.length === 0 ? (
                  <p className="text-sm text-amber-700">
                    There are no approved instructors yet. An instructor account is required to
                    create a course.
                  </p>
                ) : null}

                <Field label="Title">
                  <FormikInput name="title" maxLength={150} />
                </Field>

                <Field label="Description" hint="10 to 2000 characters.">
                  <FormikTextarea name="description" rows={4} maxLength={2000} />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Price (EGP)">
                    <FormikInput type="number" name="price" min={0} />
                  </Field>
                  <Field label="Access duration (days)">
                    <FormikInput type="number" name="durationDays" min={1} step={1} />
                  </Field>
                </div>

                <Field label="Certificate template URL" hint="Optional.">
                  <FormikInput type="url" name="certificateTemplate" placeholder="https://…" />
                </Field>
              </section>

              <section className={sectionClassName}>
                <h3 className="text-base font-semibold text-slate-900">
                  Lectures ({values.lectures.length})
                </h3>

                <FieldArray name="lectures">
                  {(lecturesHelpers) => (
                    <>
                      {values.lectures.length === 0 ? (
                        <p className="text-sm text-slate-500">
                          No lectures yet. You can add them now or later.
                        </p>
                      ) : null}

                      {values.lectures.map((lecture, index) => (
                        <LectureEditor
                          key={lecture.id}
                          name={`lectures.${index}`}
                          index={index}
                          total={values.lectures.length}
                          lecture={lecture}
                          onRemove={() => lecturesHelpers.remove(index)}
                          onMove={(direction) => lecturesHelpers.swap(index, index + direction)}
                        />
                      ))}

                      <button
                        type="button"
                        onClick={() => lecturesHelpers.push(createLectureDraft())}
                        className={addButtonClassName}
                      >
                        + Add lecture
                      </button>
                    </>
                  )}
                </FieldArray>
              </section>

              <section className={sectionClassName}>
                <h3 className="text-base font-semibold text-slate-900">Final quiz</h3>
                {values.fullQuiz ? (
                  <QuizEditor
                    name="fullQuiz"
                    label="Final quiz"
                    quiz={values.fullQuiz}
                    onRemove={() => void setFieldValue("fullQuiz", null)}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => void setFieldValue("fullQuiz", createQuizDraft("Final Quiz"))}
                    className={addButtonClassName}
                  >
                    + Add final quiz
                  </button>
                )}
              </section>

              <div className="sticky bottom-0 space-y-3 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur">
                <FormError
                  message={
                    showFixFieldsError
                      ? "Some fields need your attention. Fix the highlighted fields above."
                      : (mutation.error?.message ?? null)
                  }
                />

                {mutation.isPending ? (
                  <div className="space-y-1.5">
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-sky-500 transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-600">
                      {uploadProgress < 100
                        ? `Uploading… ${uploadProgress}%`
                        : hasFiles
                          ? "Upload finished. The server is processing lecture files, this may take a while…"
                          : "Saving course…"}
                    </p>
                  </div>
                ) : null}

                <div className="flex justify-end gap-2">
                  <Link
                    to="/admin/courses"
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {mutation.isPending ? "Creating course…" : "Create course"}
                  </button>
                </div>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}
