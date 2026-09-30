export function PageLoader() {
  return (
    <div role="status" className="flex justify-center py-16">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
