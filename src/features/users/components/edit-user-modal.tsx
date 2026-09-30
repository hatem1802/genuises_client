import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/ui/modal";
import { Field, FormActions, FormError, inputClassName } from "@/components/ui/form";
import type { UserRole } from "@/features/admin/types";
import { updateUser } from "@/features/users/api";
import { formatRole, formatStatus } from "@/features/users/format";
import {
  USER_ROLES,
  USER_STATUSES,
  type UpdateUserInput,
  type User,
  type UserStatus,
} from "@/features/users/types";

type EditUserModalProps = {
  user: User;
  isSelf: boolean;
  onClose: () => void;
  onUpdated: (user: User) => void;
};

export function EditUserModal({ user, isSelf, onClose, onUpdated }: EditUserModalProps) {
  const queryClient = useQueryClient();
  const [fullname, setFullname] = useState(user.fullname);
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState<UserRole>(user.role);
  const [status, setStatus] = useState<UserStatus>(user.status);
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (input: UpdateUserInput) => updateUser(user._id, input),
    onSuccess: async (updated) => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      onUpdated(updated);
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const changes: UpdateUserInput = {};
    if (fullname.trim() !== user.fullname) changes.fullname = fullname.trim();
    if (username.trim() !== user.username) changes.username = username.trim();
    if (email.trim().toLowerCase() !== user.email) changes.email = email.trim();
    if (!isSelf && role !== user.role) changes.role = role;
    if (!isSelf && status !== user.status) changes.status = status;
    if (password) changes.password = password;

    if (Object.keys(changes).length === 0) {
      setFormError("No changes to save.");
      return;
    }

    setFormError(null);
    mutation.mutate(changes);
  }

  return (
    <Modal title={`Edit ${user.fullname}`} onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Field label="Full name">
          <input
            required
            minLength={2}
            maxLength={100}
            value={fullname}
            onChange={(event) => setFullname(event.target.value)}
            className={inputClassName}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Username">
            <input
              required
              minLength={3}
              maxLength={30}
              pattern="[a-zA-Z0-9._\-]+"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className={inputClassName}
            />
          </Field>

          <Field label="Email">
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClassName}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Role" hint={isSelf ? "You cannot change your own role." : undefined}>
            <select
              value={role}
              disabled={isSelf}
              onChange={(event) => setRole(event.target.value as UserRole)}
              className={inputClassName}
            >
              {USER_ROLES.map((option) => (
                <option key={option} value={option}>
                  {formatRole(option)}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Status"
            hint={isSelf ? "You cannot change your own status." : undefined}
          >
            <select
              value={status}
              disabled={isSelf}
              onChange={(event) => setStatus(event.target.value as UserStatus)}
              className={inputClassName}
            >
              {USER_STATUSES.map((option) => (
                <option key={option} value={option}>
                  {formatStatus(option)}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="New password" hint="Leave empty to keep the current password.">
          <input
            type="password"
            minLength={6}
            maxLength={128}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClassName}
          />
        </Field>

        <FormError message={formError ?? mutation.error?.message ?? null} />

        <FormActions
          submitLabel="Save changes"
          pendingLabel="Saving…"
          isPending={mutation.isPending}
          onCancel={onClose}
        />
      </form>
    </Modal>
  );
}
