"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Sparkles, AlertCircle, Clock, XCircle } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type PaymentStatus = string | "PAID" | "PENDING" | "PROGRESS" | "CANCELLED";

interface PaymentDetails {
  code: string;
  id: string;
  cancel: string;
  amount: string;
  status: PaymentStatus;
  orderCode: string;
}

const VnDong = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  });

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(
    null,
  );

  useEffect(() => {
    const details: Partial<PaymentDetails> = {};
    searchParams.forEach((value, key) => {
      if (key === "orderCode") {
        details[key] = value;
      } else {
        details[key as keyof PaymentDetails] = value;
      }
    });
    setPaymentDetails(details as PaymentDetails);
  }, [searchParams]);

  if (!paymentDetails) {
    return <div>Loading...</div>;
  }

  const isSuccess =
    paymentDetails.code === "00" &&
    paymentDetails.cancel === "false" &&
    paymentDetails.status === "PAID";
  const isPending =
    paymentDetails.code === "00" &&
    paymentDetails.cancel === "false" &&
    (paymentDetails.status === "PENDING" ||
      paymentDetails.status === "PROGRESS");
  const isCancelled =
    paymentDetails.code === "00" &&
    paymentDetails.cancel === "true" &&
    paymentDetails.status === "CANCELLED";

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case "PAID":
        return "text-green-400";
      case "PENDING":
      case "PROGRESS":
        return "text-yellow-400";
      case "CANCELLED":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusIcon = () => {
    if (isSuccess) return <Sparkles className="mb-2 h-8 w-8 text-yellow-300" />;
    if (isPending) return <Clock className="mb-2 h-8 w-8 text-white" />;
    if (isCancelled) return <XCircle className="mb-2 h-8 w-8 text-red-300" />;
    return <AlertCircle className="mb-2 h-8 w-8 text-gray-300" />;
  };

  const getStatusMessage = () => {
    if (isSuccess) return "Payment Successful";
    if (isPending) return "Payment Pending";
    if (isCancelled) return "Payment Cancelled";
    return "Payment Status Unknown";
  };

  const getStatusNote = () => {
    if (isSuccess) return "Transaction has been paid successfully!";
    if (isPending) return "Transaction is being processed. Please wait.";
    if (isCancelled)
      return "Transaction has been cancelled or is awaiting payment.";
    return "Unable to determine transaction status.";
  };

  const getHeaderColor = () => {
    if (isSuccess) return "bg-emerald-500";
    if (isPending) return "bg-yellow-500";
    if (isCancelled) return "bg-red-500";
    return "bg-gray-500";
  };

  return (
    <div className="flex items-center justify-center p-4 py-20">
      <Card className="w-full max-w-md bg-gray-900 text-gray-100">
        <CardContent className="p-0">
          <div
            className={`${getHeaderColor()} flex flex-col items-center justify-center rounded-t-lg p-6`}
          >
            {getStatusIcon()}
            <h2 className="text-2xl font-bold">{getStatusMessage()}</h2>
          </div>
          <div className="space-y-4 p-6">
            <div className="flex justify-between">
              <span className="text-gray-400">Transaction ID</span>
              <span className="font-medium">{paymentDetails.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Order Code</span>
              <span className="font-medium">
                {parseInt(paymentDetails.orderCode).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Amount</span>
              <span className="font-medium">
                {VnDong.format(Number(paymentDetails.amount))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Status</span>
              <span
                className={`font-medium ${getStatusColor(paymentDetails.status)}`}
              >
                {paymentDetails.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Note</span>
              <span className="text-right font-medium">{getStatusNote()}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full bg-sky-500 text-white hover:bg-sky-600"
            onClick={() => (window.location.href = "/profile")}
          >
            Back to your profile
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}