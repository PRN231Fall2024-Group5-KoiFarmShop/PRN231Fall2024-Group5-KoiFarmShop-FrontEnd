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
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Image from "next/image";
import Link from "next/link";
import { uploadImage } from "@/lib/configs/firebase";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import axiosClient from "@/lib/api/axiosClient";
import axios from "axios";

// Extend schema for confirmPassword validation
const formRegisterSchema = z.object({
  email: z.string()
    .min(3, { message: "Email must be at least 3 characters long" })
    .email({ message: "Invalid email format" }),
  
  password: z.string()
    .min(6, { message: "Password must be at least 6 characters long" }),
  
  confirmPassword: z.string()
    .min(6, { message: "Confirm password must be at least 6 characters long" }),
  
  fullName: z.string()
    .min(3, { message: "Full name must be at least 3 characters long" }),
  
  dob: z.string()
    .refine(value => {
      const date = new Date(value);
      const age = new Date().getFullYear() - date.getFullYear();
      return !isNaN(date.getTime()) && age >= 18;
    }, { message: "You must be at least 18 years old" }),
  
  phoneNumber: z.string()
    .regex(/^\d{10}$/, { message: "Phone number must be 10 digits long" }),
  
  imageUrl: z.string()
    .url({ message: "Invalid URL format for image" })
    .optional(),
  
  address: z.string()
    .min(5, { message: "Address must be at least 5 characters long" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // Field to display the error
});


function RegisterForm() {
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null); // State to hold avatar preview URL
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const form = useForm<z.infer<typeof formRegisterSchema>>({
    resolver: zodResolver(formRegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      dob: "",
      phoneNumber: "",
      imageUrl: "",
      address: "",
    },
  });

  const { toast } = useToast(); // Initialize the toast hook
  const router = useRouter();

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const imageUrl = await uploadImage(file);
      setAvatarUrl(imageUrl);
      form.setValue("imageUrl", imageUrl);
    }
  }

  async function onSubmit(values: z.infer<typeof formRegisterSchema>) {
    try {
      const response = await axiosClient.post<any>(
        "/users/register",
        {
          email: values.email,
          password: values.password,
          fullName: values.fullName,
          dob: values.dob,
          phoneNumber: values.phoneNumber,
          imageUrl: values.imageUrl,
          address: values.address,
          roleName: "CUSTOMER",
        }
      )

      if (response.status === 200) {
        console.log("Register successful", response.data)
        toast({
          title: "Registration successful",
          description: "You have successfully registered. Please login to continue.",
          variant: "default",
        })
        router.push("/login")
      } else {
        // This block will handle any non-200 responses that weren't caught by the catch block
        toast({
          title: "Registration failed",
          description: response.data.message || "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Register failed", error)
      
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 400) {
          // Handle the specific 400 error case
          toast({
            title: "Registration failed",
            description: error.response.data.message || "User already exists",
            variant: "destructive",
          })
        } else {
          // Handle other error cases
          toast({
            title: "Error",
            description: error.response?.data?.message || "An unexpected error occurred. Please try again.",
            variant: "destructive",
          })
        }
      } else {
        // Handle non-Axios errors
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div>
      <Form {...form}>
        <form
          method="POST"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8"
        >
          <div className="grid grid-cols-1 gap-6">
            {/* Left Column */}
            <div className="grid grid-cols-2 gap-5">
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
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Right Column - Avatar (Takes full width in its section) */}
            <div className="space-y-6 md:col-span-2">
              <div className="flex flex-col items-center w-full">
                <FormLabel>Avatar</FormLabel>
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="Avatar"
                    width={120}
                    height={120}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded-full border border-gray-300 bg-gray-100">
                    <span>No Avatar</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="mt-4"
                  onChange={handleImageUpload}
                />
                {/* show error validation */}
                {form.formState.errors.imageUrl && (
                  <span className="text-red-500">
                    {form.formState.errors.imageUrl.message}
                  </span>
                )}
              </div>
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full rounded-full bg-white py-6 text-primary hover:bg-primary hover:text-white"
          >
            Register
          </Button>
        </form>
      </Form>
    </div>
  );
}

function RegisterSection() {
  return (
    <section className="flex h-screen flex-col items-center">
      <div className="flex w-full flex-row items-center justify-between bg-[#F4F0E7] px-12 pt-1">
        <div className="w-[100px] overflow-hidden py-4">
          <Link href="/">
            <Image
              src={"/koi-farm-logo-transparent.png"}
              alt="Koi Farm logo"
              className="h-full w-full object-cover"
              width={100}
              height={50}
            />
          </Link>
        </div>
        <div className="flex flex-row items-center gap-2">
          Already have an account?
          <Link href="/login" className="underline">
            Login
          </Link>
        </div>
      </div>
      <div className="relative flex h-full w-full flex-col items-center justify-center bg-[url('/layered-waves-haikei-2.svg')] bg-cover">
        <div className="absolute left-1/2 top-[40%] flex min-w-[480px] max-w-[600px] -translate-x-1/2 -translate-y-1/2 transform flex-col justify-center gap-12 rounded-3xl bg-[#F4F0E7]/80 px-12 py-10">
          <div className="flex flex-col gap-2 text-center">
            <span className="text-shade-1-100% text-6xl font-medium text-primary">
              Koi Farm
            </span>
            <span className="text-shade-1-100%">
              Brings Peace To The World One Koi At A Time…
            </span>
          </div>

          <div  className="text-neutral-6 w-full">
            <RegisterForm />
          </div>
        </div>
      </div>
    </section>
  );
}


function RegisterPage() {
  return (
    <div className="flex h-[100vh] w-screen flex-row">
      <div className="h-full w-full">
        <RegisterSection />
      </div>
    </div>
  );
}

export default RegisterPage;
