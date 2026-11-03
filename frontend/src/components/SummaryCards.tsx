import {
  ReceiptIcon,
  TagIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  WalletIcon,
} from "lucide-react";
import { useExpenseSummary } from "@/hooks/expense";
import { cn, formatINR } from "@/lib/utils";
import StatCard from "./StatCard";

interface Props {
  range?: {
    from: string;
    to: string;
  };
}

const SummaryCards = ({ range }: Props) => {
  const { data: summary, isLoading } = useExpenseSummary(range);

  const days = summary?.days ?? 30;
  const current = Number(summary?.total ?? 0);
  const previous = Number(summary?.previousTotal ?? 0);
  const change = previous > 0 ? ((current - previous) / previous) * 100 : null;
  const isIncreased = change !== null && change > 0;

  return (
    <div className="flex w-full scrollbar-none gap-4 overflow-x-auto px-5 pb-4">
      <StatCard title="Total Spent" icon={WalletIcon} isLoading={isLoading}>
        <div className="text-2xl font-bold tracking-tight text-zinc-100 tabular-nums">
          {formatINR(current)}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-xs">
          {change !== null && (
            <span
              className={cn(
                "inline-flex items-center font-medium",
                isIncreased ? "text-rose-400" : "text-emerald-400",
              )}
            >
              {isIncreased ? (
                <TrendingUpIcon className="mr-0.5 size-3.5" />
              ) : (
                <TrendingDownIcon className="mr-0.5 size-3.5" />
              )}
              {Math.abs(change).toFixed(1)}%
            </span>
          )}
          <span className="text-zinc-500">vs previous {days} days</span>
        </div>
      </StatCard>

      <StatCard title="Expenses" icon={ReceiptIcon} isLoading={isLoading}>
        <div className="text-2xl font-bold tracking-tight text-zinc-100 tabular-nums">
          {summary?.count ?? 0}
        </div>
        <div className="mt-1 text-xs text-zinc-500">
          Recorded in last {days} days
        </div>
      </StatCard>

      <StatCard title="Top Category" icon={TagIcon} isLoading={isLoading}>
        <div className="flex items-center gap-2">
          <span
            className="size-2.5 rounded-full"
            style={{
              backgroundColor: summary?.topCategory?.color ?? "#10b981",
            }}
          />
          <span className="truncate text-lg font-bold tracking-tight text-zinc-100">
            {summary?.topCategory?.name ?? "No Expenses"}
          </span>
        </div>
        <div className="mt-1 text-xs text-zinc-500 tabular-nums">
          {formatINR(summary?.topCategory?.total ?? 0)} spent in last {days}{" "}
          days
        </div>
      </StatCard>
    </div>
  );
};

export default SummaryCards;
