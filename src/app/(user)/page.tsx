"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Key, NotebookPen, Search } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <main className="flex flex-col items-center justify-center">
      {/* Call to Action Section */}
      <section className="flex h-[70vh] w-full flex-col items-center justify-center bg-[url('/koi-farm-hero-bg.jpg')] bg-cover bg-center py-20 text-white">
        <div className="container text-center">
          <h1 className="mb-6 text-5xl font-bold">Welcome to KoiWorld Farm</h1>
          <div className="flex items-center justify-center space-x-4">
            {/* <div className="flex w-1/2 flex-row justify-end"> */}
            <Link href="/search">
              <Button
                variant="default"
                size="lg"
                className="hover:bg-primary hover:opacity-90"
              >
                View Koi for Sale
              </Button>
            </Link>
            {/* </div> */}
            {!isLoggedIn && (
              // <div className="flex w-1/2 flex-row justify-start">
              <Link href="/login">
                <Button
                  variant="secondary"
                  size="lg"
                  className="hover:bg-white hover:opacity-90"
                >
                  Login
                </Button>
              </Link>
              // </div>
            )}
          </div>
        </div>
      </section>

      {/* About Our Koi Section */}
      <section className="flex w-full flex-row justify-center bg-[#C54125] pt-16">
        <div className="container mx-auto max-w-[1200px] px-4 text-center text-white">
          <h2 className="mb-6 text-3xl font-medium">
            Highest Quality Japanese Koi Fish (Nishikigoi) for Sale from
            Niigata, Japan
          </h2>
          <p className="mb-4 px-4">
            KoiWorld Farm imports and raises Japanese koi for sale only from
            Niigata, Japan. These beautiful Nishikigoi koi for sale are raised
            with the best quarantining procedures to provide a safe and positive
            experience buying live koi fish that are small or jumbo koi. Our
            family farm uses proven techniques from the Niigata breeders for our
            koi fish for sale and sells the best koi pond supplies, koi food,
            educational books and more to raise beautiful living jewels. Learn
            more about our family history.
          </p>
        </div>
      </section>
      <div className="h-[160px] w-full bg-[url('/layered-waves-haikei.svg')] bg-cover bg-center bg-no-repeat"></div>

      {/* How to Get Started Section */}
      <section className="pb-16">
        <div className="container mx-auto max-w-[1200px] px-4 text-center">
          <h2 className="font mb-6 text-2xl font-medium">
            How to Get Started and Buy Live Koi Online at KoiWorld Farm
          </h2>
          <p className="mb-8 text-slate-600">
            Sign up for an account on our website to view all koi for sale, koi
            prices, and more koi details. Read our welcome guide and FAQs to
            learn more about how our new website operates. You can buy koi fish
            online or on the phone. Please call us Monday - Friday at: +1 (833)
            Koi Love (1-833-564-5683); When you cannot reach us by phone, please
            contact us via EMAIL at: info@koiworldfarm.com with any questions.
            Sign up for wholesale here.
          </p>
          <p className="mb-8 text-slate-600">
            We sell individual koi fish and packs of koi. Each koi is genuinely
            from Japan and raised with an exceptional amount of care on our koi
            farm. Take a look at our rare koi and see if one of these top koi
            fish will be perfect for your pond. Give us a call, shop online, or
            request a koi.
          </p>
          <div className="flex justify-evenly space-x-8">
            <div className="text-center">
              <Key className="h-32 w-32 stroke-[#C54125] stroke-[1.5px]" />
              <p className="mt-2">Login</p>
            </div>
            <div className="text-center">
              <NotebookPen className="h-32 w-32 stroke-[#C54125] stroke-[1.5px]" />
              <p className="mt-2">Sign Up</p>
            </div>
            <div className="text-center">
              <Search className="h-32 w-32 stroke-[#C54125] stroke-[1.5px]" />
              <p className="mt-2">View All Kois</p>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="flex w-full flex-col items-center justify-center bg-[#F4F0E7] py-16">
        <div className="container mx-auto max-w-[1200px] px-4">
          <h2 className="mb-8 text-center text-3xl font-medium">
            Latest from Our Blog
          </h2>
          <p className="mb-8 text-center text-slate-600">
            Read our latest blog posts to learn more about koi care, koi
            breeding, and the latest news from our koi farm.
          </p>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            {Array.from({ length: 8 }).map((_, index) => (
              // <div className="overflow-hidden rounded-lg bg-gray-100 transition-shadow duration-300 hover:shadow-lg">
              <div>
                <Image
                  src="/koi-farm-blog-generic-thumbnail.jpg"
                  alt="Blog 1"
                  width={400}
                  height={200}
                  className="w-full"
                />
                <div className="py-4">
                  <Link href="/blogs/koi-care-101">
                    <h3 className="mb-2 text-xl font-medium hover:underline">
                      Koi Care 101
                    </h3>
                  </Link>
                  <p className="mb-4 text-gray-700">
                    Buy koi pond supplies and koi food online to create the most
                    beautiful, vibrant, and happy fish for your pond. We pride
                    ourselves on the selections of products in this website and
                    created many ourselves! The pond products we’ve chosen have
                    been used to raise our over 185+ koi champions and 50+ years
                    of research. We look forward to helping you choose the best
                    pond supplies for your environment and specialize in
                    products for high quality koi.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CEO Section */}
      <div className="h-[100px] w-full scale-x-[-1] scale-y-[-1] transform bg-[#F4F0E7] bg-[url('/layered-waves-haikei-short.svg')] bg-cover bg-center bg-no-repeat"></div>

      <section className="flex w-full flex-row items-center justify-center bg-primary">
        <div className="container flex flex-row items-center justify-center gap-8 px-4 text-white">
          <div className="">
            <Image
              src="/koi-farm-ceo.png"
              alt="CEO"
              width={150}
              height={150}
              className="rounded-full"
            />
          </div>
          <div className="w-1/2 text-center">
            <h2 className="mb-4 text-xl font-medium">
              Our Family Brings Peace To The World One Koi At A Time…
            </h2>
            <p className="mb-4">
              "What we all have in common here is that koi give us peaceful joy
              within our fast-paced and often busy lives, which is the sad
              reality of modern society in our world. We want to bring peace and
              tranquility to the United States through koi.
            </p>
            <p className="mb-4">
              All koi enthusiasts enjoy koi in their own different ways and now
              it is time for you to find yours. Who would have thought with my
              enjoyment, I would have the privilege to be a part of more than a
              half million koi's lives? I have my father to thank for that."
            </p>
            <p className="">
              <span className="font-medium">Taro Kodama</span>
              <br />
              President, KoiWorld Farm
            </p>
          </div>
        </div>
      </section>
      <div className="h-[160px] w-full bg-[url('/layered-waves-haikei-short.svg')] bg-cover bg-center bg-no-repeat"></div>

      {/* Request Form Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto max-w-[1200px] px-4 text-center">
          <h2 className="mb-6 text-3xl font-medium">
            We can help you find a Specific Japanese Koi fish for sale!
          </h2>
          <p className="mb-4">
            If you can't find the koi for sale on our website, we will help you
            find the right type of koi classification to add to your collection.
            Please fill out this request form to tell us the type of Japanese
            Koi that you are interested to purchase in the future. Selecting koi
            for sale is a journey, some are found quickly, others take a long
            time.
          </p>
          <p className="mb-4">
            You don't need to worry about finding and buying all the different
            types of pond fish you're looking for – we've got you covered. We
            are one of the leading pond products and fish suppliers worldwide.
            As a result, we have been able to establish a vast network of
            connections with different fish breeders all around the world. Most
            of these breeders are champions that specialize in specific kinds of
            pond fish. This makes your purchase easier and ensures that you get
            the best pond fish from a well-known breeder.
          </p>
        </div>
      </section>
    </main>
  );
}
