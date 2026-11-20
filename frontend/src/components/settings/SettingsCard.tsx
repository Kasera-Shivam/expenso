import type { PropsWithChildren, ReactNode } from "react";

type Props = PropsWithChildren<{
  title: string;
  description: string;
  action?: ReactNode;
}>;

const SettingsCard = ({ title, description, action, children }: Props) => (
  <section className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-5">
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      {action}
    </div>
    {children}
  </section>
);

export default SettingsCard;
