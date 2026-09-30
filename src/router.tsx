import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  lazyRouteComponent,
  redirect,
} from "@tanstack/react-router";
import { PageLoader } from "@/components/ui/page-loader";
import { isAdminAuthenticated } from "@/lib/auth";

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
  component: lazyRouteComponent(() => import("@/pages/admin/login"), "AdminLoginPage"),
});

const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  beforeLoad: () => {
    if (!isAdminAuthenticated()) {
      throw redirect({ to: "/admin/login" });
    }
  },
  component: lazyRouteComponent(() => import("@/components/admin/admin-layout"), "AdminLayout"),
});

const adminIndexRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/",
  component: lazyRouteComponent(() => import("@/pages/admin/overview"), "AdminOverviewPage"),
});

const adminCoursesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/courses",
  component: lazyRouteComponent(() => import("@/pages/admin/courses"), "AdminCoursesPage"),
});

const adminCourseNewRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/courses/new",
  component: lazyRouteComponent(() => import("@/pages/admin/course-new"), "AdminCourseNewPage"),
});

const adminCourseDetailsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/courses/$courseId",
  component: lazyRouteComponent(
    () => import("@/pages/admin/course-details"),
    "AdminCourseDetailsPage"
  ),
});

const adminRequestsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/requests",
  component: lazyRouteComponent(() => import("@/pages/admin/requests"), "AdminRequestsPage"),
});

const adminUsersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/users",
  component: lazyRouteComponent(() => import("@/pages/admin/users"), "AdminUsersPage"),
});

const adminUserDetailsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/users/$userId",
  component: lazyRouteComponent(
    () => import("@/pages/admin/user-details"),
    "AdminUserDetailsPage"
  ),
});

const adminPackagesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/packages",
  component: lazyRouteComponent(() => import("@/pages/admin/packages"), "AdminPackagesPage"),
});

const adminAccessCodesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/access-codes",
  validateSearch: (search: Record<string, unknown>): { courseId?: string } => ({
    courseId: typeof search.courseId === "string" ? search.courseId : undefined,
  }),
  component: lazyRouteComponent(
    () => import("@/pages/admin/access-codes"),
    "AdminAccessCodesPage"
  ),
});

const adminAccountRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/account",
  component: lazyRouteComponent(() => import("@/pages/admin/account"), "AdminAccountPage"),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  adminLoginRoute,
  adminLayoutRoute.addChildren([
    adminIndexRoute,
    adminCoursesRoute,
    adminCourseNewRoute,
    adminCourseDetailsRoute,
    adminRequestsRoute,
    adminUsersRoute,
    adminUserDetailsRoute,
    adminPackagesRoute,
    adminAccessCodesRoute,
    adminAccountRoute,
  ]),
]);

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPendingComponent: PageLoader,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
