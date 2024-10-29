"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getCart,
  removeFromCart,
  updateCartItemConsignment,
  CartItem,
} from "@/lib/cart";
import koiFishApi from "@/lib/api/koiFishApi";
import koiDietApi, { KoiDiet } from "@/lib/api/koiDiet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, CheckCircle, XCircle, ChevronDown } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { formatPriceVND } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

import { DateRange } from "react-day-picker";
import { differenceInDays } from "date-fns";
import { DateRangePicker } from "./components/date-range-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface ConsignmentConfig {
  dietId: number;
  dateRange: DateRange | undefined;
}

interface ExtendedCartItem extends CartItem {
  consign: boolean;
  consignmentConfig?: ConsignmentConfig;
}

export default function CartPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<ExtendedCartItem[]>(getCart());

  const { data: koiDetails, isLoading: isLoadingKoi } = useQuery({
    queryKey: ["koiDetails"],
    queryFn: async () => {
      const itemIds = cartItems.map((item) => item.id);
      if (itemIds.length === 0) return [];
      const response = await koiFishApi.getMultipleKoiDetails(itemIds);
      if (!response.isSuccess) throw new Error(response.message);
      console.log(response);
      return response.data;
    },
    enabled: cartItems.length > 0,
  });

  const { data: diets, isLoading: isLoadingDiets } = useQuery({
    queryKey: ["diets"],
    queryFn: async () => {
      const response = await koiDietApi.getDietList();
      if (!response.isSuccess) throw new Error(response.message);
      return response.data;
    },
  });

  useEffect(() => {
    if (koiDetails) {
      const updatedItems = cartItems.map((item) => {
        const updatedKoi = koiDetails.find((koi) => koi.id === item.id);
        return updatedKoi
          ? {
              ...item,
              price: updatedKoi.price,
              name: updatedKoi.name,
              koiFishImages: updatedKoi.koiFishImages,
            }
          : item;
      });
      setCartItems(updatedItems);
    }
  }, [koiDetails]);

  const handleRemoveItem = (koiId: number) => {
    removeFromCart(koiId);
    setCartItems(getCart());
  };

  const handleConsignToggle = (koiId: number) => {
    setCartItems((items) =>
      items.map((item) => {
        if (item.id === koiId) {
          const newConsign = !item.consign;
          const newConsignmentConfig = newConsign
            ? { dietId: 1, dateRange: undefined }
            : undefined;
          updateCartItemConsignment(koiId, newConsign, newConsignmentConfig);
          return {
            ...item,
            consign: newConsign,
            consignmentConfig: newConsignmentConfig,
          };
        }
        return item;
      }),
    );
  };

  const handleConsignmentConfigChange = (
    koiId: number,
    field: keyof ConsignmentConfig,
    value: any,
  ) => {
    setCartItems((items) =>
      items.map((item) => {
        if (item.id === koiId && item.consignmentConfig) {
          const newConfig = { ...item.consignmentConfig, [field]: value };
          updateCartItemConsignment(koiId, item.consign, newConfig);
          return {
            ...item,
            consignmentConfig: newConfig,
          };
        }
        return item;
      }),
    );
  };

  const calculateConsignmentDuration = (dateRange: DateRange | undefined) => {
    if (!dateRange?.from || !dateRange?.to) return 0;
    return differenceInDays(dateRange.to, dateRange.from) + 1;
  };

  const calculateConsignmentPrice = (item: ExtendedCartItem) => {
    if (!item.consignmentConfig) return 0;
    const { dietId, dateRange } = item.consignmentConfig;
    const duration = calculateConsignmentDuration(dateRange);
    const diet = diets?.find((d) => d.id === dietId);
    if (!diet) return 0;
    return diet.dietCost * duration;
  };

  const isConsignmentConfigComplete = (
    config: ConsignmentConfig | undefined,
  ) => {
    if (!config) return false;
    return (
      config.dietId !== 0 &&
      config.dateRange !== undefined &&
      calculateConsignmentDuration(config.dateRange) > 0
    );
  };

  const subtotal = cartItems.reduce(
    (total, item) =>
      total + item.price + (item.consign ? calculateConsignmentPrice(item) : 0),
    0,
  );

  const CustomDropdown = ({ options, value, onChange, label }: any) => {
    const selectedOption = options.find((option: any) => option.id === value);
    const [triggerWidth, setTriggerWidth] = useState<number | null>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
      if (triggerRef.current) {
        setTriggerWidth(triggerRef.current.offsetWidth);
      }
    }, []);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            ref={triggerRef}
            variant="outline"
            className="w-full justify-between"
          >
            {selectedOption
              ? `${selectedOption.name} - ${formatPriceVND(selectedOption.dietCost)}/day`
              : label}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="p-0"
          style={{ width: triggerWidth ? `${triggerWidth}px` : "auto" }}
        >
          <DropdownMenuLabel className="px-2 py-1.5">{label}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {options.map((option: any) => (
            <DropdownMenuItem
              key={option.id}
              onSelect={() => onChange(option.id)}
              className="px-2 py-1.5"
            >
              <div className="flex flex-col">
                <div className="font-medium">
                  {option.name} - {formatPriceVND(option.dietCost ?? 0)}/day
                </div>
                <div className="text-sm text-gray-500">
                  {option.description}
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const isLoading = isLoadingKoi || isLoadingDiets;
  const error =
    (cartItems.length > 0 && koiDetails === undefined) || diets === undefined
      ? "Failed to fetch data. Please try again."
      : null;

  console.log(cartItems.length);
  console.log(koiDetails);
  console.log(diets);

  const isConsignmentConfigValid = (config: ConsignmentConfig | undefined) => {
    if (!config) return false;
    return (
      config.dietId !== 0 &&
      config.dateRange !== undefined &&
      config.dateRange.from !== undefined &&
      config.dateRange.to !== undefined &&
      calculateConsignmentDuration(config.dateRange) > 0
    );
  };

  const handleCheckout = () => {
    const invalidConsignments = cartItems.filter(
      (item) =>
        item.consign && !isConsignmentConfigValid(item.consignmentConfig),
    );

    if (invalidConsignments.length > 0) {
      const itemNames = invalidConsignments.map((item) => item.name).join(", ");
      toast({
        title: "Invalid Consignment Configuration",
        description: `Please complete the consignment configuration for: ${itemNames}`,
        variant: "destructive",
      });
    } else {
      router.push("/cart/checkout");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center text-center">
        <p className="mb-4 text-lg">Loading cart items...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center text-center">
        <Image
          src="/error-image.jpg"
          alt="An error occurred"
          width={300}
          height={300}
          className="pointer-events-nonemb-2"
        />
        <p className="mb-4 text-lg">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          className="hover:bg-primary-dark mt-4 bg-primary text-white"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center text-center">
        <Image
          src="/empty-cart.png"
          alt="An error occurred"
          width={270}
          height={270}
          className="pointer-events-none mb-2"
        />
        <p className="mb-4 text-lg">Your cart is empty.</p>
        <Link href="/search">
          <Button className="border border-primary bg-white text-primary hover:bg-primary hover:text-white">
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-[url('https://www.kodamakoifarm.com/wp-content/uploads/2024/01/kodama_menu-bg.jpg')]">
        <div className="container mx-auto max-w-6xl">
          <Breadcrumb className="py-4 text-primary">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/cart">Cart</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-4">
        <h1 className="mb-4 text-2xl font-bold">Cart</h1>
        <div className="flex flex-col space-y-4">
          {/* Header */}
          <div className="hidden text-sm font-semibold md:flex">
            <div className="w-2/5 flex-1 pr-2">Product</div>
            <div className="w-1/6 text-right">Price</div>
            <div className="w-1/6 text-right">Subtotal</div>
            <div className="w-1/6 text-center">Consign</div>
            <div className="w-1/12"></div>
          </div>

          {/* Cart Items */}
          {cartItems.map((item) => (
            <div
              key={item.id}
              className={`${
                item.consign
                  ? isConsignmentConfigComplete(item.consignmentConfig)
                    ? "bg-blue-50"
                    : "bg-yellow-50"
                  : ""
              }`}
            >
              <div className="flex flex-col items-center border-b p-4 md:flex-row">
                <div className="mb-2 flex w-full flex-1 items-center pr-2 md:mb-0 md:w-2/5">
                  <Image
                    src={
                      item.koiFishImages[0]?.imageUrl ??
                      "/koi-farm-generic-koi-thumbnail.jpg"
                    }
                    alt={item.name}
                    width={50}
                    height={50}
                    className="mr-4"
                  />
                  <span className="flex-grow">{item.name}</span>
                </div>
                <div className="mb-2 w-full text-right md:mb-0 md:w-1/6">
                  {formatPriceVND(item.price)}
                </div>
                <div className="mb-2 w-full text-right md:mb-0 md:w-1/6">
                  {formatPriceVND(item.price)}
                </div>
                <div className="mb-2 flex w-full justify-center md:mb-0 md:w-1/6">
                  <Checkbox
                    checked={item.consign}
                    onCheckedChange={() => handleConsignToggle(item.id)}
                  />
                </div>
                <div className="flex w-full items-center justify-center md:w-1/12">
                  <Button
                    variant="ghost"
                    onClick={() => handleRemoveItem(item.id)}
                    className="mt-2 p-2 md:mt-0"
                  >
                    <Trash2 className="h-5 w-5 text-red-500" />
                  </Button>
                </div>
              </div>
              {item.consign && item.consignmentConfig && (
                <div className="mt-0 bg-gray-100 p-4">
                  <h3 className="mb-2 font-semibold">
                    Consignment Configuration
                  </h3>
                  <div className="flex flex-col justify-between md:flex-row">
                    <div className="flex w-1/2 flex-col">
                      <div className="max-w-1/2 mb-4 grid grid-cols-1 gap-4">
                        {diets && diets.length > 0 ? (
                          <CustomDropdown
                            options={diets}
                            value={item.consignmentConfig.dietId}
                            onChange={(value: any) =>
                              handleConsignmentConfigChange(
                                item.id,
                                "dietId",
                                value,
                              )
                            }
                            label="Select diet"
                          />
                        ) : (
                          <p className="text-red-500">
                            Failed to load diet options. Please try again later.
                          </p>
                        )}
                      </div>
                      <div className="mb-4 flex flex-row gap-4">
                        <DateRangePicker
                          dateRange={item.consignmentConfig.dateRange}
                          onDateRangeChange={(newDateRange) =>
                            handleConsignmentConfigChange(
                              item.id,
                              "dateRange",
                              newDateRange,
                            )
                          }
                        />
                        <div className="flex items-center">
                          <span className="mr-2">Duration:</span>
                          <span>
                            {calculateConsignmentDuration(
                              item.consignmentConfig.dateRange,
                            )}{" "}
                            days
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex w-1/3 flex-col justify-between">
                      <div className="flex items-center justify-end">
                        <span className="mr-2">Daily Cost:</span>
                        <span>
                          {formatPriceVND(
                            diets && diets.length > 0
                              ? diets.find(
                                  (diet) =>
                                    diet.id === item.consignmentConfig?.dietId,
                                )?.dietCost || 0
                              : 0,
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-end">
                        <span className="mr-2">Estimated Price:</span>
                        <span>
                          {formatPriceVND(calculateConsignmentPrice(item))}
                        </span>
                      </div>
                      <div className="flex items-center justify-end">
                        {isConsignmentConfigComplete(item.consignmentConfig) ? (
                          <CheckCircle className="h-6 w-6 text-blue-500" />
                        ) : (
                          <XCircle className="h-6 w-6 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Cart Totals */}
        <div className="ml-auto mt-8 md:w-1/2">
          <h2 className="mb-4 text-xl font-bold">Cart totals</h2>
          <div className="mb-2 flex justify-between">
            <span>Subtotal:</span>
            <span>{formatPriceVND(subtotal)}</span>
          </div>
          <div className="mb-2 flex justify-between">
            <span>Shipping:</span>
            <span>Shipping Charged After Purchase</span>
          </div>
          <div className="flex justify-between text-xl font-bold">
            <span>Total:</span>
            <span>{formatPriceVND(subtotal)}</span>
          </div>
          <Button
            className="mt-4 w-full border border-primary bg-white text-primary hover:bg-primary hover:text-white"
            onClick={handleCheckout}
          >
            Proceed to checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
