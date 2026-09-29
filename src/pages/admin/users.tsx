import { AdminPageHeader } from "@/components/admin/admin-page-header";

export function AdminUsersPage() {
  return (
    <div>
      <AdminPageHeader
        title="Users"
        description="Manage admins, instructors, and students."
      />
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <p className="text-sm text-slate-600">
          Users management will be available here.
        </p>
      </div>
    </div>
  );
}
