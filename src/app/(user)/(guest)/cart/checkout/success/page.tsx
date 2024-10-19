"use client";

import { Button } from "@/components/ui/button";
import React from "react";
import Image from "next/image";
function OrderSuccessPage() {
  return (
    <div className="flex h-[50vh] flex-col items-center justify-center text-center">
      <Image
        src="/order-success.jpg"
        alt="Order Success"
        width={300}
        height={300}
        className="pointer-events-nonemb-2"
      />
      <p className="mb-4 text-lg">Your order has been placed successfully.</p>
      <div className="flex flex-row gap-4">
        <Button
          variant="outlinePrimary"
          onClick={() => (window.location.href = "/")}
          className=""
        >
          Continue Shopping
        </Button>
        <Button
          variant="outlinePrimary"
          onClick={() => (window.location.href = "/profile/order-history")}
          className=""
        >
          View Order History
        </Button>
      </div>
    </div>
  );
}

export default OrderSuccessPage;
