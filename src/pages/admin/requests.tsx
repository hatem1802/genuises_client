import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Notice, type NoticeState } from "@/components/ui/notice";
import { fetchRequests, runRequestAction } from "@/features/requests/api";
import { PaymentDocViewer } from "@/features/requests/components/payment-doc-viewer";
import { REQUEST_ACTION_META, REQUEST_STATUS_META } from "@/features/requests/format";
import {
  REQUEST_STATUSES,
  type EnrollmentRequest,
  type RequestAction,
  type RequestStatus,
} from "@/features/requests/types";
import { formatDate } from "@/features/users/format";

type Tab = RequestStatus | "all";

const TABS: { value: Tab; label: string }[] = [
  ...REQUEST_STATUSES.map((status) => ({ value: status, label: REQUEST_STATUS_META[status].label })),
  { value: "all", label: "All" },
];

const actionButtonClassName =
  "whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40";

export function AdminRequestsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("waiting_for_review");
  const [pendingAction, setPendingAction] = useState<{
    request: EnrollmentRequest;
    action: RequestAction;
  } | null>(null);
  const [notice, setNotice] = useState<NoticeState>(null);
  const [viewing, setViewing] = useState<EnrollmentRequest | null>(null);

  const requestsQuery = useQuery({
    queryKey: ["requests", tab],
    queryFn: () => fetchRequests(tab === "all" ? undefined : tab),
  });

  const actionMutation = useMutation({
    mutationFn: ({ request, action }: { request: EnrollmentRequest; action: RequestAction }) =>
      runRequestAction(request._id, action),
    onSuccess: async (updated, { action }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["requests"] }),
        queryClient.invalidateQueries({ queryKey: ["courses"] }),
      ]);
      setPendingAction(null);
      setNotice({
        tone: "success",
        message: `Request from ${updated.studentId?.fullname ?? "student"} was ${REQUEST_ACTION_META[action].success}.`,
      });
    },
    onError: (error, { request, action }) => {
      const noCodes = action === "approve" && /access code/i.test(error.message);
      if (!noCodes || !request.courseId) return;

      setPendingAction(null);
      setNotice({
        tone: "error",
        message: (
          <span>
            Cannot approve: “{request.courseId.title}” has no available access codes.{" "}
            <Link
              to="/admin/access-codes"
              search={{ courseId: request.courseId._id }}
              className="font-semibold underline"
            >
              Generate codes for this course
            </Link>{" "}
            and try again.
          </span>
        ),
      });
    },
  });

  const requests = requestsQuery.data ?? [];

  function openAction(request: EnrollmentRequest, action: RequestAction) {
    actionMutation.reset();
    setPendingAction({ request, action });
  }

  return (
    <div>
      <AdminPageHeader
        title="Requests"
        description="Review enrollment requests and payment documents from students."
      />

      <Notice notice={notice} onDismiss={() => setNotice(null)} />

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap gap-1 border-b border-slate-200 px-4 pt-3">
          {TABS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setTab(item.value)}
              className={`-mb-px border-b-2 px-3 pb-2.5 text-sm font-medium transition ${
                tab === item.value
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {requestsQuery.isPending ? (
          <p className="px-6 py-16 text-center text-sm text-slate-500">Loading requests…</p>
        ) : requestsQuery.isError ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-red-700">{requestsQuery.error.message}</p>
            <button
              type="button"
              onClick={() => void requestsQuery.refetch()}
              className="mt-3 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              Try again
            </button>
          </div>
        ) : requests.length === 0 ? (
          <p className="px-6 py-16 text-center text-sm text-slate-500">No requests here.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Payment document</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Last update</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((request) => {
                  const canReview = request.status === "waiting_for_review";
                  const statusMeta = REQUEST_STATUS_META[request.status];

                  return (
                    <tr key={request._id}>
                      <td className="px-4 py-3">
                        {request.studentId ? (
                          <>
                            <Link
                              to="/admin/users/$userId"
                              params={{ userId: request.studentId._id }}
                              className="font-medium text-slate-900 hover:text-sky-700 hover:underline"
                            >
                              {request.studentId.fullname}
                            </Link>
                            <p className="text-xs text-slate-500">{request.studentId.email}</p>
                          </>
                        ) : (
                          <span className="text-slate-400">Deleted user</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {request.courseId ? (
                          <>
                            <Link
                              to="/admin/courses/$courseId"
                              params={{ courseId: request.courseId._id }}
                              className="font-medium text-slate-900 hover:text-sky-700 hover:underline"
                            >
                              {request.courseId.title}
                            </Link>
                            <p className="text-xs text-slate-500">
                              {request.courseId.price} EGP · {request.courseId.durationDays} days
                            </p>
                          </>
                        ) : (
                          <span className="text-slate-400">Deleted course</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setViewing(request)}
                          className="whitespace-nowrap text-sm font-medium text-sky-700 hover:underline"
                        >
                          View document
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={statusMeta.className}>{statusMeta.label}</Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                        {formatDate(request.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                        {formatDate(request.updatedAt)}
                      </td>
                      <td className="px-4 py-3">
                        {canReview ? (
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openAction(request, "approve")}
                              className={`${actionButtonClassName} bg-emerald-600 text-white hover:bg-emerald-700`}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => openAction(request, "return")}
                              className={`${actionButtonClassName} border border-sky-300 text-sky-700 hover:bg-sky-50`}
                            >
                              Return
                            </button>
                            <button
                              type="button"
                              onClick={() => openAction(request, "reject")}
                              className={`${actionButtonClassName} border border-red-300 text-red-700 hover:bg-red-50`}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <p className="text-right text-xs text-slate-400">No actions</p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {viewing ? <PaymentDocViewer request={viewing} onClose={() => setViewing(null)} /> : null}

      {pendingAction ? (
        <ConfirmModal
          title={REQUEST_ACTION_META[pendingAction.action].title}
          confirmLabel={REQUEST_ACTION_META[pendingAction.action].confirmLabel}
          pendingLabel={REQUEST_ACTION_META[pendingAction.action].pendingLabel}
          variant={REQUEST_ACTION_META[pendingAction.action].variant}
          isPending={actionMutation.isPending}
          error={actionMutation.error?.message ?? null}
          onConfirm={() => actionMutation.mutate(pendingAction)}
          onClose={() => {
            setPendingAction(null);
            actionMutation.reset();
          }}
        >
          <p>
            <span className="font-semibold text-slate-900">
              {pendingAction.request.studentId?.fullname ?? "Student"}
            </span>{" "}
            requested{" "}
            <span className="font-semibold text-slate-900">
              {pendingAction.request.courseId?.title ?? "a deleted course"}
            </span>
            .
          </p>
          <p className="mt-2">{REQUEST_ACTION_META[pendingAction.action].description}</p>
        </ConfirmModal>
      ) : null}
    </div>
  );
}
