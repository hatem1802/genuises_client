import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { getPaymentDocUrl } from "@/features/requests/api";
import type { EnrollmentRequest } from "@/features/requests/types";

type PaymentDocViewerProps = {
  request: EnrollmentRequest;
  onClose: () => void;
};

type DocKind = "image" | "pdf" | "other";

type ViewerState =
  | { status: "loading" }
  | { status: "ready"; objectUrl: string; kind: DocKind }
  | { status: "error"; message: string };

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function kindFrom(contentType: string, paymentDoc: string): DocKind {
  const type = contentType.split(";")[0].trim().toLowerCase();
  if (type === "application/pdf") return "pdf";
  if (IMAGE_TYPES.has(type)) return "image";

  const extension = paymentDoc.split(".").pop()?.toLowerCase();
  if (extension === "pdf") return "pdf";
  if (extension && ["jpg", "jpeg", "png", "webp", "gif"].includes(extension)) return "image";
  return "other";
}

export function PaymentDocViewer({ request, onClose }: PaymentDocViewerProps) {
  const url = getPaymentDocUrl(request.paymentDoc);
  const [state, setState] = useState<ViewerState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl: string | null = null;

    fetch(url, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("The payment document could not be loaded.");
        }
        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setState({ status: "ready", objectUrl, kind: kindFrom(blob.type, request.paymentDoc) });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setState({
          status: "error",
          message: "The payment document could not be loaded. The file may be missing on the server.",
        });
      });

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [request.paymentDoc, url]);

  const student = request.studentId?.fullname ?? "Deleted user";
  const course = request.courseId?.title ?? "Deleted course";

  return (
    <Modal title="Payment document" size="xl" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            <span className="font-medium text-slate-900">{student}</span>
            {" · "}
            {course}
          </p>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-sky-700 hover:underline"
          >
            Open in new tab
          </a>
        </div>

        <div className="flex min-h-[60vh] items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
          {state.status === "loading" ? (
            <p className="text-sm text-slate-500">Loading document…</p>
          ) : null}

          {state.status === "error" ? (
            <p className="max-w-md px-6 text-center text-sm text-red-700">{state.message}</p>
          ) : null}

          {state.status === "ready" && state.kind === "image" ? (
            <img
              src={state.objectUrl}
              alt={`Payment document from ${student}`}
              className="max-h-[70vh] w-full object-contain"
            />
          ) : null}

          {state.status === "ready" && state.kind === "pdf" ? (
            <iframe
              src={state.objectUrl}
              title={`Payment document from ${student}`}
              className="h-[70vh] w-full bg-white"
            />
          ) : null}

          {state.status === "ready" && state.kind === "other" ? (
            <p className="max-w-md px-6 text-center text-sm text-slate-600">
              This file type cannot be previewed here. Use “Open in new tab” to download it.
            </p>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
