import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { COURSE_STATUS_META, formatPrice } from "@/features/courses/format";
import type { AdminCourse } from "@/features/courses/types";
import { SubscriptionsTable } from "@/features/subscriptions/components/subscriptions-table";
import type { Subscription, SubscriptionAction } from "@/features/subscriptions/types";
import { formatDate } from "@/features/users/format";

export function StatCard({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
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

type CoursesSectionProps = {
  subscriptions: Subscription[];
  total: number;
  onAction: (subscription: Subscription, action: SubscriptionAction) => void;
};

export function StudentCoursesSection({ subscriptions, total, onAction }: CoursesSectionProps) {
  const active = subscriptions.filter((item) => item.isActive).length;
  const average = subscriptions.length
    ? Math.round(
        subscriptions.reduce((sum, item) => sum + item.progress.percentage, 0) / subscriptions.length
      )
    : 0;

  return (
    <section className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Subscribed courses" value={total} />
        <StatCard label="Active now" value={active} />
        <StatCard label="Average progress" value={`${average}%`} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
        <h3 className="text-lg font-semibold text-slate-900">Enrolled courses</h3>
        {total > subscriptions.length ? (
          <p className="text-xs text-slate-500">
            Showing {subscriptions.length} of {total}
          </p>
        ) : null}
      </div>

      {subscriptions.length === 0 ? (
        <EmptyState message="This student is not subscribed to any course yet." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <SubscriptionsTable
            subscriptions={subscriptions}
            showStudent={false}
            onAction={onAction}
          />
        </div>
      )}
    </section>
  );
}

export function InstructorCoursesSection({
  courses,
  subscriptions,
  subscriptionsTotal,
  onAction,
}: {
  courses: AdminCourse[];
  subscriptions: Subscription[];
  subscriptionsTotal: number;
  onAction: (subscription: Subscription, action: SubscriptionAction) => void;
}) {
  const published = courses.filter((course) => course.status === "published").length;
  const totalStudents = courses.reduce((sum, course) => sum + course.stats.totalStudents, 0);
  const activeStudents = courses.reduce((sum, course) => sum + course.stats.activeStudents, 0);

  return (
    <section className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Uploaded courses" value={courses.length} />
        <StatCard label="Published" value={published} />
        <StatCard label="Total students" value={totalStudents} />
        <StatCard label="Active students" value={activeStudents} />
      </div>

      <h3 className="pt-2 text-lg font-semibold text-slate-900">Uploaded courses</h3>

      {courses.length === 0 ? (
        <EmptyState message="This instructor has not uploaded any course yet." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Lectures</th>
                <th className="px-4 py-3">Students</th>
                <th className="px-4 py-3">Access codes</th>
                <th className="px-4 py-3">Pending</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courses.map((course) => {
                const badge = COURSE_STATUS_META[course.status];
                return (
                  <tr key={course._id}>
                    <td className="px-4 py-3">
                      <Link
                        to="/admin/courses/$courseId"
                        params={{ courseId: course._id }}
                        className="font-medium text-slate-900 hover:text-sky-700 hover:underline"
                      >
                        {course.title}
                      </Link>
                      <p className="text-xs text-slate-500">{course.durationDays} days access</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={badge.className}>{badge.label}</Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {formatPrice(course.price)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{course.lectures.length}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <p className="font-medium text-slate-900">{course.stats.totalStudents}</p>
                      <p className="text-xs text-slate-500">{course.stats.activeStudents} active</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {course.stats.accessCodes.available} available
                      <p className="text-xs text-slate-500">
                        {course.stats.accessCodes.used} used of {course.stats.accessCodes.total}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{course.stats.pendingRequests}</td>
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

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
        <h3 className="text-lg font-semibold text-slate-900">Students in these courses</h3>
        {subscriptionsTotal > subscriptions.length ? (
          <p className="text-xs text-slate-500">
            Showing {subscriptions.length} of {subscriptionsTotal}
          </p>
        ) : null}
      </div>

      {subscriptions.length === 0 ? (
        <EmptyState message="No students are subscribed to this instructor's courses yet." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <SubscriptionsTable
            subscriptions={subscriptions}
            showInstructor={false}
            onAction={onAction}
          />
        </div>
      )}
    </section>
  );
}
