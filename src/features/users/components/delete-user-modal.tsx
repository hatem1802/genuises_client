import type { FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/ui/modal";
import { FormActions, FormError } from "@/components/ui/form";
import { deleteUser } from "@/features/users/api";
import type { User } from "@/features/users/types";

type DeleteUserModalProps = {
  user: User;
  onClose: () => void;
  onDeleted: () => void;
};

export function DeleteUserModal({ user, onClose, onDeleted }: DeleteUserModalProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => deleteUser(user._id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      onDeleted();
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate();
  }

  return (
    <Modal title="Delete user" onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <p className="text-sm text-slate-700">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-slate-900">{user.fullname}</span> (
          {user.email})? This action cannot be undone.
        </p>

        <FormError message={mutation.error?.message ?? null} />

        <FormActions
          submitLabel="Delete user"
          pendingLabel="Deleting…"
          isPending={mutation.isPending}
          onCancel={onClose}
          variant="danger"
        />
      </form>
    </Modal>
  );
}
