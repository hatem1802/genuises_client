import { Link, useRouterState } from "@tanstack/react-router";

const navItems: Array<{ to: string; label: string; exact?: boolean }> = [
  { to: "/admin", label: "Dashboard", exact: true },
  { to: "/admin/courses", label: "Courses" },
  { to: "/admin/requests", label: "Requests" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/packages", label: "Packages" },
  { to: "/admin/access-codes", label: "Access Codes" },
];

export function AdminSidebar() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 px-5 py-5">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
          Academy of Geniuses
        </p>
        <p className="mt-1 text-lg font-semibold text-white">Admin Panel</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.to
            : pathname === item.to || pathname.startsWith(`${item.to}/`);

          return (
            <Link
              key={item.to}
              to={item.to}
              className={[
                "rounded-lg px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-slate-800 text-white"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
