import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import {
  SUBSCRIPTION_ACTION_META,
  SUBSCRIPTION_STATUS_META,
  formatDay,
  subscriptionActionFor,
} from "@/features/subscriptions/format";
import type { Subscription, SubscriptionAction } from "@/features/subscriptions/types";

type SubscriptionsTableProps = {
  subscriptions: Subscription[];
  showStudent?: boolean;
  showInstructor?: boolean;
  onAction?: (subscription: Subscription, action: SubscriptionAction) => void;
};

function ProgressCell({ subscription }: { subscription: Subscription }) {
  const { percentage, completedLectures, totalLectures, completedQuizzes } = subscription.progress;
  const color = percentage === 100 ? "bg-emerald-500" : percentage >= 50 ? "bg-sky-500" : "bg-amber-500";

  return (
    <div className="min-w-[140px]">
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
          <div className={`h-full rounded-full ${color}`} style={{ width: `${percentage}%` }} />
        </div>
        <span className="text-xs font-medium text-slate-700">{percentage}%</span>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        {completedLectures}/{totalLectures} lectures · {completedQuizzes}{" "}
        {completedQuizzes === 1 ? "quiz" : "quizzes"}
      </p>
    </div>
  );
}

function PersonLink({
  person,
  extra,
}: {
  person: Subscription["student"];
  extra?: string | null;
}) {
  if (!person._id || !person.fullname) {
    return <span className="text-slate-400">Deleted user</span>;
  }

  return (
    <>
      <Link
        to="/admin/users/$userId"
        params={{ userId: person._id }}
        className="font-medium text-slate-900 hover:text-sky-700 hover:underline"
      >
        {person.fullname}
      </Link>
      {extra ? <p className="text-xs text-slate-500">{extra}</p> : null}
    </>
  );
}

export function SubscriptionsTable({
  subscriptions,
  showStudent = true,
  showInstructor = true,
  onAction,
}: SubscriptionsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            {showStudent ? <th className="px-4 py-3">Student</th> : null}
            <th className="px-4 py-3">Course</th>
            {showInstructor ? <th className="px-4 py-3">Instructor</th> : null}
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Period</th>
            <th className="px-4 py-3">Progress</th>
            <th className="px-4 py-3">Access code</th>
            {onAction ? <th className="px-4 py-3 text-right">Actions</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {subscriptions.map((subscription) => {
            const statusMeta = SUBSCRIPTION_STATUS_META[subscription.status];
            const action = onAction ? subscriptionActionFor(subscription.status) : null;

            return (
              <tr key={subscription._id} className="align-top">
                {showStudent ? (
                  <td className="px-4 py-3">
                    <PersonLink person={subscription.student} extra={subscription.student.email} />
                  </td>
                ) : null}
                <td className="px-4 py-3">
                  <Link
                    to="/admin/courses/$courseId"
                    params={{ courseId: subscription.course._id }}
                    className="font-medium text-slate-900 hover:text-sky-700 hover:underline"
                  >
                    {subscription.course.title}
                  </Link>
                  <p className="text-xs text-slate-500">{subscription.course.price} EGP</p>
                </td>
                {showInstructor ? (
                  <td className="px-4 py-3">
                    <PersonLink person={subscription.instructor} />
                  </td>
                ) : null}
                <td className="px-4 py-3">
                  <Badge className={statusMeta.className}>{statusMeta.label}</Badge>
                  {subscription.status === "active" && !subscription.isActive ? (
                    <p className="mt-1 text-xs text-amber-700">Access ended</p>
                  ) : null}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                  {formatDay(subscription.startAt)} – {formatDay(subscription.endAt)}
                  <p className="text-xs text-slate-500">{subscription.durationDays} days</p>
                </td>
                <td className="px-4 py-3">
                  <ProgressCell subscription={subscription} />
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-700">
                  {subscription.accessCode.code}
                </td>
                {onAction ? (
                  <td className="px-4 py-3 text-right">
                    {action ? (
                      <button
                        type="button"
                        onClick={() => onAction(subscription, action)}
                        className={`whitespace-nowrap rounded-md border px-2.5 py-1 text-xs font-medium transition ${SUBSCRIPTION_ACTION_META[action].buttonClassName}`}
                      >
                        {SUBSCRIPTION_ACTION_META[action].label}
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">No actions</span>
                    )}
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
