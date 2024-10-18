"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCart, CartItem, clearCart } from "@/lib/cart";
import koiFishApi from "@/lib/api/koiFishApi";
import koiDietApi, { KoiDiet } from "@/lib/api/koiDiet";
import orderAPI, { createOrderDataFromCart } from "@/lib/api/orderAPI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatPriceVND } from "@/lib/utils";
import Image from "next/image";
import { DateRange } from "react-day-picker";
import { differenceInDays, format } from "date-fns";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface ExtendedCartItem extends CartItem {
  consign: boolean;
  consignmentConfig?: {
    dietId: number;
    dateRange: DateRange | undefined;
  };
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<ExtendedCartItem[]>(getCart());
  const [shippingAddress, setShippingAddress] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const rawUser = localStorage.getItem("user");
    if (rawUser) {
      const user = JSON.parse(rawUser);
      setShippingAddress(user.address);
    }
  }, []);

  const { data: koiDetails, isLoading: isLoadingKoi } = useQuery({
    queryKey: ["koiDetails"],
    queryFn: async () => {
      const itemIds = cartItems.map((item) => item.id);
      if (itemIds.length === 0) return [];
      const response = await koiFishApi.getMultipleKoiDetails(itemIds);
      if (!response.isSuccess) throw new Error(response.message);
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

  const calculateConsignmentDuration = (dateRange: DateRange | undefined) => {
    if (!dateRange?.from || !dateRange?.to) return 0;
    return differenceInDays(dateRange.to, dateRange.from) + 1;
  };

  const calculateConsignmentPrice = (item: ExtendedCartItem) => {
    if (!item.consignmentConfig || !diets) return 0;
    const { dietId, dateRange } = item.consignmentConfig;
    const duration = calculateConsignmentDuration(dateRange);
    const diet = diets.find((d) => d.id === dietId);
    if (!diet) return 0;
    return diet.dietCost * duration;
  };

  const subtotal = cartItems.reduce(
    (total, item) =>
      total + item.price + (item.consign ? calculateConsignmentPrice(item) : 0),
    0,
  );

  const handleShippingAddressChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newAddress = e.target.value;
    setShippingAddress(newAddress);
  };

  const handlePlaceOrder = async () => {
    if (!shippingAddress) {
      toast({
        title: "Error",
        description: "Please enter a shipping address.",
        variant: "destructive",
      });
      return;
    }

    const orderData = createOrderDataFromCart(
      cartItems,
      shippingAddress,
      orderNote,
    );

    try {
      const response = await orderAPI.createOrder(orderData);
      if (response.isSuccess) {
        toast({
          title: "Order Placed",
          description: "Your order has been successfully placed.",
        });
        clearCart();
        router.push("/order-success");
      } else {
        toast({
          title: "Error",
          description:
            response.message || "Failed to create order. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isLoading = isLoadingKoi || isLoadingDiets;

  if (isLoading) {
    return <div className="text-center">Loading checkout information...</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center">
        <p>Your cart is empty. Please add items before checking out.</p>
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
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/cart/checkout">Checkout</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-4">
        <h1 className="mb-4 text-2xl font-bold">Checkout</h1>

        <div className="mb-8">
          <h2 className="mb-2 text-xl font-semibold">Order Summary</h2>
          {cartItems.map((item) => (
            <div key={item.id} className="mb-4 border-b pb-4">
              <div className="flex items-center">
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
                <div className="flex-grow">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p>Price: {formatPriceVND(item.price)}</p>
                </div>
                <div className="text-right">
                  <p>Subtotal: {formatPriceVND(item.price)}</p>
                  {item.consign && item.consignmentConfig && (
                    <div>
                      <p>Consignment: Yes</p>
                      <p>
                        Diet:{" "}
                        {
                          diets?.find(
                            (d) => d.id === item.consignmentConfig?.dietId,
                          )?.name
                        }
                      </p>
                      <p>
                        Duration:{" "}
                        {calculateConsignmentDuration(
                          item.consignmentConfig.dateRange,
                        )}{" "}
                        days
                      </p>
                      <p>
                        Start Date:{" "}
                        {item.consignmentConfig.dateRange?.from
                          ? format(item.consignmentConfig.dateRange.from, "PP")
                          : "N/A"}
                      </p>
                      <p>
                        End Date:{" "}
                        {item.consignmentConfig.dateRange?.to
                          ? format(item.consignmentConfig.dateRange.to, "PP")
                          : "N/A"}
                      </p>
                      <p>
                        Consignment Cost:{" "}
                        {formatPriceVND(calculateConsignmentPrice(item))}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <h2 className="mb-2 text-xl font-semibold">Shipping Information</h2>
          <Input
            placeholder="Enter your shipping address"
            value={shippingAddress}
            onChange={handleShippingAddressChange}
            className="mb-4"
          />
          <Textarea
            placeholder="Order notes (optional)"
            value={orderNote}
            onChange={(e) => setOrderNote(e.target.value)}
          />
        </div>

        <div className="mb-8">
          <h2 className="mb-2 text-xl font-semibold">Order Total</h2>
          <p className="text-right text-xl font-bold">
            Total: {formatPriceVND(subtotal)}
          </p>
        </div>

        <Button
          onClick={handlePlaceOrder}
          className="hover:bg-primary-dark w-full bg-primary text-white"
          disabled={cartItems.length === 0 || !shippingAddress}
        >
          Place Order
        </Button>
      </div>
    </div>
  );
}
