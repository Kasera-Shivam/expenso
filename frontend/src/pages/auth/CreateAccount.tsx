import React from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import authValidation, {
  type CreateAccountSchema,
} from "@/validations/auth.validation";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/api";
import { cn } from "cn";
import { toast } from "sonner";
import {
  User2Icon,
  MailIcon,
  LockOpenIcon,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
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

  const navigate = useNavigate();
  const { setSession } = useAuth();

  const form = useForm<CreateAccountSchema>({
    resolver: zodResolver(authValidation.CreateAccountSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "" },
  });

  const { isPending, mutate } = useMutation({
    async mutationFn(body: CreateAccountSchema) {
      const { data } = await api.post("/account/create", body);
      return data;
    },
    onSuccess(data) {
      const { user, accessToken } = data.data;
      setSession(user, accessToken);
      toast.success(data.message);
      navigate("/", { replace: true });
    },
    onError(error: any) {
      const message = error.response
        ? error.response.data.message
        : "Something went wrong.";
      toast.error(message);
    },
  });

  const handleSubmit = (values: CreateAccountSchema) => mutate(values);

  return (
    <Card className="mt-24 w-sm max-w-sm">
      <CardHeader>
        <CardTitle className="text-center text-2xl uppercase underline underline-offset-8">
          Create Account
        </CardTitle>
      </CardHeader>
      <CardContent className="mt-2">
        <form
          id="create-account-form"
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex w-full flex-col space-y-4"
        >
          <div className="flex items-center space-x-2">
            <Controller
              name="firstName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel
                    htmlFor={field.name}
                    className={cn({ "text-destructive": fieldState.error })}
                  >
                    First name
                  </FieldLabel>
                  <FieldContent>
                    <InputGroup>
                      <InputGroupAddon
                        className={cn({ "text-destructive": fieldState.error })}
                      >
                        <User2Icon />
                      </InputGroupAddon>
                      <InputGroupInput
                        id={field.name}
                        type="text"
                        placeholder="First name"
                        minLength={1}
                        maxLength={64}
                        aria-invalid={fieldState.invalid}
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
                    className={cn({ "text-destructive": fieldState.error })}
                  >
                    Last name
                  </FieldLabel>
                  <FieldContent>
                    <InputGroup>
                      <InputGroupAddon
                        className={cn({ "text-destructive": fieldState.error })}
                      >
                        <User2Icon />
                      </InputGroupAddon>
                      <InputGroupInput
                        id={field.name}
                        type="text"
                        placeholder="Last name"
                        maxLength={64}
                        aria-invalid={fieldState.invalid}
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
                  className={cn({ "text-destructive": fieldState.error })}
                >
                  Email
                </FieldLabel>
                <FieldContent>
                  <InputGroup>
                    <InputGroupAddon
                      className={cn({ "text-destructive": fieldState.error })}
                    >
                      <MailIcon />
                    </InputGroupAddon>
                    <InputGroupInput
                      id={field.name}
                      type="email"
                      placeholder="Email"
                      minLength={1}
                      maxLength={256}
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                  </InputGroup>
                </FieldContent>
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
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
                  className={cn({ "text-destructive": fieldState.error })}
                >
                  Create Password
                </FieldLabel>
                <FieldContent>
                  <InputGroup>
                    <InputGroupAddon
                      className={cn({ "text-destructive": fieldState.error })}
                    >
                      <LockOpenIcon />
                    </InputGroupAddon>
                    <InputGroupInput
                      id={field.name}
                      type={seePassword ? "text" : "password"}
                      placeholder="Create your strong password"
                      minLength={8}
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    <InputGroupButton
                      onClick={() => setSeePassword(!seePassword)}
                    >
                      {seePassword ? <EyeIcon /> : <EyeOffIcon />}
                    </InputGroupButton>
                  </InputGroup>
                </FieldContent>
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </form>
      </CardContent>
      <CardAction className="mt-4 flex w-full flex-col space-y-12 px-4">
        <Button
          size={"lg"}
          form="create-account-form"
          loading={isPending}
          className="w-full"
        >
          Create Account
        </Button>
        <p className="flex items-center justify-center space-x-1">
          <span>Already have an account?</span>
          <Link to={"/account/login"} className="font-semibold hover:underline">
            Login
          </Link>
        </p>
      </CardAction>
    </Card>
  );
};

export default CreateAccount;
