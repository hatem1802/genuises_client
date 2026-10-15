import { Link } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DashboardCharts } from "@/features/analytics/dashboard-charts";

const sections = [
  {
    to: "/admin/courses",
    title: "Courses",
    description: "Create and manage academy courses.",
  },
  {
    to: "/admin/requests",
    title: "Requests",
    description: "Review enrollment and payment requests.",
  },
  {
    to: "/admin/users",
    title: "Users",
    description: "Manage admins, instructors, and students.",
  },
  {
    to: "/admin/subscriptions",
    title: "Subscriptions",
    description: "Review enrollments, access codes, and student progress.",
  },
  {
    to: "/admin/packages",
    title: "Packages",
    description: "Manage course packages and bundles.",
  },
  {
    to: "/admin/access-codes",
    title: "Access Codes",
    description: "Generate course access codes.",
  },
] as const;

export function AdminOverviewPage() {
  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="Platform analytics for students, courses, subscriptions, and requests."
      />

      <DashboardCharts />

      <h3 className="mb-3 mt-8 text-base font-semibold text-slate-900">Manage</h3>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sections.map((section) => (
          <Link
            key={section.to}
            to={section.to}
            className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm"
          >
            <h3 className="text-base font-semibold text-slate-900">
              {section.title}
            </h3>
            <p className="mt-2 text-sm text-slate-600">{section.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
