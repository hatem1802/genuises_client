import { apiFetch, type ApiResponse } from "@/lib/api";
import type { AccessCode, AccessCodeBatch } from "@/features/access-codes/types";

export async function generateAccessCodes(input: { courseId: string; count: number }) {
  const response = await apiFetch<ApiResponse<AccessCode[]>>("/access-codes/generate", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.data;
}

const BATCHES_KEY = "adminAccessCodeBatches";
const MAX_BATCHES = 20;

export function getSavedBatches(): AccessCodeBatch[] {
  try {
    const raw = localStorage.getItem(BATCHES_KEY);
    return raw ? (JSON.parse(raw) as AccessCodeBatch[]) : [];
  } catch {
    return [];
  }
}

export function saveBatches(batches: AccessCodeBatch[]) {
  localStorage.setItem(BATCHES_KEY, JSON.stringify(batches.slice(0, MAX_BATCHES)));
}

export function downloadBatchCsv(batch: AccessCodeBatch) {
  const rows = [
    ["code", "courseId", "courseTitle", "generatedAt"],
    ...batch.codes.map((code) => [code, batch.courseId, batch.courseTitle ?? "", batch.createdAt]),
  ];
  const csv = rows
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `access-codes-${batch.courseId}-${batch.createdAt.slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
