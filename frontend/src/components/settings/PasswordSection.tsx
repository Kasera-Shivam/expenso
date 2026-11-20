import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockIcon } from "lucide-react";
import accountValidation, {
  type ChangePasswordFormSchema,
} from "@/validations/account.validation";
import { useChangePassword } from "@/hooks/account";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import SettingsCard from "./SettingsCard";

const FIELDS = [
  {
    name: "currentPassword",
    label: "Current password",
    autoComplete: "current-password",
  },
  { name: "newPassword", label: "New password", autoComplete: "new-password" },
  {
    name: "confirm",
    label: "Confirm new password",
    autoComplete: "new-password",
  },
] as const;

const PasswordSection = () => {
  const { mutate, isPending } = useChangePassword();
  const form = useForm<ChangePasswordFormSchema>({
    resolver: zodResolver(accountValidation.ChangePasswordFormSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirm: "" },
  });

  const onSubmit = ({
    currentPassword,
    newPassword,
  }: ChangePasswordFormSchema) =>
    mutate({ currentPassword, newPassword }, { onSuccess: () => form.reset() });

  return (
    <SettingsCard
      title="Password"
      description="Changing it signs you out of every other device."
    >
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          {FIELDS.map(({ name, label, autoComplete }) => (
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
                    {label}
                  </FieldLabel>
                  <FieldContent>
                    <InputGroup>
                      <InputGroupAddon
                        className={cn({
                          "text-destructive": fieldState.invalid,
                        })}
                      >
                        <LockIcon />
                      </InputGroupAddon>
                      <InputGroupInput
                        id={field.name}
                        type="password"
                        autoComplete={autoComplete}
                        placeholder={label}
                        aria-invalid={fieldState.invalid}
                        disabled={isPending}
                        {...field}
                      />
                    </InputGroup>
                  </FieldContent>
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          ))}
          <div>
            <Button type="submit" loading={isPending}>
              Change password
            </Button>
          </div>
        </FieldGroup>
      </form>
    </SettingsCard>
  );
};

export default PasswordSection;
