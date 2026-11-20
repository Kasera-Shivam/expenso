import React from "react";
import { Link } from "react-router";
import { useForm, Controller } from "react-hook-form";
import accountValidation, {
  type CreateAccountSchema,
} from "@/validations/account.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateAccount } from "@/hooks/account";
import { cn } from "cn";
import {
  User2Icon,
  MailIcon,
  LockOpenIcon,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react";
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
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";

const CreateAccount = () => {
  const [seePassword, setSeePassword] = React.useState<boolean>(false);

  const { isPending, mutate } = useCreateAccount();

  const form = useForm<CreateAccountSchema>({
    resolver: zodResolver(accountValidation.CreateAccountSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "" },
  });

  const handleSubmit = (values: CreateAccountSchema) => mutate(values);

  return (
    <Card className="mt-14 h-fit max-h-fit w-sm max-w-sm">
      <h1 className="text-center">
        <Logo className="uppercase underline underline-offset-8" />
      </h1>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <FieldGroup>
            <div className="flex w-full items-center space-x-2">
              <Controller
                name="firstName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel
                      htmlFor={field.name}
                      className={cn({
                        "text-destructive": fieldState.invalid,
                      })}
                    >
                      First name
                    </FieldLabel>
                    <FieldContent>
                      <InputGroup>
                        <InputGroupAddon
                          className={cn({
                            "text-destructive": fieldState.invalid,
                          })}
                        >
                          <User2Icon />
                        </InputGroupAddon>
                        <InputGroupInput
                          id={field.name}
                          type="text"
                          placeholder="First name"
                          maxLength={64}
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
                name="lastName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel
                      htmlFor={field.name}
                      className={cn({
                        "text-destructive": fieldState.invalid,
                      })}
                    >
                      Last name
                    </FieldLabel>
                    <FieldContent>
                      <InputGroup>
                        <InputGroupAddon
                          className={cn({
                            "text-destructive": fieldState.invalid,
                          })}
                        >
                          <User2Icon />
                        </InputGroupAddon>
                        <InputGroupInput
                          id={field.name}
                          type="text"
                          placeholder="Last name"
                          maxLength={64}
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
            </div>

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
                  <FieldLabel
                    htmlFor={field.name}
                    className={cn({
                      "text-destructive": fieldState.invalid,
                    })}
                  >
                    Create your password
                  </FieldLabel>
                  <FieldContent>
                    <InputGroup>
                      <InputGroupAddon
                        className={cn({
                          "text-destructive": fieldState.invalid,
                        })}
                      >
                        <LockOpenIcon />
                      </InputGroupAddon>
                      <InputGroupInput
                        id={field.name}
                        type={seePassword ? "text" : "password"}
                        placeholder="Create your password"
                        minLength={8}
                        aria-invalid={fieldState.invalid}
                        disabled={isPending}
                        readOnly={isPending}
                        {...field}
                      />
                      <InputGroupButton
                        onClick={() => setSeePassword(!seePassword)}
                      >
                        {seePassword ? <EyeIcon /> : <EyeOffIcon />}
                      </InputGroupButton>
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
                Create Account
              </Button>
              <p className="text-muted-foreground text-center">
                Already have an account?
                <Link
                  to={"/account/login"}
                  className="ml-1 hover:font-semibold hover:text-white hover:underline hover:underline-offset-2"
                >
                  Login
                </Link>
              </p>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateAccount;
