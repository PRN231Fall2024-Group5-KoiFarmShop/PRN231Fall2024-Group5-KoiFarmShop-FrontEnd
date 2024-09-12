"use client";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import Image from "next/image";
import Link from "next/link";

const koiBreeds = [
  "Kohaku",
  "Sanke",
  "Showa",
  "Bekko",
  "Utsuri",
  "Asagi",
  "Shusui",
  "Tancho",
  "Ogon",
  "Kumonryu",
  "Chagoi",
  "Kujaku",
  "Goshiki",
  "Doitsu",
  "Gin Rin",
];

const navigationItems = [
  { name: "Blogs", href: "/blogs" },
  { name: "FAQ", href: "/faq" },
  { name: "About Us", href: "/about" },
  { name: "Login", href: "/login" },
];

const Header = () => {
  return (
    <header className="border-b bg-[#F4F0E7] text-primary">
      <div className="container mx-auto max-w-[1200px] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/koi-farm-logo-transparent.png"
                alt="KoiWorld Logo"
                width={100}
                height={50}
                className="mr-2"
              />
            </Link>
          </div>
          <div className="flex flex-row gap-4">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-[#F4F0E7] hover:text-primary focus:bg-[#F4F0E7] focus:text-primary data-[active]:bg-[#F4F0E7] data-[state=open]:bg-[#F4F0E7]/50">
                    Search Koi Breeds
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[200px] gap-1 border-none bg-[#F4F0E7] py-2 text-primary">
                      {koiBreeds.map((breed) => (
                        <li
                          key={breed}
                          className="w-full px-4 py-2 hover:bg-[#F0E8D8]"
                        >
                          <NavigationMenuLink asChild>
                            <Link
                              href={`/koi-breeds/${breed}`}
                              className="w-full"
                            >
                              {breed}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                {navigationItems.map((item) => (
                  <NavigationMenuItem key={item.name}>
                    <Link href={item.href} legacyBehavior passHref>
                      <NavigationMenuLink
                        className={
                          "group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-transparent focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                        }
                      >
                        {item.name}
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
