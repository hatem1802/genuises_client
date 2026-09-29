import { useEffect, useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { loginAdmin } from "@/features/admin/api";
import { useAuth } from "@/providers/auth-provider";
import { ApiError } from "@/lib/api";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const { isAuthenticated, loginSuccess } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!isAuthenticated) return;
    void navigate({ to: "/admin", replace: true });
  }, [isAuthenticated, navigate]);

  const mutation = useMutation({
    mutationFn: loginAdmin,
    onSuccess: async (session) => {
      loginSuccess(session);
      await router.navigate({ to: "/admin", replace: true });
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate({ email: email.trim(), password });
  }

  const errorMessage =
    mutation.error instanceof ApiError || mutation.error instanceof Error
      ? mutation.error.message
      : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            Academy of Geniuses
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            Admin Login
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign in with your admin account to access the dashboard.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-slate-400 focus:ring-2"
              placeholder="admin@test.com"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-slate-400 focus:ring-2"
              placeholder="••••••••"
            />
          </label>

          {errorMessage ? (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {mutation.isPending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
