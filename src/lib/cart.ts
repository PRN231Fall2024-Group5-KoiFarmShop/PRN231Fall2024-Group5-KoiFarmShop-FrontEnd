import { KoiFish } from "./api/koiFishApi";

export interface CartItem extends KoiFish {
  quantity: number;
}

export function addToCart(koi: KoiFish) {
  const cart = getCart();
  const existingItem = cart.find((item) => item.id === koi.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...koi, quantity: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  window.dispatchEvent(new Event("storage"));
}

export function getCart(): CartItem[] {
  const cartJson = localStorage.getItem("cart");
  return cartJson ? JSON.parse(cartJson) : [];
}

export function removeFromCart(koiId: number) {
  const cart = getCart().filter((item) => item.id !== koiId);
  localStorage.setItem("cart", JSON.stringify(cart));
  window.dispatchEvent(new Event("storage"));
}

export function updateCartItemQuantity(koiId: number, quantity: number) {
  const cart = getCart();
  const item = cart.find((item) => item.id === koiId);
  if (item) {
    item.quantity = quantity;
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("storage"));
  }
}
