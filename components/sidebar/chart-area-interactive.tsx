"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

export const description = "An interactive area chart";

const dummyEnrollmentData = [
  { date: "2024-05-01", enrollments: "14" },
  { date: "2024-05-02", enrollments: "9" },
  { date: "2024-05-03", enrollments: "17" },
  { date: "2024-05-04", enrollments: "21" },
  { date: "2024-05-05", enrollments: "11" },
  { date: "2024-05-06", enrollments: "24" },
  { date: "2024-05-07", enrollments: "8" },
  { date: "2024-05-08", enrollments: "32" },
  { date: "2024-05-09", enrollments: "19" },
  { date: "2024-05-10", enrollments: "5" },
  { date: "2024-05-11", enrollments: "13" },
  { date: "2024-05-12", enrollments: "26" },
  { date: "2024-05-13", enrollments: "12" },
  { date: "2024-05-14", enrollments: "34" },
  { date: "2024-05-15", enrollments: "12" },
  { date: "2024-05-16", enrollments: "7" },
  { date: "2024-05-17", enrollments: "18" },
  { date: "2024-05-18", enrollments: "40" },
  { date: "2024-05-19", enrollments: "22" },
  { date: "2024-05-20", enrollments: "16" },
  { date: "2024-05-21", enrollments: "27" },
  { date: "2024-05-22", enrollments: "15" },
  { date: "2024-05-23", enrollments: "6" },
  { date: "2024-05-24", enrollments: "20" },
  { date: "2024-05-25", enrollments: "10" },
  { date: "2024-05-26", enrollments: "8" },
  { date: "2024-05-27", enrollments: "30" },
  { date: "2024-05-28", enrollments: "19" },
  { date: "2024-05-29", enrollments: "23" },
  { date: "2024-05-30", enrollments: "21" },
  { date: "2024-05-31", enrollments: "38" }
];

const chartsConfig = {
  enrollments: {
    label: "Enrollements",
    color: "var(--chart-1)"
  }
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Total Enrollements</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total Enrollements for the last 30 days: 1200
          </span>
          <span className="@[540px]/card:hidden">Last 30 days: 1200</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="p-x-2 pt-4 sm:px-6 sm:pt-4">
        <ChartContainer
          className="aspect-auto h-[250px] w-full"
          config={chartsConfig}
        >
          <BarChart
            data={dummyEnrollmentData}
            margin={{
              left: 12,
              right: 12
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={"preserveStartEnd"}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric"
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric"
                    });
                  }}
                />
              }
            />
            <Bar dataKey={"enrollments"} fill="var(--color-enrollments)" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
