import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import {
  ROLE_BADGE_CLASSES,
  STATUS_BADGE_CLASSES,
  formatDate,
  formatRole,
  formatStatus,
} from "@/features/users/format";
import type { User } from "@/features/users/types";

type UsersTableProps = {
  users: User[];
  currentUserId: string | undefined;
  pendingStatusUserId: string | null;
  linkToDetails?: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onToggleBlock: (user: User) => void;
};

const actionButtonClassName =
  "rounded-md px-2.5 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40";

export function UsersTable({
  users,
  currentUserId,
  pendingStatusUserId,
  linkToDetails = false,
  onEdit,
  onDelete,
  onToggleBlock,
}: UsersTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Last login</th>
            <th className="px-4 py-3">Joined</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {users.map((user) => {
            const isSelf = user._id === currentUserId;
            const isBlocked = user.status === "blocked";
            const isStatusPending = pendingStatusUserId === user._id;

            return (
              <tr key={user._id} className="align-middle">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {linkToDetails ? (
                      <Link
                        to="/admin/users/$userId"
                        params={{ userId: user._id }}
                        className="font-medium text-slate-900 underline-offset-2 hover:text-sky-700 hover:underline"
                      >
                        {user.fullname}
                      </Link>
                    ) : (
                      <p className="font-medium text-slate-900">{user.fullname}</p>
                    )}
                    {isSelf ? (
                      <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">
                        You
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-slate-500">@{user.username}</p>
                </td>
                <td className="px-4 py-3 text-slate-700">{user.email}</td>
                <td className="px-4 py-3">
                  <Badge className={ROLE_BADGE_CLASSES[user.role]}>
                    {formatRole(user.role)}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge className={STATUS_BADGE_CLASSES[user.status]}>
                    {formatStatus(user.status)}
                  </Badge>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                  {formatDate(user.lastLoginAt)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    {linkToDetails ? (
                      <Link
                        to="/admin/users/$userId"
                        params={{ userId: user._id }}
                        className={`${actionButtonClassName} border border-sky-300 text-sky-700 hover:bg-sky-50`}
                      >
                        View
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => onEdit(user)}
                      className={`${actionButtonClassName} border border-slate-300 text-slate-800 hover:bg-slate-50`}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleBlock(user)}
                      disabled={isSelf || isStatusPending}
                      title={isSelf ? "You cannot block your own account" : undefined}
                      className={`${actionButtonClassName} ${
                        isBlocked
                          ? "border border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                          : "border border-amber-300 text-amber-700 hover:bg-amber-50"
                      }`}
                    >
                      {isStatusPending ? "…" : isBlocked ? "Unblock" : "Block"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(user)}
                      disabled={isSelf}
                      title={isSelf ? "You cannot delete your own account" : undefined}
                      className={`${actionButtonClassName} border border-red-300 text-red-700 hover:bg-red-50`}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
