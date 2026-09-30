import { useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { USER_DETAILS_IS_MOCK, fetchUserDetails } from "@/features/users/api";
import {
  InstructorCoursesSection,
  StudentCoursesSection,
} from "@/features/users/components/user-details-sections";
import {
  ROLE_BADGE_CLASSES,
  STATUS_BADGE_CLASSES,
  formatDate,
  formatRole,
  formatStatus,
} from "@/features/users/format";
import type { User, UsersListResult } from "@/features/users/types";

function findCachedUser(queryClient: QueryClient, userId: string): User | undefined {
  const cached = queryClient.getQueriesData<UsersListResult>({ queryKey: ["users"] });
  for (const [, data] of cached) {
    const match = data?.users.find((user) => user._id === userId);
    if (match) return match;
  }
  return undefined;
}

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
  const queryClient = useQueryClient();

  const detailsQuery = useQuery({
    queryKey: ["user-details", userId],
    queryFn: () => fetchUserDetails(userId, findCachedUser(queryClient, userId)),
  });

  return (
    <div className="space-y-6">
      <Link
        to="/admin/users"
        className="inline-flex text-sm font-medium text-slate-600 transition hover:text-slate-900"
      >
        ← Back to users
      </Link>

      {USER_DETAILS_IS_MOCK ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
          Courses, subscriptions, and progress below are sample data until the user details
          endpoint is available on the server.
        </p>
      ) : null}

      {detailsQuery.isPending ? (
        <p className="py-16 text-center text-sm text-slate-500">Loading user…</p>
      ) : detailsQuery.isError ? (
        <div className="py-16 text-center">
          <p className="text-sm text-red-700">{detailsQuery.error.message}</p>
          <button
            type="button"
            onClick={() => void detailsQuery.refetch()}
            className="mt-3 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-lg font-semibold text-white">
                {getInitials(detailsQuery.data.user.fullname)}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-2xl font-semibold text-slate-900">
                  {detailsQuery.data.user.fullname}
                </h2>
                <p className="text-sm text-slate-500">@{detailsQuery.data.user.username}</p>
              </div>
              <div className="flex gap-2">
                <Badge className={ROLE_BADGE_CLASSES[detailsQuery.data.user.role]}>
                  {formatRole(detailsQuery.data.user.role)}
                </Badge>
                <Badge className={STATUS_BADGE_CLASSES[detailsQuery.data.user.status]}>
                  {formatStatus(detailsQuery.data.user.status)}
                </Badge>
              </div>
            </div>

            <dl className="mt-6 grid gap-5 border-t border-slate-100 pt-6 sm:grid-cols-2 lg:grid-cols-3">
              <InfoItem label="Email" value={detailsQuery.data.user.email} />
              <InfoItem label="Username" value={detailsQuery.data.user.username} />
              <InfoItem label="User ID" value={detailsQuery.data.user._id} />
              <InfoItem label="Joined" value={formatDate(detailsQuery.data.user.createdAt)} />
              <InfoItem label="Last login" value={formatDate(detailsQuery.data.user.lastLoginAt)} />
              <InfoItem label="Last updated" value={formatDate(detailsQuery.data.user.updatedAt)} />
            </dl>
          </section>

          {detailsQuery.data.student ? (
            <StudentCoursesSection details={detailsQuery.data.student} />
          ) : null}

          {detailsQuery.data.instructor ? (
            <InstructorCoursesSection details={detailsQuery.data.instructor} />
          ) : null}

          {!detailsQuery.data.student && !detailsQuery.data.instructor ? (
            <p className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">
              Admin accounts do not have courses or subscriptions.
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
