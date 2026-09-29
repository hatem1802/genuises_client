import { getUserImageUrl } from "@/features/admin/types";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { useAuth } from "@/providers/auth-provider";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-slate-100 py-4 sm:grid-cols-[160px_1fr] sm:items-center">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-900">{value}</dd>
    </div>
  );
}

export function AdminAccountPage() {
  const { user } = useAuth();
  const displayName = user?.fullname || "—";
  const role = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "—";
  const imageUrl = getUserImageUrl(user);

  return (
    <div>
      <AdminPageHeader
        title="Account"
        description="Your admin profile details."
      />

      <div className="max-w-2xl rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-6 flex items-center gap-4">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={displayName}
              className="h-16 w-16 rounded-full object-cover ring-1 ring-slate-200"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-lg font-semibold text-white">
              {displayName
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase() ?? "")
                .join("") || "A"}
            </div>
          )}
          <div>
            <p className="text-lg font-semibold text-slate-900">{displayName}</p>
            <p className="text-sm text-slate-500">{role}</p>
          </div>
        </div>

        <dl>
          <DetailRow label="Full name" value={user?.fullname || "—"} />
          <DetailRow label="Username" value={user?.username || "—"} />
          <DetailRow label="Email" value={user?.email || "—"} />
          <DetailRow label="Role" value={role} />
          <DetailRow label="User ID" value={user?._id || "—"} />
        </dl>
      </div>
    </div>
  );
}
