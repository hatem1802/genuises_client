import type { FormEvent, ReactNode } from "react";
import { Modal } from "@/components/ui/modal";
import { FormActions, FormError } from "@/components/ui/form";

type ConfirmModalProps = {
  title: string;
  children: ReactNode;
  confirmLabel: string;
  pendingLabel: string;
  isPending: boolean;
  error: string | null;
  variant?: "primary" | "danger";
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmModal({
  title,
  children,
  confirmLabel,
  pendingLabel,
  isPending,
  error,
  variant = "primary",
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onConfirm();
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="text-sm text-slate-700">{children}</div>
        <FormError message={error} />
        <FormActions
          submitLabel={confirmLabel}
          pendingLabel={pendingLabel}
          isPending={isPending}
          onCancel={onClose}
          variant={variant}
        />
      </form>
    </Modal>
  );
}
