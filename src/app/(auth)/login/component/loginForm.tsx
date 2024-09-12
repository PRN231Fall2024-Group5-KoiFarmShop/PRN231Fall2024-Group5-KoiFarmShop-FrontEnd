"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import Link from "next/link";
// import useLocalStorage from "@/hooks/useLocalStorage";
import Image from "next/image";
import { login } from "@/lib/api/authAPI";
import { useErrorNotification } from "@/hooks/useErrorNotification";
import LoadingLine from "@/components/ui/loadingLine";

interface LoginFormProps extends React.HTMLAttributes<HTMLDivElement> {}

const formLoginSchema = z.object({
  email: z.string().min(3, {
    message: "Email ít nhất 3 ký tự",
  }),
  password: z.string().min(3, {
    message: "Password ít nhất 3 ký tự",
  }),
});

export function LoginForm({ className, ...props }: LoginFormProps) {
  const [passwordVisible, setPasswordVisible] = React.useState<boolean>(false);

  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formLoginSchema>>({
    resolver: zodResolver(formLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formLoginSchema>) {
    handleLogin({
      email: values.email,
      password: values.password,
    });
  }

  const {
    mutate: handleLogin,
    status,
    error: mutateError,
  } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["authenticatedUser"] });
      router.push("/"); //TODO: route to main page
    },
  });

  useErrorNotification({
    isError: status === "error",
    title: mutateError?.message ?? "Tạo tài khoản thất bại",
  });

  const isLoading = status === "pending";

  return (
    <div className={cn("grid gap-4 space-y-4", className)} {...props}>
      <Form {...form}>
        <form
          method="POST"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }: any) => (
              <FormItem>
                <FormLabel>Username or email address</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }: any) => (
              <FormItem>
                <FormLabel className="flex flex-row justify-between">
                  Your password
                  {passwordVisible ? (
                    <span
                      className="flex cursor-pointer flex-row items-center gap-2 pr-2"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                    >
                      <EyeOffIcon className="h-5 w-5 cursor-pointer" />
                      Hide
                    </span>
                  ) : (
                    <span
                      className="flex cursor-pointer flex-row items-center gap-2 pr-1"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                    >
                      <EyeIcon className="h-5 w-5 cursor-pointer" />
                      Show
                    </span>
                  )}
                </FormLabel>
                <FormControl>
                  <Input
                    type={passwordVisible ? "text" : "password"}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-row-reverse gap-2">
            <span>
              <Link
                href={"/"} //TODO: page ForgetPassword
                className="inline px-1 hover:underline"
              >
                Forgot your password?
              </Link>
            </span>
          </div>
          <Button
            disabled={isLoading}
            variant={"outline"}
            className="w-full rounded-full bg-white py-6 text-primary hover:bg-primary hover:text-white"
          >
            {isLoading ? <LoadingLine /> : "Login"}
          </Button>
        </form>
      </Form>
      <div className="text-neutral-8 flex flex-row items-center justify-between gap-4">
        <span className="bg-neutral-4 h-[2px] w-full"></span>OR
        <span className="bg-neutral-4 h-[2px] w-full"></span>
      </div>
      <div className="flex flex-col gap-4">
        <Button
          variant={"outline"}
          className="text-neutral-7 flex w-full flex-row gap-2 rounded-full py-5 hover:bg-[#F4F0E7] hover:text-primary"
        >
          <Image
            src={"/register/google-logo.svg"}
            alt="Google logo"
            width={22}
            height={22}
          />
          Continue with Google
        </Button>
        <Button
          variant={"outline"}
          className="text-neutral-7 flex w-full flex-row gap-2 rounded-full py-5 hover:bg-[#F4F0E7] hover:text-primary"
        >
          <Image
            src={"/register/apple-logo.svg"}
            alt="Apple logo"
            width={22}
            height={22}
          />
          Continue with Apple
        </Button>
      </div>
    </div>
  );
}
