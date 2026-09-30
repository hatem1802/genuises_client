import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Notice, type NoticeState } from "@/components/ui/notice";
import { fetchAdminCourses, fetchCourseStructure } from "@/features/courses/api";
import { CourseStatusModal } from "@/features/courses/components/course-status-modal";
import { LectureItem } from "@/features/courses/components/lecture-item";
import { QuizQuestions } from "@/features/courses/components/quiz-questions";
import {
  COURSE_STATUS_ACTION,
  COURSE_STATUS_ACTION_META,
  COURSE_STATUS_META,
  formatPrice,
} from "@/features/courses/format";
import { StatCard } from "@/features/users/components/user-details-sections";
import { formatDate } from "@/features/users/format";

export function AdminCourseDetailsPage() {
  const { courseId } = useParams({ from: "/admin/courses/$courseId" });
  const [notice, setNotice] = useState<NoticeState>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const structureQuery = useQuery({
    queryKey: ["courses", "structure", courseId],
    queryFn: () => fetchCourseStructure(courseId),
  });

  const title = structureQuery.data?.title;

  // The admin list endpoint is the only source of stats, so look the course up there by title.
  const adminCourseQuery = useQuery({
    queryKey: ["courses", "admin-item", courseId, title],
    queryFn: async () => {
      const result = await fetchAdminCourses({ search: title, page: 1, limit: 100 });
      return result.courses.find((course) => course._id === courseId) ?? null;
    },
    enabled: Boolean(title),
  });

  if (structureQuery.isPending) {
    return <p className="py-16 text-center text-sm text-slate-500">Loading course…</p>;
  }

  if (structureQuery.isError) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-red-700">{structureQuery.error.message}</p>
        <Link to="/admin/courses" className="mt-3 inline-block text-sm text-sky-700 hover:underline">
          Back to courses
        </Link>
      </div>
    );
  }

  const course = structureQuery.data;
  const adminCourse = adminCourseQuery.data;
  const stats = adminCourse?.stats;
  const statusMeta = COURSE_STATUS_META[course.status];
  const statusAction = COURSE_STATUS_ACTION[course.status];
  const statPlaceholder = adminCourseQuery.isPending ? "…" : "—";

  return (
    <div className="space-y-6">
      <Link
        to="/admin/courses"
        className="inline-flex text-sm font-medium text-slate-600 transition hover:text-slate-900"
      >
        ← Back to courses
      </Link>

      <Notice notice={notice} onDismiss={() => setNotice(null)} />

      {course.status === "waiting" ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span>
            This course was submitted by the instructor and is waiting for your review. Check the
            curriculum below, then approve it to publish it.
          </span>
          <button
            type="button"
            onClick={() => setIsStatusModalOpen(true)}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            Approve & publish
          </button>
        </div>
      ) : null}

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-semibold text-slate-900">{course.title}</h2>
              <Badge className={statusMeta.className}>{statusMeta.label}</Badge>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              by{" "}
              {course.instructor ? (
                <Link
                  to="/admin/users/$userId"
                  params={{ userId: course.instructor._id }}
                  className="font-medium text-slate-900 hover:text-sky-700 hover:underline"
                >
                  {course.instructor.fullname}
                </Link>
              ) : (
                "a deleted instructor"
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {statusAction ? (
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(true)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${COURSE_STATUS_ACTION_META[statusAction].buttonClassName}`}
              >
                {COURSE_STATUS_ACTION_META[statusAction].label}
              </button>
            ) : null}
            <Link
              to="/admin/access-codes"
              search={{ courseId: course._id }}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Generate access codes
            </Link>
          </div>
        </div>

        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-700">
          {course.description}
        </p>

        <dl className="mt-6 grid gap-5 border-t border-slate-100 pt-6 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Price</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatPrice(course.price)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Access</dt>
            <dd className="mt-1 text-sm text-slate-900">{course.durationDays} days</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Certificate
            </dt>
            <dd className="mt-1 text-sm text-slate-900">
              {course.hasCertificate ? "Available" : "Not set"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Created</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {adminCourse ? formatDate(adminCourse.createdAt) : statPlaceholder}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Course ID</dt>
            <dd className="mt-1 break-all font-mono text-xs text-slate-700">{course._id}</dd>
          </div>
        </dl>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total students" value={stats?.totalStudents ?? statPlaceholder} />
        <StatCard label="Active students" value={stats?.activeStudents ?? statPlaceholder} />
        <StatCard
          label="Access codes available"
          value={
            stats ? (
              <span className={stats.accessCodes.available === 0 ? "text-red-700" : undefined}>
                {stats.accessCodes.available}
                <span className="text-base font-normal text-slate-500">
                  {" "}
                  / {stats.accessCodes.total}
                </span>
              </span>
            ) : (
              statPlaceholder
            )
          }
        />
        <StatCard
          label="Pending requests"
          value={
            stats && stats.pendingRequests > 0 ? (
              <Link to="/admin/requests" className="text-amber-700 hover:underline">
                {stats.pendingRequests}
              </Link>
            ) : (
              (stats?.pendingRequests ?? statPlaceholder)
            )
          }
        />
      </div>

      {stats && stats.accessCodes.available === 0 && course.status === "published" ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
          This course has no available access codes, so new student requests cannot be approved.{" "}
          <Link
            to="/admin/access-codes"
            search={{ courseId: course._id }}
            className="font-semibold underline"
          >
            Generate codes
          </Link>
        </p>
      ) : null}

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-900">
          Curriculum{" "}
          <span className="text-sm font-normal text-slate-500">
            ({course.lecturesCount} lectures)
          </span>
        </h3>
        {course.lectures.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
            This course has no lectures yet.
          </p>
        ) : (
          <ol className="space-y-2">
            {course.lectures.map((lecture, index) => (
              <LectureItem
                key={lecture._id}
                courseId={course._id}
                order={index + 1}
                lecture={lecture}
              />
            ))}
          </ol>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-900">Final quiz</h3>
        {adminCourse?.fullQuiz ? (
          <QuizQuestions title={adminCourse.fullQuiz.title} questions={adminCourse.fullQuiz.questions} />
        ) : course.fullQuiz ? (
          <p className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            {course.fullQuiz.title} · {course.fullQuiz.questionsCount} questions
          </p>
        ) : (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
            This course has no final quiz.
          </p>
        )}
      </section>

      {isStatusModalOpen && statusAction ? (
        <CourseStatusModal
          course={course}
          action={statusAction}
          onClose={() => setIsStatusModalOpen(false)}
          onSuccess={(message) => {
            setIsStatusModalOpen(false);
            setNotice({ tone: "success", message });
          }}
        />
      ) : null}
    </div>
  );
}
