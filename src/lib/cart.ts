import { DateRange } from "react-day-picker";
import { KoiFish } from "@/lib/api/koiFishApi";

export interface CartItem {
  id: number;
  price: number;
  name: string;
  koiFishImages: { imageUrl: string }[];
  consign: boolean;
  consignmentConfig?: {
    dietId: number;
    dateRange: DateRange | undefined;
  };
}

const CART_STORAGE_KEY = "cart";

export const getCart = (): CartItem[] => {
  if (typeof window === "undefined") {
    return [];
  }
  const cartJson = localStorage.getItem(CART_STORAGE_KEY);
  return cartJson ? JSON.parse(cartJson) : [];
};

export const saveCart = (cart: CartItem[]) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
};

export const addToCart = (koiFish: KoiFish) => {
  const cart = getCart();
  const existingItem = cart.find((cartItem) => cartItem.id === koiFish.id);

  if (!existingItem) {
    const cartItem: CartItem = {
      id: koiFish.id,
      price: koiFish.price,
      name: koiFish.name,
      koiFishImages: koiFish.koiFishImages,
      consign: false,
    };
    cart.push(cartItem);
    saveCart(cart);
  }
};

export const removeFromCart = (koiId: number) => {
  const cart = getCart().filter((item) => item.id !== koiId);
  saveCart(cart);
};

export const updateCartItemConsignment = (
  koiId: number,
  consign: boolean,
  consignmentConfig?: CartItem["consignmentConfig"],
) => {
  const cart = getCart().map((item) =>
    item.id === koiId ? { ...item, consign, consignmentConfig } : item,
  );
  saveCart(cart);
};

export const clearCart = () => {
  localStorage.removeItem(CART_STORAGE_KEY);
};
