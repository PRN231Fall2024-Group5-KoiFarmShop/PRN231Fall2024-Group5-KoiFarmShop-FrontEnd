import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  return (
    <footer className="bg-[#F4F0E7] pt-8">
      <div className="container mx-auto max-w-[1200px] px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Koi Farm Info */}
          <div>
            <Image
              src="/koi-farm-logo-transparent.png"
              alt="KoiWorld Farm Logo"
              width={250}
              height={200}
              className="mb-4"
            />
            <h3 className="mb-4 text-lg font-medium text-primary">
              KoiWorld Farm
            </h3>

            <p className="mb-2">
              Kodama Koi Farm is the premier destination for quality Japanese
              koi fish for sale. We are the largest importer of Koi in North
              America. We specialize in raising champion koi!
            </p>
            <p className="mb-2">P.O. Box 893086, Mililani HI 96789</p>
            <p className="mb-2">TEL: +1 (123) Koi Love (1-123-345-6789)</p>
            <p className="mb-2">Email: info@koifarm.com</p>
            <p className="mb-2">Help: info@koifarm.com</p>

            <h3 className="mb-2 mt-4 text-lg font-medium text-primary">
              Hours of Operation:{" "}
            </h3>
            <p className="mb-2">Monday - Friday</p>
            <p className="mb-2">7:00 a.m. to 3:00 p.m. HST</p>
            <p>Saturday and Sunday Closed</p>
          </div>

          {/* Awards and Certificates */}
          <div>
            <h3 className="mb-4 text-lg font-medium text-primary">
              AWARD-WINNING JAPANESE KOI DEALER
            </h3>
            <p>
              We are proud to be members of many Japanese Nishikigoi
              organizations and to have multiple winners in the All Viet Nam Koi
              Shows.
            </p>
            <div className="flex flex-col flex-wrap gap-4">
              <Image
                src="/koi-farm-cert-01.webp"
                alt="Award 1"
                width={500}
                height={500}
              />
              {/* <Image
                src="/certificate1.png"
                alt="Certificate 1"
                width={80}
                height={80}
              /> */}
            </div>
            <h3 className="mb-4 text-lg font-medium text-primary">
              VISIT OUR FARM
            </h3>
            <p>
              We are a small family farm in Viet Nam that raises koi fish. We
              specialize in raising champion koi!
            </p>
          </div>

          {/* Navigation */}
          <div className="border-l-2 border-primary pl-6">
            <h3 className="mb-4 text-lg font-medium text-primary">
              Navigation
            </h3>
            <nav>
              <ul className="space-y-2">
                <li>
                  <Link href="/search">Search Koi</Link>
                </li>
                <li>
                  <Link href="/login">Login</Link>
                </li>
                <li>
                  <Link href="/register">Register</Link>
                </li>
                <li>
                  <Link href="/about">About Us</Link>
                </li>
                <li>
                  <Link href="/blogs">Blogs</Link>
                </li>
              </ul>
            </nav>
            <Separator className="my-4" />
            <h4 className="text-md mb-2 font-medium text-primary">Blogs</h4>
            <ul className="list-disc space-y-1 pl-4 marker:text-primary">
              <li>
                <Link href="/blogs/koi-care-101">Koi Care 101</Link>
              </li>
              <li>
                <Link href="/blogs/choosing-your-first-koi">
                  Choosing Your First Koi
                </Link>
              </li>
              <li>
                <Link href="/blogs/koi-pond-maintenance">
                  Koi Pond Maintenance Tips
                </Link>
              </li>
              <li>
                <Link href="/blogs/feeding-your-koi">
                  Proper Koi Feeding Techniques
                </Link>
              </li>
              <li>
                <Link href="/blogs/koi-health-issues">
                  Common Koi Health Issues
                </Link>
              </li>
              <li>
                <Link href="/blogs/koi-breeding-basics">
                  Koi Breeding Basics
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <Separator className="mt-6" />
      <div className="w-full bg-gray-700 py-6">
        <div className="text-center text-sm text-[#F4F0E7] text-muted-foreground">
          © 2024 KoiWorld. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
