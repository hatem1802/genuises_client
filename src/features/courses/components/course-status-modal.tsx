import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { changeCourseStatus } from "@/features/courses/api";
import { COURSE_STATUS_ACTION_META } from "@/features/courses/format";
import type { CourseStatusAction } from "@/features/courses/types";

type CourseStatusModalProps = {
  course: { _id: string; title: string };
  action: CourseStatusAction;
  onClose: () => void;
  onSuccess: (message: string) => void;
};

export function CourseStatusModal({ course, action, onClose, onSuccess }: CourseStatusModalProps) {
  const queryClient = useQueryClient();
  const meta = COURSE_STATUS_ACTION_META[action];

  const mutation = useMutation({
    mutationFn: () => changeCourseStatus(course._id, action),
    onSuccess: async (updated) => {
      await queryClient.invalidateQueries({ queryKey: ["courses"] });
      onSuccess(`"${updated.title}" was ${meta.success}.`);
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
      <p className="font-medium text-slate-900">{course.title}</p>
      <p className="mt-2">{meta.description}</p>
    </ConfirmModal>
  );
}
