import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { blockUser, unblockUser } from "@/features/users/api";
import { AddAdminModal } from "@/features/users/components/add-admin-modal";
import { DeleteUserModal } from "@/features/users/components/delete-user-modal";
import { EditUserModal } from "@/features/users/components/edit-user-modal";
import { UsersSection } from "@/features/users/components/users-section";
import { formatStatus } from "@/features/users/format";
import type { User } from "@/features/users/types";
import { useAuth } from "@/providers/auth-provider";

type ActiveModal =
  | { type: "add-admin" }
  | { type: "edit"; user: User }
  | { type: "delete"; user: User }
  | null;

export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { user: currentUser, updateCurrentUser } = useAuth();
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(
    null
  );

  const statusMutation = useMutation({
    mutationFn: (user: User) =>
      user.status === "blocked" ? unblockUser(user._id) : blockUser(user._id),
    onSuccess: async (updated) => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      setNotice({
        tone: "success",
        message: `${updated.fullname} is now ${formatStatus(updated.status).toLowerCase()}.`,
      });
    },
    onError: (error) => setNotice({ tone: "error", message: error.message }),
  });

  const sharedSectionProps = {
    currentUserId: currentUser?._id,
    pendingStatusUserId: statusMutation.isPending
      ? (statusMutation.variables?._id ?? null)
      : null,
    onEdit: (user: User) => setActiveModal({ type: "edit", user }),
    onDelete: (user: User) => setActiveModal({ type: "delete", user }),
    onToggleBlock: (user: User) => statusMutation.mutate(user),
  };

  return (
    <div>
      <AdminPageHeader
        title="Users"
        description="Manage admins, instructors, and students."
      />

      {notice ? (
        <div
          role="status"
          className={`mb-4 flex items-center justify-between rounded-lg border px-4 py-2.5 text-sm ${
            notice.tone === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <span>{notice.message}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Dismiss"
            className="ml-4 text-base leading-none opacity-70 hover:opacity-100"
          >
            ×
          </button>
        </div>
      ) : null}

      <div className="space-y-6">
        <UsersSection
          title="Administrators"
          description="Accounts with full access to the admin dashboard."
          roles={["admin"]}
          action={
            <button
              type="button"
              onClick={() => setActiveModal({ type: "add-admin" })}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Add admin
            </button>
          }
          {...sharedSectionProps}
        />

        <UsersSection
          title="Students & Instructors"
          description="Open a user to see their full profile, courses, and progress."
          roles={["student", "instructor"]}
          linkToDetails
          {...sharedSectionProps}
        />
      </div>

      {activeModal?.type === "add-admin" ? (
        <AddAdminModal
          onClose={() => setActiveModal(null)}
          onCreated={(user) => {
            setActiveModal(null);
            setNotice({ tone: "success", message: `Admin ${user.fullname} was created.` });
          }}
        />
      ) : null}

      {activeModal?.type === "edit" ? (
        <EditUserModal
          user={activeModal.user}
          isSelf={activeModal.user._id === currentUser?._id}
          onClose={() => setActiveModal(null)}
          onUpdated={(user) => {
            if (user._id === currentUser?._id) updateCurrentUser(user);
            setActiveModal(null);
            setNotice({ tone: "success", message: `${user.fullname} was updated.` });
          }}
        />
      ) : null}

      {activeModal?.type === "delete" ? (
        <DeleteUserModal
          user={activeModal.user}
          onClose={() => setActiveModal(null)}
          onDeleted={() => {
            const deletedName = activeModal.user.fullname;
            setActiveModal(null);
            setNotice({ tone: "success", message: `${deletedName} was deleted.` });
          }}
        />
      ) : null}
    </div>
  );
}
