import { LaptopIcon, SmartphoneIcon } from "lucide-react";
import type { Session } from "@/@types";
import {
  useRevokeOtherSessions,
  useRevokeSession,
  useSessions,
} from "@/hooks/account";
import { formatDateTime, timeAgo } from "@/lib/date";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";
import SettingsCard from "./SettingsCard";

const SessionRow = ({ session }: { session: Session }) => {
  const revoke = useRevokeSession();
  const isMobile = /Android|iOS/.test(session.device);
  const Icon = isMobile ? SmartphoneIcon : LaptopIcon;

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <Icon className="size-5 shrink-0 text-zinc-400" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate font-medium text-zinc-200">
            {session.device}
          </span>
          {session.isCurrent && (
            <Badge
              variant="secondary"
              className="border border-emerald-500/20 bg-emerald-500/10 text-xs font-normal text-emerald-400"
            >
              This device
            </Badge>
          )}
        </div>
        <p className="text-xs text-zinc-500">
          {session.ipAddress ? `${session.ipAddress} · ` : ""}
          {session.isCurrent
            ? "Active now"
            : `Active ${timeAgo(session.lastActiveAt)}`}
          {" · "}Signed in {formatDateTime(session.startedAt)}
        </p>
      </div>
      {!session.isCurrent && (
        <Button
          variant="outline"
          size="sm"
          loading={revoke.isPending}
          onClick={() => revoke.mutate(session.id)}
        >
          Sign out
        </Button>
      )}
    </li>
  );
};

const SessionsSection = () => {
  const { data: sessions, isLoading, isError } = useSessions();
  const revokeOthers = useRevokeOtherSessions();
  const hasOthers = (sessions?.length ?? 0) > 1;

  return (
    <SettingsCard
      title="Active sessions"
      description="Devices where you are signed in. Sign out any you do not recognise."
      action={
        hasOthers && (
          <Button
            variant="outline"
            size="sm"
            loading={revokeOthers.isPending}
            onClick={() => revokeOthers.mutate()}
          >
            Sign out all others
          </Button>
        )
      }
    >
      {isLoading ? (
        <Loader className="mt-4" />
      ) : isError ? (
        <p className="text-destructive text-sm">
          Failed to load sessions. Please try again.
        </p>
      ) : (
        <ul className="divide-y divide-zinc-800/60 overflow-hidden rounded-lg border border-zinc-800/80">
          {sessions?.map((session) => (
            <SessionRow key={session.id} session={session} />
          ))}
        </ul>
      )}
    </SettingsCard>
  );
};

export default SessionsSection;
