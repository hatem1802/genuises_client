import { useQuery } from "@tanstack/react-query";
import { fetchAdminCourses } from "@/features/courses/api";

export function useCourseOptions() {
  const query = useQuery({
    queryKey: ["courses", "options"],
    queryFn: () => fetchAdminCourses({ page: 1, limit: 100 }),
  });

  return {
    courses: query.data?.courses ?? [],
    isLoading: query.isPending,
    error: query.error,
  };
}
