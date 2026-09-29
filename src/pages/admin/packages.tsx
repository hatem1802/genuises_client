import { AdminPageHeader } from "@/components/admin/admin-page-header";

export function AdminPackagesPage() {
  return (
    <div>
      <AdminPageHeader
        title="Packages"
        description="Manage course packages and bundles."
      />
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <p className="text-sm text-slate-600">
          Packages management will be available here.
        </p>
      </div>
    </div>
  );
}
