import React from "react";
import Image from "next/image";

import { LoginForm } from "./component/loginForm";
import Link from "next/link";
import { Toaster } from "sonner";

function LoginSection() {
  return (
    <section className="flex h-screen flex-col items-center">
      <div className="flex w-full flex-row items-center justify-between bg-[#F4F0E7] px-12 pt-1">
        <div className="w-[100px] overflow-hidden py-4">
          <Link href="/">
            <Image
              src={"/koi-farm-logo-transparent.png"}
              alt="Memora logo"
              className="h-full w-full object-cover"
              width={100}
              height={50}
            ></Image>
          </Link>
        </div>
        <div className="flex flex-row items-center gap-2">
          Don`t have an account?
          <a href="/register" className="underline">
            Sign Up
          </a>
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

          <LoginForm className="text-neutral-6 w-full" />
        </div>
      </div>
      
    </section>
  );
}

function LoginPage() {
  return (
    <div className="flex h-[100vh] w-screen flex-row">
      {/* <div className="relative hidden h-full w-2/5 md:block">
        <div className="flex h-full w-full flex-row overflow-hidden">
          <Image
            src={"/koi-farm-hero-bg.jpg"}
            alt="Register background image"
            width={1440}
            height={2048}
            className="object-cover"
          ></Image>
        </div>
      </div> */}
      <div className="h-full w-full">
        <LoginSection />
      </div>
      <Toaster />
    </div>
  );
}

export default LoginPage;
