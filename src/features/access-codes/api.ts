import { apiFetch, type ApiResponse } from "@/lib/api";
import type {
  AccessCodesQuery,
  AccessCodesResult,
  GeneratedAccessCode,
} from "@/features/access-codes/types";

export async function generateAccessCodes(input: { courseId: string; count: number }) {
  const response = await apiFetch<ApiResponse<GeneratedAccessCode[]>>("/access-codes/generate", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.data;
}

export async function fetchAccessCodes(query: AccessCodesQuery) {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(query.limit),
  });

  if (query.status) params.set("status", query.status);
  if (query.courseId) params.set("courseId", query.courseId);
  if (query.studentId) params.set("studentId", query.studentId);
  if (query.search) params.set("search", query.search);

  const response = await apiFetch<ApiResponse<AccessCodesResult>>(
    `/access-codes?${params.toString()}`
  );
  return response.data;
}

export function downloadCodesCsv(filename: string, rows: { code: string; course: string }[]) {
  const lines = [
    ["code", "course"],
    ...rows.map((row) => [row.code, row.course]),
  ];
  const csv = lines
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
