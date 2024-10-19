"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import walletAPI from "@/lib/api/walletAPI";
import consignmentAPI from "@/lib/api/consignmentAPI";
import { useToast } from "@/hooks/use-toast";
import { formatPriceVND, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

interface OrderDetail {
  id: number;
  koiFishId: number;
  consignmentForNurtureId: number | null;
  price: number;
  status: string;
  koiFish: KoiFish;
}

interface KoiFish {
  id: number;
  name: string;
  price: number;
}

interface WalletTransaction {
  orderId: number;
  transactionType: string;
  paymentMethod: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  transactionDate: string;
  transactionStatus: string;
  note: string;
}

interface Consignment {
  id: number;
  startDate: string;
  endDate: string;
  dietCost: number;
  dailyFeedAmount: number;
  totalDays: number;
  projectedCost: number;
  consignmentStatus: string;
}

function OrderDetailPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [consignments, setConsignments] = useState<{
    [key: number]: Consignment;
  }>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    const orderResponse = await walletAPI.getOrderHistory();
    const transactionsResponse = await walletAPI.getOrderTransactions(
      Number(orderId),
    );

    if (orderResponse.isSuccess && orderResponse.data) {
      const orderDetail = orderResponse.data.find(
        (order) => order.id === Number(orderId),
      );
      if (orderDetail) {
        setOrder(orderDetail);
        fetchConsignments(orderDetail.orderDetails);
      }
    } else {
      toast({
        title: "Error",
        description: "Failed to fetch order details.",
        variant: "destructive",
      });
    }

    if (transactionsResponse.isSuccess && transactionsResponse.data) {
      setTransactions(transactionsResponse.data as any);
    }

    setLoading(false);
  };

  const fetchConsignments = async (orderDetails: OrderDetail[]) => {
    const consignmentPromises = orderDetails
      .filter((detail) => detail.consignmentForNurtureId)
      .map((detail) =>
        consignmentAPI.getConsignmentDetails(detail.consignmentForNurtureId!),
      );

    const consignmentResponses = await Promise.all(consignmentPromises);
    const newConsignments: { [key: number]: Consignment } = {};

    consignmentResponses.forEach((response) => {
      if (response.isSuccess && response.data) {
        newConsignments[response.data.id] = response.data;
      }
    });

    setConsignments(newConsignments);
  };

  if (loading) {
    return <div>Loading order details...</div>;
  }

  if (!order) {
    return <div>Order not found</div>;
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Order Details</h1>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Order #{order.id}</span>
            <Badge>{order.orderStatus}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Date: {formatDate(order.orderDate)}</p>
          <p>Total: {formatPriceVND(order.totalAmount)}</p>
          <p>Payment Method: {order.paymentMethod}</p>
          <p>Shipping Address: {order.shippingAddress}</p>
          {order.note && <p>Note: {order.note}</p>}
        </CardContent>
      </Card>

      <h2 className="mb-2 text-xl font-semibold">Order Items</h2>
      {order.orderDetails.map((detail) => (
        <Card key={detail.id} className="mb-4">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold">{detail.koiFish.name}</h3>
            <p>Price: {formatPriceVND(detail.price)}</p>
            <p>Status: {detail.status}</p>
            {detail.consignmentForNurtureId &&
              consignments[detail.consignmentForNurtureId] && (
                <div className="mt-2">
                  <h4 className="font-semibold">Consignment Details</h4>
                  <p>
                    Start Date:{" "}
                    {formatDate(
                      consignments[detail.consignmentForNurtureId].startDate,
                    )}
                  </p>
                  <p>
                    End Date:{" "}
                    {formatDate(
                      consignments[detail.consignmentForNurtureId].endDate,
                    )}
                  </p>
                  <p>
                    Daily Feed Amount:{" "}
                    {
                      consignments[detail.consignmentForNurtureId]
                        .dailyFeedAmount
                    }
                    g
                  </p>
                  <p>
                    Projected Cost:{" "}
                    {formatPriceVND(
                      consignments[detail.consignmentForNurtureId]
                        .projectedCost,
                    )}
                  </p>
                  <p>
                    Status:{" "}
                    {
                      consignments[detail.consignmentForNurtureId]
                        .consignmentStatus
                    }
                  </p>
                </div>
              )}
          </CardContent>
        </Card>
      ))}

      <h2 className="mb-2 text-xl font-semibold">Transactions</h2>
      {transactions.map((transaction) => (
        <Card key={transaction.transactionDate} className="mb-4">
          <CardContent className="pt-6">
            <p>Type: {transaction.transactionType}</p>
            <p>Amount: {formatPriceVND(transaction.amount)}</p>
            <p>Date: {formatDate(transaction.transactionDate)}</p>
            <p>Status: {transaction.transactionStatus}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default OrderDetailPage;
