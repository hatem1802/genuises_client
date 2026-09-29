import { AdminPageHeader } from "@/components/admin/admin-page-header";

export function AdminAccessCodesPage() {
  return (
    <div>
      <AdminPageHeader
        title="Access Codes"
        description="Generate access codes for courses."
      />
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <p className="text-sm text-slate-600">
          Access codes management will be available here.
        </p>
      </div>
    </div>
  );
}
