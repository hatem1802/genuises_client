import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/ui/modal";
import { Field, FormActions, FormError, inputClassName } from "@/components/ui/form";
import { createAdmin } from "@/features/users/api";
import type { User } from "@/features/users/types";

type AddAdminModalProps = {
  onClose: () => void;
  onCreated: (user: User) => void;
};

export function AddAdminModal({ onClose, onCreated }: AddAdminModalProps) {
  const queryClient = useQueryClient();
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: createAdmin,
    onSuccess: async (user) => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      onCreated(user);
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setFormError(null);
    mutation.mutate({
      fullname: fullname.trim(),
      username: username.trim(),
      email: email.trim(),
      password,
    });
  }

  return (
    <Modal title="Add new admin" onClose={onClose}>
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

        <Field
          label="Username"
          hint="3-30 characters: letters, numbers, dots, underscores, or hyphens."
        >
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
            autoComplete="off"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClassName}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Password" hint="At least 6 characters.">
            <input
              type="password"
              required
              minLength={6}
              maxLength={128}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClassName}
            />
          </Field>

          <Field label="Confirm password">
            <input
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className={inputClassName}
            />
          </Field>
        </div>

        <FormError message={formError ?? mutation.error?.message ?? null} />

        <FormActions
          submitLabel="Create admin"
          pendingLabel="Creating…"
          isPending={mutation.isPending}
          onCancel={onClose}
        />
      </form>
    </Modal>
  );
}
