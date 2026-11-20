import { useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import accountValidation, {
  type UpdateAccountSchema,
} from "@/validations/account.validation";
import { useAuth } from "@/context/AuthContext";
import { useUpdateAccount, useUpdateAvatar } from "@/hooks/account";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "./ui/field";
import { Input } from "./ui/input";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024;

const UpdateAccount = ({ open, onOpenChange }: Props) => {
  const { user } = useAuth();
  const update = useUpdateAccount();
  const avatar = useUpdateAvatar();
  const fileRef = useRef<HTMLInputElement>(null);

  const form = useForm<UpdateAccountSchema>({
    resolver: zodResolver(accountValidation.UpdateAccountSchema),
    values: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
    },
  });

  const onFile = (file?: File) => {
    if (!file) return;
    if (!ALLOWED.includes(file.type))
      return toast.error("Use a JPG, PNG or WebP image.");
    if (file.size > MAX_SIZE)
      return toast.error("Image must be 2 MB or smaller.");
    avatar.mutate(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Update account</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarImage src={user?.avatar ?? undefined} />
            <AvatarFallback className="text-lg">
              {user?.firstName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={avatar.isPending}
              onClick={() => fileRef.current?.click()}
            >
              Change photo
            </Button>
            <p className="text-muted-foreground text-xs">
              JPG, PNG or WebP, up to 2 MB
            </p>
            <input
              ref={fileRef}
              type="file"
              accept={ALLOWED.join(",")}
              hidden
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </div>
        </div>

        <form
          onSubmit={form.handleSubmit((values) =>
            update.mutate(values, { onSuccess: () => onOpenChange(false) }),
          )}
        >
          <FieldGroup>
            {(["firstName", "lastName"] as const).map((name) => (
              <Controller
                key={name}
                name={name}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel
                      htmlFor={field.name}
                      className={cn({ "text-destructive": fieldState.invalid })}
                    >
                      {name === "firstName" ? "First name" : "Last name"}
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        id={field.name}
                        maxLength={64}
                        aria-invalid={fieldState.invalid}
                        {...field}
                      />
                    </FieldContent>
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            ))}
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" value={user?.email ?? ""} disabled readOnly />
            </Field>
            <Button type="submit" size="lg" loading={update.isPending}>
              Save changes
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateAccount;
