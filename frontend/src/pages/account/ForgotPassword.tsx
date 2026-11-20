import { Link } from "react-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheckIcon, MailIcon } from "lucide-react";
import accountValidation, {
  type ForgotPasswordSchema,
} from "@/validations/account.validation";
import { useForgotPassword } from "@/hooks/account";
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

const ForgotPassword = () => {
  const { mutate, isPending, isSuccess } = useForgotPassword();
  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(accountValidation.ForgotPasswordSchema),
    defaultValues: { email: "" },
  });

  return (
    <Card className="mt-14 h-fit max-h-fit w-sm max-w-sm">
      <h1 className="text-center">
        <Logo className="uppercase underline underline-offset-8" />
      </h1>
      <CardHeader>
        <CardTitle>Reset your password</CardTitle>
        <CardDescription>
          Enter your email and we will send you a reset link. It works for 15
          minutes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isSuccess ? (
          <div className="space-y-4">
            <div className="flex items-start gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm text-emerald-400">
              <CircleCheckIcon className="mt-0.5 size-4 shrink-0" />
              If an account exists for this email, a reset link has been sent.
            </div>
            <Link
              to="/account/login"
              className="text-muted-foreground block text-center hover:underline"
            >
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit((values) => mutate(values))}>
            <FieldGroup>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel
                      htmlFor={field.name}
                      className={cn({ "text-destructive": fieldState.invalid })}
                    >
                      Email
                    </FieldLabel>
                    <FieldContent>
                      <InputGroup>
                        <InputGroupAddon
                          className={cn({
                            "text-destructive": fieldState.invalid,
                          })}
                        >
                          <MailIcon />
                        </InputGroupAddon>
                        <InputGroupInput
                          id={field.name}
                          type="email"
                          placeholder="Email"
                          maxLength={256}
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
              <Field className="mt-4 flex flex-col space-y-4">
                <Button type="submit" loading={isPending} size="lg">
                  Send reset link
                </Button>
                <Link
                  to="/account/login"
                  className="text-muted-foreground text-center hover:underline"
                >
                  Back to login
                </Link>
              </Field>
            </FieldGroup>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default ForgotPassword;
