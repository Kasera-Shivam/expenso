import { Link } from "react-router";
import { useForm, Controller } from "react-hook-form";
import accountValidation, {
  type LoginSchema,
} from "@/validations/account.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "@/hooks/account";
import { cn } from "cn";
import { MailIcon, LockIcon } from "lucide-react";
import Logo from "@/components/Logo";
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
import { Button } from "@/components/ui/button";

const Login = () => {
  const { isPending, mutate } = useLogin();

  const form = useForm<LoginSchema>({
    resolver: zodResolver(accountValidation.LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleSubmit = (values: LoginSchema) => mutate(values);

  return (
    <Card className="mt-14 h-fit max-h-fit w-sm max-w-sm">
      <h1 className="text-center">
        <Logo className="uppercase underline underline-offset-8" />
      </h1>
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel
                    htmlFor={field.name}
                    className={cn({
                      "text-destructive": fieldState.invalid,
                    })}
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
                        readOnly={isPending}
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

            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel
                      htmlFor={field.name}
                      className={cn({
                        "text-destructive": fieldState.invalid,
                      })}
                    >
                      Password
                    </FieldLabel>

                    <Link
                      to={"/account/password/forgot"}
                      className="hover:underline hover:underline-offset-4"
                    >
                      Forgot your password?
                    </Link>
                  </div>
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
                        type={"password"}
                        placeholder="Password"
                        aria-invalid={fieldState.invalid}
                        disabled={isPending}
                        readOnly={isPending}
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
              <Button type="submit" loading={isPending} size={"lg"}>
                Login
              </Button>
              <p className="text-muted-foreground text-center">
                Don't have an account?
                <Link
                  to={"/account/create"}
                  className="ml-1 hover:font-semibold hover:text-white hover:underline hover:underline-offset-2"
                >
                  Create
                </Link>
              </p>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
};

export default Login;
