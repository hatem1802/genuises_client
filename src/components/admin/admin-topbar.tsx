import { Link, useNavigate } from "@tanstack/react-router";
import { getUserImageUrl } from "@/features/admin/types";
import { useAuth } from "@/providers/auth-provider";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function AdminTopbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const displayName = user?.fullname || user?.username || "Admin";
  const role = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Admin";
  const imageUrl = getUserImageUrl(user);

  function handleLogout() {
    logout();
    void navigate({ to: "/admin/login" });
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <h1 className="text-sm font-medium text-slate-500">Admin Dashboard</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={displayName}
              className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-200"
            />
          ) : (
            <div
              aria-hidden
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white"
            >
              {getInitials(displayName) || "A"}
            </div>
          )}

          <div className="leading-tight">
            <p className="text-sm font-semibold text-slate-900">{displayName}</p>
            <p className="text-xs text-slate-500">{role}</p>
          </div>
        </div>

        <div className="h-8 w-px bg-slate-200" />

        <Link
          to="/admin/account"
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
        >
          Account
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
