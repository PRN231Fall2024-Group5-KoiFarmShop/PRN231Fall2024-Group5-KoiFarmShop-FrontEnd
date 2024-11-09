"use client";

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
import * as React from "react";

import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import LoadingLine from "@/components/ui/loadingLine";
import authAPI from "@/lib/api/authAPI";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

interface LoginFormProps extends React.HTMLAttributes<HTMLDivElement> {}

const formLoginSchema = z.object({
  email: z.string().min(3, {
    message: "Email must be at least 3 characters long",
  }),
  password: z.string().min(3, {
    message: "Password must be at least 3 characters long",
  }),
});

export function LoginForm({ className, ...props }: LoginFormProps) {
  const [passwordVisible, setPasswordVisible] = React.useState<boolean>(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formLoginSchema>>({
    resolver: zodResolver(formLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formLoginSchema>) {
    await authAPI
      .login({
        email: values.email,
        password: values.password,
      })
      .then(({ data }: any) => {
        console.log("Login successful", data);
        if (data?.status == false) {
          toast("Login failed: " + data?.message);
          return;
        }

        localStorage.setItem("jwt", data.jwt);
        localStorage.setItem("refreshToken", data.jwtRefreshToken);
        localStorage.setItem("userId", data.userId);
        toast("Login successful");

        authAPI
          .getCurrentUser()
          .then(({ data }: any) => {
            console.log("Current user", data);
            localStorage.setItem("user", JSON.stringify(data));
            // {
            //   id: 1,
            //   email: 'admin@gmail.com',
            //   fullName: 'Admin',
            //   unsignFullName: 'Admin',
            //   dob: '2024-09-10T00:00:00',
            //   phoneNumber: '0123456789',
            //   roleName: 'ADMIN',
            //   imageUrl: '',
            //   address: 'Manager Street, City',
            //   isActive: null,
            //   loyaltyPoints: 0,
            //   isDeleted: false
            // }

            if (data.roleName === "ADMIN") {
              router.push("/admin/user-management");
            } else if (data.roleName === "MANAGER") {
              router.push("/manager");
            } else if (data.roleName === "STAFF") {
              router.push("/staff");
            } else {
              router.push("/");
            }
          })
          .catch((error) => {
            console.error("Failed to get current user", error);
          });
      })
      .catch((error) => {
        console.error("Login failed", error);
        //read response
        const { data } = error.response;
        toast.error("Login failed: " + data?.message);
      });
  }

  // const isLoading = status === "pending";
  const isLoading = false;

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
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
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
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex justify-between">
                  Password
                  {passwordVisible ? (
                    <span
                      className="flex cursor-pointer items-center gap-2 pr-2"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                    >
                      <EyeOffIcon className="h-5 w-5" />
                      Hide
                    </span>
                  ) : (
                    <span
                      className="flex cursor-pointer items-center gap-2 pr-1"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                    >
                      <EyeIcon className="h-5 w-5" />
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
          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm hover:underline">
              Forgot your password?
            </Link>
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
      <div className="flex items-center justify-between gap-4">
        <span className="bg-neutral-4 h-[2px] w-full"></span>OR
        <span className="bg-neutral-4 h-[2px] w-full"></span>
      </div>
      <div className="flex flex-col gap-4">
        {/* <Button
          variant={"outline"}
          className="text-neutral-7 flex w-full items-center gap-2 rounded-full py-5 hover:bg-[#F4F0E7] hover:text-primary"
        >
          <Image
            src={"/register/google-logo.svg"}
            alt="Google logo"
            width={22}
            height={22}
          />
          Continue with Google
        </Button> */}
        {/* <Button
          variant={"outline"}
          className="text-neutral-7 flex w-full items-center gap-2 rounded-full py-5 hover:bg-[#F4F0E7] hover:text-primary"
        >
          <Image
            src={"/register/apple-logo.svg"}
            alt="Apple logo"
            width={22}
            height={22}
          />
          Continue with Apple
        </Button> */}
      </div>
    </div>
  );
}
