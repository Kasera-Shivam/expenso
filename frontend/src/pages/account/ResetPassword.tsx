import { Link, useNavigate, useSearchParams } from "react-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockIcon } from "lucide-react";
import { toast } from "sonner";
import accountValidation, {
  type ResetPasswordFormSchema,
} from "@/validations/account.validation";
import { useResetPassword } from "@/hooks/account";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

const FIELDS = [
  { name: "password", label: "New password" },
  { name: "confirm", label: "Confirm password" },
] as const;

const ResetPassword = () => {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const navigate = useNavigate();
  const { mutate, isPending } = useResetPassword();

  const form = useForm<ResetPasswordFormSchema>({
    resolver: zodResolver(accountValidation.ResetPasswordFormSchema),
    defaultValues: { password: "", confirm: "" },
  });

  const onSubmit = ({ password }: ResetPasswordFormSchema) =>
    mutate(
      { token, password },
      {
        onSuccess: () => {
          toast.success("Password changed. Log in with the new one.");
          navigate("/account/login", { replace: true });
        },
      },
    );

  return (
    <Card className="mt-14 h-fit max-h-fit w-sm max-w-sm">
      <h1 className="text-center">
        <Logo className="uppercase underline underline-offset-8" />
      </h1>
      <CardHeader>
        <CardTitle>Choose a new password</CardTitle>
        <CardDescription>
          You will be signed out on every device after this.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!token ? (
          <div className="space-y-4 text-center">
            <p className="text-destructive text-sm">
              This link has no token. Request a new reset link.
            </p>
            <Link to="/account/password/forgot" className="hover:underline">
              Request a new link
            </Link>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              {FIELDS.map(({ name, label }) => (
                <Controller
                  key={name}
                  name={name}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel
                        htmlFor={field.name}
                        className={cn({
                          "text-destructive": fieldState.invalid,
                        })}
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
              <Field className="mt-4">
                <Button type="submit" loading={isPending} size="lg">
                  Change password
                </Button>
              </Field>
            </FieldGroup>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default ResetPassword;
