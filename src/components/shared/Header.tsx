"use client";

import { useEffect, useState } from "react";
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

import { useRouter } from "next/navigation";
import koiBreedApi, { KoiBreed } from "@/lib/api/koiBreedApi";
import { CircleUser, ShoppingCart } from "lucide-react";
import { getCart } from "@/lib/cart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";

const Header = () => {
  const [koiBreeds, setKoiBreeds] = useState<KoiBreed[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cartItemCount, setCartItemCount] = useState(0);
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    console.log("User", localStorage.getItem("user"));
    if (localStorage.getItem("user") != null) {
      setUser(JSON.parse(localStorage.getItem("user") as string));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("jwt");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    setUser(null);
  };

  useEffect(() => {
    const fetchKoiBreeds = async () => {
      try {
        const response = await koiBreedApi.getAll();
        if (response.isSuccess) {
          setKoiBreeds(response.data.filter((breed) => !breed.isDeleted));
        }
      } catch (error) {
        console.error("Error fetching koi breeds:", error);
      }
    };

    fetchKoiBreeds();
  }, []);

  useEffect(() => {
    const updateCartCount = () => {
      const cart = getCart();
      setCartItemCount(cart.length);
    };

    updateCartCount();
    window.addEventListener("storage", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Allow empty search to show all koi
    router.push(
      `/search${searchTerm.trim() ? `?q=${encodeURIComponent(searchTerm.trim())}` : ""}`,
    );
  };

  const navigationItems = [
    { name: "Blogs", href: "/blogs" },
    { name: "FAQ", href: "/faq" },
    { name: "About Us", href: "/about" },
    {
      name: "Guides",
      items: [
        { name: "Policy", href: "/policy" },
        { name: "Buyer's Guide", href: "/buyers-guide" },
      ],
    },
  ];

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
          <div className="flex flex-row items-center gap-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search for fish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-full bg-white px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 transform"
                title="Search"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </form>
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-[#F4F0E7] hover:text-primary focus:bg-[#F4F0E7] focus:text-primary data-[active]:bg-[#F4F0E7] data-[state=open]:bg-[#F4F0E7]/50">
                    Breeds
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[200px] gap-1 border-none bg-[#F4F0E7] py-2 text-primary">
                      {koiBreeds.map((breed) => (
                        <li
                          key={breed.id}
                          className="w-full px-4 py-2 hover:bg-[#F0E8D8]"
                        >
                          <NavigationMenuLink asChild>
                            <Link
                              href={`/breed/${breed.id}`}
                              className="w-full"
                            >
                              {breed.name}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                {navigationItems.map((item) => (
                  <NavigationMenuItem key={item.name}>
                    {item.items ? (
                      <>
                        <NavigationMenuTrigger className="bg-transparent hover:bg-[#F4F0E7] hover:text-primary focus:bg-[#F4F0E7] focus:text-primary data-[active]:bg-[#F4F0E7] data-[state=open]:bg-[#F4F0E7]/50">
                          {item.name}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid w-[200px] gap-1 border-none bg-[#F4F0E7] p-2 text-primary">
                            {item.items.map((subItem) => (
                              <li key={subItem.name} className="w-full">
                                <NavigationMenuLink asChild>
                                  <Link
                                    href={subItem.href}
                                    className="block w-full px-4 py-2 hover:bg-[#F0E8D8]"
                                  >
                                    {subItem.name}
                                  </Link>
                                </NavigationMenuLink>
                              </li>
                            ))}
                          </ul>
                        </NavigationMenuContent>
                      </>
                    ) : (
                      <Link href={item.href} legacyBehavior passHref>
                        <NavigationMenuLink
                          className={
                            "group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-transparent focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                          }
                        >
                          {item.name}
                        </NavigationMenuLink>
                      </Link>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="ml-2 rounded-full"
                    >
                      {user?.imageUrl ? (
                        <img
                          src={user?.imageUrl}
                          alt="User Avatar"
                          className="rounded-full"
                        />
                      ) : (
                        <CircleUser className="h-5 w-5" />
                      )}
                      <span className="sr-only">Toggle user menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/profile")}>
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push("/profile/order-history")}
                    >
                      Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        router.push("/profile/transaction-history")
                      }
                    >
                      Transactions
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/profile/wallet")}>
                      Wallet
                    </DropdownMenuItem>
                    <DropdownMenuItem>Your Fish</DropdownMenuItem>
                    <DropdownMenuItem>Your Consignment</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div>
                  <Link href="/login" legacyBehavior passHref>
                    <NavigationMenuLink
                      className={
                        "group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-transparent focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                      }
                    >
                      Login
                    </NavigationMenuLink>
                  </Link>
                </div>
              )}
            </NavigationMenu>
            <Link href="/cart" className="relative">
              <ShoppingCart className="h-6 w-6" />
              {cartItemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
