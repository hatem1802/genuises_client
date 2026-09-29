import { AdminPageHeader } from "@/components/admin/admin-page-header";

export function AdminCoursesPage() {
  return (
    <div>
      <AdminPageHeader
        title="Courses"
        description="Manage published and pending courses."
      />
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <p className="text-sm text-slate-600">
          Courses management will be available here.
        </p>
      </div>
    </div>
  );
}
