import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { runSubscriptionAction } from "@/features/subscriptions/api";
import { SUBSCRIPTION_ACTION_META } from "@/features/subscriptions/format";
import type { Subscription, SubscriptionAction } from "@/features/subscriptions/types";

type SubscriptionActionModalProps = {
  subscription: Subscription;
  action: SubscriptionAction;
  onClose: () => void;
  onSuccess: (message: string) => void;
};

export function SubscriptionActionModal({
  subscription,
  action,
  onClose,
  onSuccess,
}: SubscriptionActionModalProps) {
  const queryClient = useQueryClient();
  const meta = SUBSCRIPTION_ACTION_META[action];
  const student = subscription.student.fullname ?? "Student";
  const course = subscription.course.title;

  const mutation = useMutation({
    mutationFn: () => runSubscriptionAction(subscription._id, action),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["subscriptions"] }),
        queryClient.invalidateQueries({ queryKey: ["courses"] }),
      ]);
      onSuccess(`${student}'s subscription to "${course}" was ${meta.success}.`);
    },
  });

  return (
    <ConfirmModal
      title={meta.title}
      confirmLabel={meta.confirmLabel}
      pendingLabel={meta.pendingLabel}
      variant={meta.variant}
      isPending={mutation.isPending}
      error={mutation.error?.message ?? null}
      onConfirm={() => mutation.mutate()}
      onClose={onClose}
    >
      <p>
        <span className="font-semibold text-slate-900">{student}</span>
        {" · "}
        <span className="font-semibold text-slate-900">{course}</span>
      </p>
      <p className="mt-2">{meta.description}</p>
    </ConfirmModal>
  );
}
