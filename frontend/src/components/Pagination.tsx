import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

// 1 2 3 4 … 12   |   1 … 5 6 7 … 12   |   1 … 9 10 11 12
export const getPageItems = (page: number, total: number): (number | "…")[] => {
  if (total <= 7) return range(1, total);
  if (page <= 4) return [...range(1, 5), "…", total];
  if (page >= total - 3) return [1, "…", ...range(total - 4, total)];
  return [1, "…", page - 1, page, page + 1, "…", total];
};

const Pagination = ({ page, totalPages, onPageChange }: Props) => {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-center gap-1.5"
    >
      <Button
        variant="outline"
        size="icon"
        aria-label="Previous page"
        className="border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeftIcon className="size-4" />
      </Button>

      {getPageItems(page, totalPages).map((item, index) =>
        item === "…" ? (
          <span key={`gap-${index}`} className="px-1 text-zinc-500">
            …
          </span>
        ) : (
          <Button
            key={item}
            size="icon"
            variant={item === page ? "default" : "outline"}
            aria-label={`Page ${item}`}
            aria-current={item === page ? "page" : undefined}
            className={
              item === page
                ? "tabular-nums"
                : "border-zinc-800 bg-zinc-900/60 tabular-nums hover:bg-zinc-800"
            }
            onClick={() => item !== page && onPageChange(item)}
          >
            {item}
          </Button>
        ),
      )}

      <Button
        variant="outline"
        size="icon"
        aria-label="Next page"
        className="border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRightIcon className="size-4" />
      </Button>
    </nav>
  );
};

export default Pagination;
