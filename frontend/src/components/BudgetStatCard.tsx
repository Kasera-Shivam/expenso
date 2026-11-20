import { Link } from "react-router";
import { PiggyBankIcon } from "lucide-react";
import { useBudget } from "@/hooks/budget";
import { monthKey } from "@/lib/date";
import { cn, formatINR } from "@/lib/utils";
import StatCard from "./StatCard";

const BudgetStatCard = () => {
  const { data, isLoading } = useBudget(monthKey());
  const budget = Number(data?.amount ?? 0);
  const spent = Number(data?.spent ?? 0);
  const percent = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
  const isOver = budget > 0 && spent > budget;

  return (
    <StatCard title="Monthly Budget" icon={PiggyBankIcon} isLoading={isLoading}>
      {data?.amount ? (
        <Link to="/budget" className="block">
          <div className="text-2xl font-bold tracking-tight text-zinc-100 tabular-nums">
            {formatINR(spent)}
            <span className="ml-1.5 text-xs font-normal text-zinc-500">
              of {formatINR(budget)}
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
            <div
              className={cn(
                "h-full rounded-full",
                isOver ? "bg-rose-500" : "bg-emerald-500",
              )}
              style={{ width: `${percent}%` }}
            />
          </div>
        </Link>
      ) : (
        <Link to="/budget" className="block">
          <div className="text-lg font-bold tracking-tight text-zinc-100">
            Not set
          </div>
          <div className="mt-1 text-xs text-zinc-500 underline-offset-4 hover:underline">
            Set a budget for this month
          </div>
        </Link>
      )}
    </StatCard>
  );
};

export default BudgetStatCard;
