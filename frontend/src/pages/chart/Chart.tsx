import { useMemo } from "react";
import { Link, useSearchParams } from "react-router";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TrendBarChart from "@/components/TrendBarChart";
import CategoryPieChart from "@/components/CategoryPieChart";
import SummaryCards from "@/components/SummaryCards";
import { useCategories } from "@/hooks/category";
import { useCategoryBreakdown, useExpenseTrend } from "@/hooks/expense";
import { RANGES, getRange, type RangeKey } from "@/lib/date";

const RANGE_KEYS = Object.keys(RANGES) as RangeKey[];

const Chart = () => {
  const [params, setParams] = useSearchParams();

  const rangeParam = params.get("range");
  const rangeKey: RangeKey = RANGE_KEYS.includes(rangeParam as RangeKey)
    ? (rangeParam as RangeKey)
    : "1m";
  const categoryId = params.get("categoryId") ?? undefined;

  // range yahan se from & to generate karta hai
  const range = useMemo(() => getRange(rangeKey), [rangeKey]);

  const { data: trend, isLoading: trendLoading } = useExpenseTrend(
    range,
    categoryId,
  );
  const { data: breakdown, isLoading: breakdownLoading } =
    useCategoryBreakdown(range);
  const { data: categories = [] } = useCategories();

  const updateParams = (patch: { range?: string; categoryId?: string }) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const [key, value] of Object.entries(patch)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
      return next;
    });

  return (
    <div className="flex flex-col gap-6 px-5 pb-10">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link to="/">
            <ArrowLeftIcon className="size-4" />
            Back
          </Link>
        </Button>

        <Tabs
          value={rangeKey}
          onValueChange={(v) => updateParams({ range: v })}
        >
          <TabsList>
            <TabsTrigger value="7d">7D</TabsTrigger>
            <TabsTrigger value="1m">1M</TabsTrigger>
            <TabsTrigger value="3m">3M</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="-mx-5">
        <SummaryCards range={range} />
      </div>

      <TrendBarChart
        items={trend?.items}
        unit={trend?.unit}
        isLoading={trendLoading}
        categories={categories}
        categoryId={categoryId}
        onCategoryChange={(id) => updateParams({ categoryId: id })}
      />

      <CategoryPieChart
        items={breakdown?.items}
        isLoading={breakdownLoading}
        description={`${range.from} to ${range.to}`}
      />
    </div>
  );
};

export default Chart;
