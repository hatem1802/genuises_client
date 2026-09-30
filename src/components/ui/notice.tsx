import type { ReactNode } from "react";

export type NoticeState = { tone: "success" | "error"; message: ReactNode } | null;

type NoticeProps = {
  notice: NoticeState;
  onDismiss: () => void;
};

export function Notice({ notice, onDismiss }: NoticeProps) {
  if (!notice) return null;

  return (
    <div
      role="status"
      className={`mb-4 flex items-center justify-between rounded-lg border px-4 py-2.5 text-sm ${
        notice.tone === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      <div>{notice.message}</div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="ml-4 text-base leading-none opacity-70 hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
}
