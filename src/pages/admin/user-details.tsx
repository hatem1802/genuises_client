import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Notice, type NoticeState } from "@/components/ui/notice";
import { fetchAdminCourses } from "@/features/courses/api";
import { SubscriptionActionModal } from "@/features/subscriptions/components/subscription-action-modal";
import { fetchSubscriptions } from "@/features/subscriptions/api";
import type { Subscription, SubscriptionAction } from "@/features/subscriptions/types";
import {
  InstructorCoursesSection,
  StudentCoursesSection,
} from "@/features/users/components/user-details-sections";
import { fetchUserById } from "@/features/users/api";
import {
  ROLE_BADGE_CLASSES,
  STATUS_BADGE_CLASSES,
  formatDate,
  formatRole,
  formatStatus,
} from "@/features/users/format";

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "U"
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 break-all text-sm text-slate-900">{value}</dd>
    </div>
  );
}

export function AdminUserDetailsPage() {
  const { userId } = useParams({ from: "/admin/users/$userId" });
  const [notice, setNotice] = useState<NoticeState>(null);
  const [pendingAction, setPendingAction] = useState<{
    subscription: Subscription;
    action: SubscriptionAction;
  } | null>(null);

  const userQuery = useQuery({
    queryKey: ["users", "one", userId],
    queryFn: () => fetchUserById(userId),
  });

  const user = userQuery.data;
  const isStudent = user?.role === "student";
  const isInstructor = user?.role === "instructor";

  const subscriptionsQuery = useQuery({
    queryKey: ["subscriptions", isStudent ? "student" : "instructor", userId],
    queryFn: () =>
      fetchSubscriptions({
        studentId: isStudent ? userId : undefined,
        instructorId: isInstructor ? userId : undefined,
        page: 1,
        limit: 100,
      }),
    enabled: isStudent || isInstructor,
  });

  const coursesQuery = useQuery({
    queryKey: ["courses", "by-instructor", userId],
    queryFn: () => fetchAdminCourses({ instructorId: userId, page: 1, limit: 100 }),
    enabled: isInstructor,
  });

  function openAction(subscription: Subscription, action: SubscriptionAction) {
    setPendingAction({ subscription, action });
  }

  return (
    <div className="space-y-6">
      <Link
        to="/admin/users"
        className="inline-flex text-sm font-medium text-slate-600 transition hover:text-slate-900"
      >
        ← Back to users
      </Link>

      <Notice notice={notice} onDismiss={() => setNotice(null)} />

      {userQuery.isPending ? (
        <p className="py-16 text-center text-sm text-slate-500">Loading user…</p>
      ) : userQuery.isError ? (
        <div className="py-16 text-center">
          <p className="text-sm text-red-700">{userQuery.error.message}</p>
          <button
            type="button"
            onClick={() => void userQuery.refetch()}
            className="mt-3 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Try again
          </button>
        </div>
      ) : user ? (
        <>
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-lg font-semibold text-white">
                {getInitials(user.fullname)}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-2xl font-semibold text-slate-900">{user.fullname}</h2>
                <p className="text-sm text-slate-500">@{user.username}</p>
              </div>
              <div className="flex gap-2">
                <Badge className={ROLE_BADGE_CLASSES[user.role]}>{formatRole(user.role)}</Badge>
                <Badge className={STATUS_BADGE_CLASSES[user.status]}>
                  {formatStatus(user.status)}
                </Badge>
              </div>
            </div>

            <dl className="mt-6 grid gap-5 border-t border-slate-100 pt-6 sm:grid-cols-2 lg:grid-cols-3">
              <InfoItem label="Email" value={user.email} />
              <InfoItem label="Username" value={user.username} />
              <InfoItem label="User ID" value={user._id} />
              <InfoItem label="Joined" value={formatDate(user.createdAt)} />
              <InfoItem label="Last login" value={formatDate(user.lastLoginAt)} />
              <InfoItem label="Last updated" value={formatDate(user.updatedAt)} />
            </dl>
          </section>

          {isStudent || isInstructor ? (
            subscriptionsQuery.isPending || (isInstructor && coursesQuery.isPending) ? (
              <p className="py-10 text-center text-sm text-slate-500">Loading courses…</p>
            ) : subscriptionsQuery.isError || coursesQuery.isError ? (
              <p className="text-sm text-red-700">
                {subscriptionsQuery.error?.message ?? coursesQuery.error?.message}
              </p>
            ) : isStudent && subscriptionsQuery.data ? (
              <StudentCoursesSection
                subscriptions={subscriptionsQuery.data.subscriptions}
                total={subscriptionsQuery.data.pagination.total}
                onAction={openAction}
              />
            ) : isInstructor && subscriptionsQuery.data && coursesQuery.data ? (
              <InstructorCoursesSection
                courses={coursesQuery.data.courses}
                subscriptions={subscriptionsQuery.data.subscriptions}
                subscriptionsTotal={subscriptionsQuery.data.pagination.total}
                onAction={openAction}
              />
            ) : null
          ) : (
            <p className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">
              Admin accounts do not have courses or subscriptions.
            </p>
          )}
        </>
      ) : null}

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
