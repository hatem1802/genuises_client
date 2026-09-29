import { AdminPageHeader } from "@/components/admin/admin-page-header";

export function AdminRequestsPage() {
  return (
    <div>
      <AdminPageHeader
        title="Requests"
        description="Review, approve, reject, or return enrollment requests."
      />
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <p className="text-sm text-slate-600">
          Requests management will be available here.
        </p>
      </div>
    </div>
  );
}
