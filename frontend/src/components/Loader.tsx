import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

type Props = {
  label?: string;
  className?: string;
};

const Loader = ({ label = "Loading...", className }: Props) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("mt-28 flex flex-col justify-center gap-3", className)}
    >
      <Spinner className="mx-auto size-8" />
      <p className="text-muted-foreground text-center text-sm">{label}</p>
    </div>
  );
};

export default Loader;
