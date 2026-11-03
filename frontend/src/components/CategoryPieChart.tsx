import { Pie, PieChart as RechartsPieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import Loader from "@/components/Loader";
import { formatINR } from "@/lib/utils";
import type { CategoryBreakdownResponse } from "@/@types";

const MAX_SLICES = 6;

const chartConfig = {
  total: { label: "Spent" },
} satisfies ChartConfig;

type Props = {
  items?: CategoryBreakdownResponse["items"];
  isLoading?: boolean;
  description?: string;
};

// backend total ke hisaab se pehle se sorted bhejta hai (bada pehle)
const toSlices = (items: CategoryBreakdownResponse["items"]) => {
  const slices = items.map((i) => ({
    name: i.name,
    total: Number(i.total), // sirf display ke liye
    fill: i.color,
  }));
  if (slices.length <= MAX_SLICES) return slices;

  const top = slices.slice(0, MAX_SLICES - 1);
  const others = slices
    .slice(MAX_SLICES - 1)
    .reduce((sum, s) => sum + s.total, 0);
  return [...top, { name: "Others", total: others, fill: "#9ca3af" }];
};

const CategoryPieChart = ({ items = [], isLoading, description }: Props) => {
  const slices = toSlices(items);
  const grandTotal = slices.reduce((sum, s) => sum + s.total, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by category</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <Loader label="Loading chart..." className="mt-6" />
        ) : slices.length === 0 ? (
          <p className="text-muted-foreground py-10 text-center text-sm">
            No expenses in this period.
          </p>
        ) : (
          <>
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-64"
            >
              <RechartsPieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      hideLabel
                      nameKey="name"
                      formatter={(value, name, item) => (
                        <div className="flex w-full items-center justify-between gap-4">
                          <span className="flex items-center gap-2">
                            <span
                              className="size-2.5 rounded-full"
                              style={{ backgroundColor: item.payload.fill }}
                            />
                            {name}
                          </span>
                          <span className="font-medium tabular-nums">
                            {formatINR(Number(value))}
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Pie
                  data={slices}
                  dataKey="total"
                  nameKey="name"
                  innerRadius={60}
                  strokeWidth={2}
                />
              </RechartsPieChart>
            </ChartContainer>

            <ul className="mt-4 space-y-2">
              {slices.map((s) => (
                <li
                  key={s.name}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: s.fill }}
                    />
                    {s.name}
                  </span>
                  <span className="text-muted-foreground tabular-nums">
                    {formatINR(s.total)} ·{" "}
                    {Math.round((s.total / grandTotal) * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryPieChart;
