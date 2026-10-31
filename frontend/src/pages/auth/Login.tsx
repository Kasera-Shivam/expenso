import { useNavigate, Link } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import authValidation, {
  type LoginSchema,
} from "@/validations/auth.validation";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/api";
import { cn } from "cn";
import { toast } from "sonner";
import { MailIcon, LockIcon } from "lucide-react";
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
  InputGroupInput,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";

const Login = () => {
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const form = useForm<LoginSchema>({
    resolver: zodResolver(authValidation.LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const { isPending, mutate } = useMutation({
    async mutationFn(body: LoginSchema) {
      const { data } = await api.post("/account/login", body);
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

  const handleSubmit = (values: LoginSchema) => mutate(values);

  return (
    <Card className="mt-24 w-sm max-w-sm">
      <CardHeader>
        <CardTitle className="text-center text-2xl uppercase underline underline-offset-8">
          Login
        </CardTitle>
      </CardHeader>
      <CardContent className="mt-2">
        <form
          id="login-form"
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex w-full flex-col space-y-4"
        >
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
                  Password
                </FieldLabel>
                <FieldContent>
                  <div className="relative w-full">
                    <InputGroup>
                      <InputGroupAddon
                        className={cn({ "text-destructive": fieldState.error })}
                      >
                        <LockIcon />
                      </InputGroupAddon>
                      <InputGroupInput
                        id={field.name}
                        type={"password"}
                        placeholder="Password"
                        minLength={8}
                        aria-invalid={fieldState.invalid}
                        {...field}
                      />
                    </InputGroup>
                    <Link
                      to={"/account/password/forgot"}
                      className="absolute top-[110%] right-0 text-xs hover:underline"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                </FieldContent>
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </form>
      </CardContent>
      <CardAction className="mt-6 flex w-full flex-col space-y-12 px-4">
        <Button
          size={"lg"}
          form="login-form"
          loading={isPending}
          className="w-full"
        >
          Login
        </Button>
        <p className="flex items-center justify-center space-x-1">
          <span>Don't have an account?</span>
          <Link
            to={"/account/create"}
            className="font-semibold hover:underline"
          >
            Create
          </Link>
        </p>
      </CardAction>
    </Card>
  );
};

export default Login;
