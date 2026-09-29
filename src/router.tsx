import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { isAdminAuthenticated } from "@/lib/auth";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminLoginPage } from "@/pages/admin/login";
import { AdminOverviewPage } from "@/pages/admin/overview";
import { AdminCoursesPage } from "@/pages/admin/courses";
import { AdminRequestsPage } from "@/pages/admin/requests";
import { AdminUsersPage } from "@/pages/admin/users";
import { AdminPackagesPage } from "@/pages/admin/packages";
import { AdminAccessCodesPage } from "@/pages/admin/access-codes";
import { AdminAccountPage } from "@/pages/admin/account";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({
      to: isAdminAuthenticated() ? "/admin" : "/admin/login",
    });
  },
});

const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/login",
  beforeLoad: () => {
    if (isAdminAuthenticated()) {
      throw redirect({ to: "/admin" });
    }
  },
  component: AdminLoginPage,
});

const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  beforeLoad: () => {
    if (!isAdminAuthenticated()) {
      throw redirect({ to: "/admin/login" });
    }
  },
  component: AdminLayout,
});

const adminIndexRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/",
  component: AdminOverviewPage,
});

const adminCoursesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/courses",
  component: AdminCoursesPage,
});

const adminRequestsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/requests",
  component: AdminRequestsPage,
});

const adminUsersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/users",
  component: AdminUsersPage,
});

const adminPackagesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/packages",
  component: AdminPackagesPage,
});

const adminAccessCodesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/access-codes",
  component: AdminAccessCodesPage,
});

const adminAccountRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/account",
  component: AdminAccountPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  adminLoginRoute,
  adminLayoutRoute.addChildren([
    adminIndexRoute,
    adminCoursesRoute,
    adminRequestsRoute,
    adminUsersRoute,
    adminPackagesRoute,
    adminAccessCodesRoute,
    adminAccountRoute,
  ]),
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
