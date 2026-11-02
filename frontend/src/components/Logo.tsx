import { cn } from "cn";

type Props = {
  className?: string;
};

const Logo = ({ className }: Props) => {
  return (
    <h1 className={cn("text-2xl font-extrabold tracking-tighter", className)}>
      Expenso
    </h1>
  );
};

export default Logo;
