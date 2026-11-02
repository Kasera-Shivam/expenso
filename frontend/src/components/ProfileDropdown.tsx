import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAuth } from "@/context/AuthContext";
import UpdateAccount from "./UpdateAccount";
import { LogOutIcon, UserPenIcon } from "lucide-react";

const ProfileDropdown = () => {
  const { user, logout } = useAuth();
  const [updateOpen, setUpdateOpen] = useState(false);

  if (!user) return null;

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild className="cursor-pointer">
          <Avatar size="lg">
            <AvatarImage src={user.avatar ?? undefined} />
            <AvatarFallback>{user.firstName[0]}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="flex items-center gap-3 py-3">
            <Avatar className="size-12">
              <AvatarImage src={user.avatar ?? undefined} />
              <AvatarFallback>{user.firstName[0]}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold">{user.name}</p>
              <p className="text-muted-foreground truncate text-xs font-normal">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => setUpdateOpen(true)}
          >
            <UserPenIcon className="size-4" />
            Update account
          </DropdownMenuItem>

          <DropdownMenuItem
            variant="destructive"
            className="cursor-pointer"
            onSelect={() => logout()}
          >
            <LogOutIcon className="size-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UpdateAccount open={updateOpen} onOpenChange={setUpdateOpen} />
    </>
  );
};

export default ProfileDropdown;
