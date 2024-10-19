"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import walletAPI from "@/lib/api/walletAPI";
import { useToast } from "@/hooks/use-toast";
import { formatPriceVND } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface KoiFish {
  id: number;
  name: string;
  price: number;
}

interface OrderDetail {
  id: number;
  koiFishId: number;
  consignmentForNurtureId: number | null;
  price: number;
  status: string;
  koiFish: KoiFish;
}

interface Order {
  id: number;
  userId: number;
  orderDate: string;
  totalAmount: number;
  orderStatus: string;
  shippingAddress: string;
  paymentMethod: string;
  note: string;
  orderDetails: OrderDetail[];
}

function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const fetchOrderHistory = async () => {
    setLoading(true);
    const response = await walletAPI.getOrderHistory();
    setLoading(false);

    if (response.isSuccess && response.data) {
      setOrders(response.data);
    } else {
      toast({
        title: "Error",
        description: response.message,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Order History</h1>
      {loading ? (
        <p>Loading orders...</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Order #{order.id}</span>
                  <Badge>{order.orderStatus}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2">Date: {formatDate(order.orderDate)}</p>
                <p className="mb-2">
                  Total: {formatPriceVND(order.totalAmount)}
                </p>
                <p className="mb-2">Payment Method: {order.paymentMethod}</p>
                <p className="mb-4">
                  Shipping Address: {order.shippingAddress}
                </p>
                <h3 className="mb-2 font-semibold">Order Items:</h3>
                <ul className="mb-4 list-inside list-disc">
                  {order.orderDetails.map((detail) => (
                    <li key={detail.id}>
                      {detail.koiFish.name} - {formatPriceVND(detail.price)}
                      {detail.consignmentForNurtureId && (
                        <span className="ml-2 text-sm text-gray-500">
                          (Nurture)
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
                {order.note && (
                  <p className="mt-2 text-sm text-gray-500">
                    Note: {order.note}
                  </p>
                )}
                <div className="mt-4 flex justify-end">
                  <Link href={`/profile/order-history/${order.id}`}>
                    <Button variant="outline">View Detail</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrderHistoryPage;
