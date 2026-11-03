import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Loader2Icon } from "lucide-react";

type Props = {
  title: string;
  icon: LucideIcon;
  isLoading?: boolean;
  children: ReactNode;
};

const StatCard = ({ title, icon: Icon, isLoading, children }: Props) => (
  <div className="flex min-w-65 flex-1 shrink-0 flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 backdrop-blur-md transition-all hover:border-zinc-700/80 sm:shrink">
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-zinc-400">{title}</span>
      <div className="flex size-7 items-center justify-center rounded-lg bg-zinc-800/70 text-zinc-400">
        <Icon className="size-4" />
      </div>
    </div>

    <div className="mt-3">
      {isLoading ? (
        <div className="flex h-12 items-center">
          <Loader2Icon className="size-5 animate-spin text-zinc-500" />
        </div>
      ) : (
        children
      )}
    </div>
  </div>
);

export default StatCard;
