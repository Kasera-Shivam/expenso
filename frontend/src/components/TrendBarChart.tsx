import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Loader from "@/components/Loader";
import { formatINR } from "@/lib/utils";
import type { Category, ExpenseTrendResponse } from "@/@types";

const chartConfig = {
  total: { label: "Spent", color: "var(--chart-1)" },
} satisfies ChartConfig;

// bina "Z" ke parse karo (local time), warna ek din aage-peeche dikh sakta hai
const parse = (date: string) => new Date(`${date}T00:00:00`);
const short = (d: Date) =>
  d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

const compact = new Intl.NumberFormat("en-IN", {
  notation: "compact",
  maximumFractionDigits: 1,
});

type Props = {
  items?: ExpenseTrendResponse["items"];
  unit?: ExpenseTrendResponse["unit"];
  isLoading?: boolean;
  categories: Category[];
  categoryId?: string;
  onCategoryChange: (id?: string) => void;
};

const TrendBarChart = ({
  items = [],
  unit = "day",
  isLoading,
  categories,
  categoryId,
  onCategoryChange,
}: Props) => {
  // recharts ko number chahiye, ye sirf display ke liye hai
  const data = items.map((i) => ({ date: i.date, total: Number(i.total) }));
  const isEmpty = data.every((d) => d.total === 0);

  // weekly bar ka label: "26 Oct – 1 Nov"
  const tooltipLabel = (date: string) => {
    const start = parse(date);
    if (unit === "day") return short(start);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${short(start)} – ${short(end)}`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle>Spending trend</CardTitle>
          <CardDescription>
            {unit === "day" ? "Daily totals" : "Weekly totals"}
          </CardDescription>
        </div>

        <Select
          value={categoryId ?? "all"}
          onValueChange={(v) => onCategoryChange(v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <Loader label="Loading chart..." className="mt-6" />
        ) : isEmpty ? (
          <p className="text-muted-foreground py-10 text-center text-sm">
            No expenses in this period.
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <RechartsBarChart data={data} margin={{ left: 0, right: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={24}
                tickFormatter={(v: string) => short(parse(v))}
              />
              <YAxis
                width={44}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `₹${compact.format(v)}`}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) =>
                      tooltipLabel(String(payload?.[0]?.payload?.date))
                    }
                    formatter={(value) => (
                      <span className="font-medium tabular-nums">
                        {formatINR(Number(value))}
                      </span>
                    )}
                  />
                }
              />
              <Bar dataKey="total" fill="var(--color-total)" radius={4} />
            </RechartsBarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default TrendBarChart;
