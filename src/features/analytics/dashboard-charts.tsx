import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { fetchPlatformOverview } from "@/features/analytics/api";
import type { PlatformOverview } from "@/features/analytics/types";

const fontFamily = "system-ui, sans-serif";

const baseChart: ApexOptions["chart"] = {
  fontFamily,
  toolbar: { show: false },
  zoom: { enabled: false },
  animations: { easing: "easeinout", speed: 400 },
};

const baseGrid: ApexOptions["grid"] = {
  borderColor: "#e2e8f0",
  strokeDashArray: 4,
};

function ChartCard({
  title,
  description,
  children,
  className = "",
}: {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white p-5 ${className}`}>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <p className="flex h-[280px] items-center justify-center text-sm text-slate-500">{message}</p>
  );
}

function activityOptions(months: string[]): ApexOptions {
  return {
    chart: { ...baseChart, type: "area" },
    colors: ["#0284c7"],
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 0.4, opacityFrom: 0.35, opacityTo: 0.05 },
    },
    dataLabels: { enabled: false },
    grid: baseGrid,
    xaxis: {
      categories: months,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      title: { text: "Enrollments" },
      labels: { style: { colors: "#64748b" } },
    },
    legend: { show: false },
  };
}

function subscriptionOptions(labels: string[]): ApexOptions {
  return {
    chart: { ...baseChart, type: "donut" },
    labels,
    colors: ["#059669", "#94a3b8", "#e11d48"],
    stroke: { width: 0 },
    dataLabels: { enabled: false },
    legend: { position: "bottom" },
    plotOptions: {
      pie: {
        donut: {
          size: "68%",
          labels: {
            show: true,
            total: { show: true, label: "Total", fontFamily, color: "#64748b" },
          },
        },
      },
    },
  };
}

function coursesOptions(titles: string[]): ApexOptions {
  return {
    chart: { ...baseChart, type: "bar" },
    colors: ["#0f172a"],
    plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: "55%" } },
    dataLabels: { enabled: false },
    grid: { ...baseGrid, xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } },
    xaxis: {
      categories: titles,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { colors: "#334155" } } },
    tooltip: { y: { formatter: (value) => `${value} students` } },
  };
}

function requestsOptions(labels: string[]): ApexOptions {
  return {
    chart: { ...baseChart, type: "bar" },
    colors: ["#059669", "#d97706", "#0284c7", "#e11d48"],
    plotOptions: { bar: { borderRadius: 4, columnWidth: "48%", distributed: true } },
    dataLabels: { enabled: false },
    grid: baseGrid,
    legend: { show: false },
    xaxis: {
      categories: labels,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { min: 0, labels: { style: { colors: "#64748b" } } },
  };
}

function OverviewCharts({ data }: { data: PlatformOverview }) {
  const requestsTotal = data.requestBreakdown.values.reduce((sum, value) => sum + value, 0);
  const hasEnrollments = data.monthlyActivity.enrollments.some((value) => value > 0);
  const hasSubscriptions = data.subscriptionBreakdown.values.some((value) => value > 0);
  const hasCourses = data.topCourses.titles.length > 0;
  const hasRequests = requestsTotal > 0;

  const summaryCards = [
    { label: "Students", value: data.summary.students.toLocaleString("en-US") },
    { label: "Active subscriptions", value: data.summary.activeSubscriptions.toLocaleString("en-US") },
    { label: "Published courses", value: String(data.summary.publishedCourses) },
    { label: "Enrollment requests", value: requestsTotal.toLocaleString("en-US") },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard
          className="xl:col-span-2"
          title="Enrollments"
          description="New subscriptions over the last six months."
        >
          {hasEnrollments ? (
            <Chart
              type="area"
              height={300}
              width="100%"
              series={[{ name: "Enrollments", data: data.monthlyActivity.enrollments }]}
              options={activityOptions(data.monthlyActivity.months)}
            />
          ) : (
            <EmptyChart message="No enrollments in the last six months." />
          )}
        </ChartCard>

        <ChartCard title="Subscriptions" description="How current enrollments are split by status.">
          {hasSubscriptions ? (
            <Chart
              type="donut"
              height={300}
              width="100%"
              series={data.subscriptionBreakdown.values}
              options={subscriptionOptions(data.subscriptionBreakdown.labels)}
            />
          ) : (
            <EmptyChart message="No subscriptions yet." />
          )}
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Top courses" description="Courses with the most enrolled students.">
          {hasCourses ? (
            <Chart
              type="bar"
              height={280}
              width="100%"
              series={[{ name: "Students", data: data.topCourses.students }]}
              options={coursesOptions(data.topCourses.titles)}
            />
          ) : (
            <EmptyChart message="No course enrollments yet." />
          )}
        </ChartCard>

        <ChartCard title="Enrollment requests" description="Payment requests grouped by review outcome.">
          {hasRequests ? (
            <Chart
              type="bar"
              height={280}
              width="100%"
              series={[{ name: "Requests", data: data.requestBreakdown.values }]}
              options={requestsOptions(data.requestBreakdown.labels)}
            />
          ) : (
            <EmptyChart message="No enrollment requests yet." />
          )}
        </ChartCard>
      </div>
    </div>
  );
}

export function DashboardCharts() {
  const overviewQuery = useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: fetchPlatformOverview,
  });

  if (overviewQuery.isPending) {
    return <p className="py-16 text-center text-sm text-slate-500">Loading analytics…</p>;
  }

  if (overviewQuery.isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center">
        <p className="text-sm text-red-700">{overviewQuery.error.message}</p>
        <button
          type="button"
          onClick={() => void overviewQuery.refetch()}
          className="mt-3 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          Try again
        </button>
      </div>
    );
  }

  return <OverviewCharts data={overviewQuery.data} />;
}
