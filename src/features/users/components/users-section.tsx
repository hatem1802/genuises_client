import { useEffect, useState, type ReactNode } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { inputClassName } from "@/components/ui/form";
import type { UserRole } from "@/features/admin/types";
import { fetchUsers } from "@/features/users/api";
import { UsersTable } from "@/features/users/components/users-table";
import { formatRole, formatStatus } from "@/features/users/format";
import { USER_STATUSES, type User, type UserStatus } from "@/features/users/types";
import { useDebouncedValue } from "@/lib/use-debounced-value";

const PAGE_SIZE = 10;

type UsersSectionProps = {
  title: string;
  description: string;
  roles: UserRole[];
  action?: ReactNode;
  linkToDetails?: boolean;
  currentUserId: string | undefined;
  pendingStatusUserId: string | null;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onToggleBlock: (user: User) => void;
};

function pluralRole(role: UserRole) {
  return `${formatRole(role)}s`;
}

export function UsersSection({
  title,
  description,
  roles,
  action,
  linkToDetails,
  currentUserId,
  pendingStatusUserId,
  onEdit,
  onDelete,
  onToggleBlock,
}: UsersSectionProps) {
  const [activeRole, setActiveRole] = useState<UserRole>(roles[0]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<UserStatus | "">("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim());

  const query = {
    page,
    limit: PAGE_SIZE,
    role: activeRole,
    status: status || undefined,
    search: debouncedSearch || undefined,
  };

  const usersQuery = useQuery({
    queryKey: ["users", query],
    queryFn: () => fetchUsers(query),
    placeholderData: keepPreviousData,
  });

  const users = usersQuery.data?.users ?? [];
  const pagination = usersQuery.data?.pagination;
  const totalPages = Math.max(1, pagination?.pages ?? 1);
  const hasFilters = Boolean(search || status);

  useEffect(() => {
    if (pagination && page > Math.max(1, pagination.pages)) {
      setPage(Math.max(1, pagination.pages));
    }
  }, [pagination, page]);

  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-4 py-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <p className="mt-0.5 text-sm text-slate-600">{description}</p>
        </div>
        {action}
      </div>

      {roles.length > 1 ? (
        <div className="flex gap-1 border-b border-slate-200 px-4 pt-3">
          {roles.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => {
                setActiveRole(role);
                setPage(1);
              }}
              className={`-mb-px border-b-2 px-3 pb-2.5 text-sm font-medium transition ${
                activeRole === role
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {pluralRole(role)}
            </button>
          ))}
        </div>
      ) : null}

      <div className="grid gap-3 border-b border-slate-200 p-4 md:grid-cols-[1fr_200px_auto]">
        <input
          type="search"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search by name, username, or email"
          className={inputClassName}
        />
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as UserStatus | "");
            setPage(1);
          }}
          className={inputClassName}
        >
          <option value="">All statuses</option>
          {USER_STATUSES.map((option) => (
            <option key={option} value={option}>
              {formatStatus(option)}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={!hasFilters}
          onClick={() => {
            setSearch("");
            setStatus("");
            setPage(1);
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Clear
        </button>
      </div>

      {usersQuery.isPending ? (
        <p className="px-6 py-12 text-center text-sm text-slate-500">Loading…</p>
      ) : usersQuery.isError ? (
        <div className="px-6 py-12 text-center">
          <p className="text-sm text-red-700">{usersQuery.error.message}</p>
          <button
            type="button"
            onClick={() => void usersQuery.refetch()}
            className="mt-3 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Try again
          </button>
        </div>
      ) : users.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-slate-500">
          {hasFilters
            ? "No users match your filters."
            : `No ${pluralRole(activeRole).toLowerCase()} yet.`}
        </p>
      ) : (
        <div className={usersQuery.isFetching ? "opacity-60 transition" : "transition"}>
          <UsersTable
            users={users}
            currentUserId={currentUserId}
            pendingStatusUserId={pendingStatusUserId}
            linkToDetails={linkToDetails}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleBlock={onToggleBlock}
          />
        </div>
      )}

      {pagination && pagination.total > 0 ? (
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
          <span>
            Page {pagination.page} of {totalPages} · {pagination.total}{" "}
            {pluralRole(activeRole).toLowerCase()}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
