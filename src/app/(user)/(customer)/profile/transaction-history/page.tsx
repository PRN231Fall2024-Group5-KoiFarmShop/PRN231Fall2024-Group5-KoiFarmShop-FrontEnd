"use client";

import React, { useState, useEffect } from "react";
import walletAPI from "@/lib/api/walletAPI";
import { useToast } from "@/hooks/use-toast";
import { formatPriceVND } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface WalletTransaction {
  orderId: number | null;
  transactionType: string;
  paymentMethod: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  transactionDate: string;
  transactionStatus: string;
  note: string;
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    const response = await walletAPI.getWalletTransactions();
    setLoading(false);

    if (response.isSuccess && response.data) {
      setTransactions(response.data);
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
      <h1 className="mb-4 text-2xl font-bold">Transaction History</h1>
      {loading ? (
        <p>Loading transactions...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Balance After</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction, index) => (
              <TableRow key={index}>
                <TableCell>{formatDate(transaction.transactionDate)}</TableCell>
                <TableCell>{transaction.transactionType}</TableCell>
                <TableCell>{transaction.paymentMethod}</TableCell>
                <TableCell>{formatPriceVND(transaction.amount)}</TableCell>
                <TableCell>{transaction.transactionStatus}</TableCell>
                <TableCell>
                  {formatPriceVND(transaction.balanceAfter)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
