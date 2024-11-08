"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronRight } from "lucide-react";
import walletAPI, { WalletTransaction } from "@/lib/api/walletAPI";
import consignmentAPI from "@/lib/api/consignmentAPI";
import { useToast } from "@/hooks/use-toast";
import { formatPriceVND, formatDate } from "@/lib/utils";

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

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
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
      setTransactions(transactionsResponse.data);
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

  const toggleRow = (id: number) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id],
    );
  };

  if (loading) {
    return <div>Loading order details...</div>;
  }

  if (!order) {
    return <div>Order not found</div>;
  }

  const totalFishPrice = order.orderDetails.reduce(
    (sum, detail) => sum + detail.price,
    0,
  );
  const totalConsignmentCost = order.orderDetails.reduce(
    (sum, detail) =>
      sum +
      (detail.consignmentForNurtureId &&
      consignments[detail.consignmentForNurtureId]
        ? consignments[detail.consignmentForNurtureId].projectedCost
        : 0),
    0,
  );

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left side - Detailed Tables */}
        <div className="md:col-span-2">
          <h1 className="mb-6 text-2xl font-bold">Order Details</h1>

          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead></TableHead>
                    <TableHead>Fish Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.orderDetails.map((detail) => (
                    <React.Fragment key={detail.id}>
                      <TableRow
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleRow(detail.id)}
                      >
                        <TableCell className="w-4">
                          {detail.consignmentForNurtureId && (
                            <span className="flex h-4 w-4 items-center justify-center">
                              {expandedRows.includes(detail.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {detail.koiFish.name}
                        </TableCell>
                        <TableCell>{formatPriceVND(detail.price)}</TableCell>
                        <TableCell>
                          <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
                            {detail.status}
                          </span>
                        </TableCell>
                      </TableRow>
                      {expandedRows.includes(detail.id) &&
                        detail.consignmentForNurtureId &&
                        consignments[detail.consignmentForNurtureId] && (
                          <TableRow className="bg-muted/50">
                            <TableCell colSpan={4}>
                              <div className="px-4 py-2">
                                <h4 className="mb-2 font-semibold">
                                  Consignment Details
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-muted-foreground">
                                      Start Date
                                    </p>
                                    <p>
                                      {formatDate(
                                        consignments[
                                          detail.consignmentForNurtureId
                                        ].startDate,
                                      )}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">
                                      End Date
                                    </p>
                                    <p>
                                      {formatDate(
                                        consignments[
                                          detail.consignmentForNurtureId
                                        ].endDate,
                                      )}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">
                                      Daily Feed Amount
                                    </p>
                                    <p>
                                      {
                                        consignments[
                                          detail.consignmentForNurtureId
                                        ].dailyFeedAmount
                                      }
                                      g
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">
                                      Projected Cost
                                    </p>
                                    <p>
                                      {formatPriceVND(
                                        consignments[
                                          detail.consignmentForNurtureId
                                        ].projectedCost,
                                      )}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">
                                      Status
                                    </p>
                                    <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
                                      {
                                        consignments[
                                          detail.consignmentForNurtureId
                                        ].consignmentStatus
                                      }
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right side - Order Summary */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Order #{order.id}
                <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
                  {order.orderStatus}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p>{formatDate(order.orderDate)}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Payment Method
                  </p>
                  <p>{order.paymentMethod}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Shipping Address
                  </p>
                  <p>{order.shippingAddress}</p>
                </div>

                {order.note && (
                  <div>
                    <p className="text-sm text-muted-foreground">Note</p>
                    <p>{order.note}</p>
                  </div>
                )}

                <Separator />

                {/* Cost Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Fish Price</span>
                    <span>{formatPriceVND(totalFishPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nurture Cost</span>
                    <span>{formatPriceVND(totalConsignmentCost)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{formatPriceVND(order.totalAmount)}</span>
                  </div>
                </div>

                <Separator />

                {/* Transaction History */}
                <div>
                  <p className="mb-2 font-semibold">Transaction</p>
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.transactionDate}
                      className="rounded-lg bg-muted p-3"
                    >
                      <p className="text-sm">
                        Type: {transaction.transactionType}
                      </p>
                      <p className="text-sm">
                        Amount: {formatPriceVND(transaction.amount)}
                      </p>
                      <p className="text-sm">
                        Date: {formatDate(transaction.transactionDate)}
                      </p>
                      <p className="text-sm">
                        Status:{" "}
                        <span className="font-semibold text-green-600">
                          {transaction.transactionStatus}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
