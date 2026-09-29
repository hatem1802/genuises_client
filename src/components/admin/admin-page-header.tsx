type AdminPageHeaderProps = {
  title: string;
  description: string;
};

export function AdminPageHeader({ title, description }: AdminPageHeaderProps) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
    </div>
  );
}
