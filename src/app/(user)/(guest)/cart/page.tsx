"use client";

import { useState, useEffect, useRef } from "react";
import {
  getCart,
  removeFromCart,
  updateCartItemQuantity,
  CartItem,
} from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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

// Update the mock data to include more details
const mockPackageCare = [
  {
    id: 1,
    name: "Basic Care",
    minSize: 0,
    maxSize: 30,
    dailyCost: 100000,
    description:
      "Essential care for small koi. Includes daily feeding and basic water quality monitoring.",
  },
  {
    id: 2,
    name: "Standard Care",
    minSize: 31,
    maxSize: 60,
    dailyCost: 200000,
    description:
      "Comprehensive care for medium-sized koi. Includes premium food, regular health checks, and water quality management.",
  },
  {
    id: 3,
    name: "Premium Care",
    minSize: 61,
    maxSize: 100,
    dailyCost: 300000,
    description:
      "Luxury care for large koi. Includes gourmet food, daily health monitoring, advanced water treatment, and personalized attention.",
  },
];

const mockDiets = [
  {
    id: 1,
    name: "Standard Diet",
    dailyCost: 50000,
    description: "Balanced nutrition for general health and vibrant colors.",
  },
  {
    id: 2,
    name: "Premium Diet",
    dailyCost: 100000,
    description:
      "High-quality ingredients to enhance growth and color intensity.",
  },
  {
    id: 3,
    name: "Gourmet Diet",
    dailyCost: 150000,
    description:
      "Exclusive blend of rare ingredients for optimal health, growth, and color development.",
  },
];

interface ConsignmentConfig {
  packageCareId: number;
  dietId: number;
  dateRange: DateRange | undefined;
}

interface ExtendedCartItem extends CartItem {
  consign: boolean;
  consignmentConfig?: ConsignmentConfig;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<ExtendedCartItem[]>([]);

  useEffect(() => {
    const items = getCart().map((item) => ({ ...item, consign: false }));
    setCartItems(items);
  }, []);

  const handleRemoveItem = (koiId: number) => {
    removeFromCart(koiId);
    setCartItems(getCart().map((item) => ({ ...item, consign: false })));
  };

  const handleUpdateQuantity = (koiId: number, quantity: number) => {
    updateCartItemQuantity(koiId, quantity);
    setCartItems(getCart().map((item) => ({ ...item, consign: false })));
  };

  const handleConsignToggle = (koiId: number) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === koiId
          ? {
              ...item,
              consign: !item.consign,
              consignmentConfig: item.consign
                ? undefined
                : {
                    packageCareId: 1,
                    dietId: 1,
                    dateRange: undefined,
                  },
            }
          : item,
      ),
    );
  };

  const handleConsignmentConfigChange = (
    koiId: number,
    field: keyof ConsignmentConfig,
    value: any,
  ) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === koiId && item.consignmentConfig
          ? {
              ...item,
              consignmentConfig: { ...item.consignmentConfig, [field]: value },
            }
          : item,
      ),
    );
  };

  const calculateConsignmentDuration = (dateRange: DateRange | undefined) => {
    if (!dateRange?.from || !dateRange?.to) return 0;
    return differenceInDays(dateRange.to, dateRange.from) + 1; // Add 1 to include both start and end dates
  };

  const calculateConsignmentPrice = (item: ExtendedCartItem) => {
    if (!item.consignmentConfig) return 0;
    const { packageCareId, dietId, dateRange } = item.consignmentConfig;
    const duration = calculateConsignmentDuration(dateRange);
    const packageCare = mockPackageCare.find((pkg) => pkg.id === packageCareId);
    const diet = mockDiets.find((d) => d.id === dietId);
    if (!packageCare || !diet) return 0;
    return (packageCare.dailyCost + diet.dailyCost) * duration;
  };

  const isConsignmentConfigComplete = (
    config: ConsignmentConfig | undefined,
  ) => {
    if (!config) return false;
    return (
      config.packageCareId !== 0 &&
      config.dietId !== 0 &&
      config.dateRange !== undefined &&
      calculateConsignmentDuration(config.dateRange) > 0
    );
  };

  const subtotal = cartItems.reduce(
    (total, item) =>
      total +
      item.price * item.quantity +
      (item.consign ? calculateConsignmentPrice(item) : 0),
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
              ? `${selectedOption.name} - ${formatPriceVND(selectedOption.dailyCost)}/day`
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
                  {option.name} - {formatPriceVND(option.dailyCost)}/day
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
        {cartItems.length === 0 ? (
          <div className="text-center">
            <p className="mb-4 text-lg">Your cart is empty.</p>
            <Link href="/search">
              <Button className="border border-primary bg-white text-primary hover:bg-primary hover:text-white">
                Continue Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col space-y-4">
              {/* Header */}
              <div className="hidden text-sm font-semibold md:flex">
                <div className="w-2/5 pr-2">Product</div>
                <div className="w-1/6 text-right">Price</div>
                {/* <div className="w-1/6 text-center">Quantity</div> */}
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
                    <div className="mb-2 flex w-full items-center pr-2 md:mb-0 md:w-2/5">
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
                    {/* <div className="mb-2 flex w-full justify-center md:mb-0 md:w-1/6">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateQuantity(
                            item.id,
                            parseInt(e.target.value),
                          )
                        }
                        className="w-16 text-center"
                      />
                    </div> */}
                    <div className="mb-2 w-full text-right md:mb-0 md:w-1/6">
                      {formatPriceVND(item.price * item.quantity)}
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
                            <CustomDropdown
                              options={mockPackageCare}
                              value={item.consignmentConfig.packageCareId}
                              onChange={(value: any) =>
                                handleConsignmentConfigChange(
                                  item.id,
                                  "packageCareId",
                                  value,
                                )
                              }
                              label="Select package care"
                            />
                            <CustomDropdown
                              options={mockDiets}
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
                                (mockPackageCare.find(
                                  (pkg) =>
                                    pkg.id ===
                                    item.consignmentConfig?.packageCareId,
                                )?.dailyCost || 0) +
                                  (mockDiets.find(
                                    (diet) =>
                                      diet.id ===
                                      item.consignmentConfig?.dietId,
                                  )?.dailyCost || 0),
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
                            {isConsignmentConfigComplete(
                              item.consignmentConfig,
                            ) ? (
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
              <Button className="mt-4 w-full border border-primary bg-white text-primary hover:bg-primary hover:text-white">
                Proceed to checkout
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
