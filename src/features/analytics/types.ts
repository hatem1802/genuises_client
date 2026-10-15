export type AnalyticsBreakdown = {
  labels: string[];
  values: number[];
};

export type PlatformOverview = {
  summary: {
    students: number;
    activeSubscriptions: number;
    publishedCourses: number;
  };
  monthlyActivity: {
    months: string[];
    enrollments: number[];
  };
  subscriptionBreakdown: AnalyticsBreakdown;
  topCourses: {
    ids: string[];
    titles: string[];
    students: number[];
  };
  requestBreakdown: AnalyticsBreakdown;
};
