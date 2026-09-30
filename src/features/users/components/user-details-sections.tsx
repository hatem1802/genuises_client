import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { COURSE_STATUS_META, formatPrice } from "@/features/courses/format";
import { formatDate } from "@/features/users/format";
import type {
  InstructorDetails,
  StudentDetails,
  SubscriptionStatus,
} from "@/features/users/types";

const SUBSCRIPTION_BADGE: Record<SubscriptionStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  expired: { label: "Expired", className: "bg-slate-100 text-slate-600 ring-slate-200" },
  cancelled: { label: "Cancelled", className: "bg-rose-50 text-rose-700 ring-rose-200" },
};

const formatDay = (value: string) =>
  new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

export function StatCard({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  const color = value === 100 ? "bg-emerald-500" : value >= 50 ? "bg-sky-500" : "bg-amber-500";

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="w-10 text-xs font-medium text-slate-700">{value}%</span>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">
      {message}
    </p>
  );
}

const thClassName = "px-4 py-3";

export function StudentCoursesSection({ details }: { details: StudentDetails }) {
  const { stats, subscriptions } = details;

  return (
    <section className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Subscribed courses" value={stats.totalSubscriptions} />
        <StatCard label="Active subscriptions" value={stats.activeSubscriptions} />
        <StatCard label="Average progress" value={`${stats.averageProgress}%`} />
        <StatCard label="Certificates" value={stats.certificatesIssued} />
      </div>

      <h3 className="pt-2 text-lg font-semibold text-slate-900">Enrolled courses</h3>

      {subscriptions.length === 0 ? (
        <EmptyState message="This student is not subscribed to any course yet." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className={thClassName}>Course</th>
                <th className={thClassName}>Status</th>
                <th className={thClassName}>Subscription period</th>
                <th className={thClassName}>Progress</th>
                <th className={thClassName}>Lectures</th>
                <th className={thClassName}>Quizzes</th>
                <th className={thClassName}>Certificate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subscriptions.map((subscription) => {
                const { progress, course } = subscription;
                const badge = SUBSCRIPTION_BADGE[subscription.status];
                const quizzes = progress.completedQuizzes;
                const averageScore = quizzes.length
                  ? Math.round(quizzes.reduce((sum, quiz) => sum + quiz.score, 0) / quizzes.length)
                  : null;

                return (
                  <tr key={subscription._id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">
                        {course?.title ?? "Deleted course"}
                      </p>
                      {course?.instructor ? (
                        <p className="text-xs text-slate-500">by {course.instructor.fullname}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={badge.className}>{badge.label}</Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {formatDay(subscription.startAt)} – {formatDay(subscription.endAt)}
                      <p className="text-xs text-slate-500">{subscription.durationDays} days</p>
                    </td>
                    <td className="px-4 py-3">
                      <ProgressBar value={progress.percentage} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {progress.completedLectures} / {progress.totalLectures}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {quizzes.length}
                      {averageScore !== null ? (
                        <span className="text-xs text-slate-500"> · avg {averageScore}%</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      {progress.certificate.issued ? (
                        <Badge className="bg-emerald-50 text-emerald-700 ring-emerald-200">
                          Issued
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-500">Not yet</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function InstructorCoursesSection({ details }: { details: InstructorDetails }) {
  const { stats, courses } = details;

  return (
    <section className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Uploaded courses" value={stats.totalCourses} />
        <StatCard label="Published courses" value={stats.publishedCourses} />
        <StatCard label="Total students" value={stats.totalStudents} />
        <StatCard label="Active students" value={stats.activeStudents} />
      </div>

      <h3 className="pt-2 text-lg font-semibold text-slate-900">Uploaded courses</h3>

      {courses.length === 0 ? (
        <EmptyState message="This instructor has not uploaded any course yet." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className={thClassName}>Course</th>
                <th className={thClassName}>Status</th>
                <th className={thClassName}>Price</th>
                <th className={thClassName}>Lectures</th>
                <th className={thClassName}>Students</th>
                <th className={thClassName}>Avg. progress</th>
                <th className={thClassName}>Access codes</th>
                <th className={thClassName}>Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courses.map((course) => {
                const badge = COURSE_STATUS_META[course.status];

                return (
                  <tr key={course._id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{course.title}</p>
                      <p className="text-xs text-slate-500">{course.durationDays} days access</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={badge.className}>{badge.label}</Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {formatPrice(course.price)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{course.lecturesCount}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <p className="font-medium text-slate-900">{course.studentsCount}</p>
                      <p className="text-xs text-slate-500">
                        {course.activeStudentsCount} active
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <ProgressBar value={course.averageProgress} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {course.accessCodes.used} used
                      <p className="text-xs text-slate-500">
                        {course.accessCodes.available} available
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {formatDate(course.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
