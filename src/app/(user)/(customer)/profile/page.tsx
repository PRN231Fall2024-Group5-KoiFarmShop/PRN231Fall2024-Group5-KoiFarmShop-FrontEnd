"use client";

import React, { useState, useEffect } from "react";
import walletAPI from "@/lib/api/walletAPI";
import withdrawnRequestAPI from "@/lib/api/withdrawRequestAPI";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatPriceVND } from "@/lib/utils";
import { Edit2, CreditCard } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface WithdrawRequest {
  id: number;
  bankNote: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface User {
  id: number;
  email: string;
  imageUrl: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  dob: string;
  roleName: string;
  loyaltyPoints: number;
}

export default function ProfilePage() {
  const [wallet, setWallet] = useState<{
    balance: number;
    loyaltyPoints: number;
  } | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [withdrawRequests, setWithdrawRequests] = useState<WithdrawRequest[]>([]);
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [bankNote, setBankNote] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchWalletInfo();
    fetchWithdrawRequests();
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const fetchWalletInfo = async () => {
    const response = await walletAPI.getCurrentUserWallet();
    if (response.isSuccess && response.data) {
      setWallet(response.data);
    } else {
      toast({
        title: "Error",
        description: response.message,
        variant: "destructive",
      });
    }
  };

  const fetchWithdrawRequests = async () => {
    const response = await withdrawnRequestAPI.getWithdrawnRequestsByUserId();
    if (response.isSuccess && response.data) {
      setWithdrawRequests(response.data);
    } else {
      toast({
        title: "Error",
        description: response.message,
        variant: "destructive",
      });
    }
  };

  const handleDepositVNPay = async () => {
    const amount = parseFloat(depositAmount);
    if (!isAmountValid(amount)) {
      return;
    }

    setLoading(true);
    const response = await walletAPI.depositMoney(amount);
    setLoading(false);

    if (response.isSuccess && response.data) {
      toast({
        title: "Success",
        description: "Deposit initiated successfully",
      });
      window.location.href = response.data.payUrl;
    } else {
      toast({
        title: "Error",
        description: response.message,
        variant: "destructive",
      });
    }
  };

  const handleDepositPayOS = async () => {
    const amount = parseFloat(depositAmount);
    if (!isAmountValid(amount)) {
      return;
    }

    setLoading(true);
    const response = await walletAPI.depositMoneyByPayOs(amount);
    setLoading(false);

    if (response.isSuccess && response.data) {
      toast({
        title: "Success",
        description: "Deposit initiated successfully",
      });
      window.location.href = response.data.payUrl;
    } else {
      toast({
        title: "Error",
        description: response.message,
        variant: "destructive",
      });
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!isAmountValid(amount)) {
      return;
    }

    if (!bankNote) {
      toast({
        title: "Bank Note Missing",
        description: "Please provide a bank note for the withdrawal",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const response = await withdrawnRequestAPI.createWithdrawnRequest(bankNote, amount.toString());
    setLoading(false);

    if (response.isSuccess && response.data) {
      toast({
        title: "Success",
        description: "Withdrawal request initiated successfully",
      });
      setWithdrawAmount("");
      setBankNote("");
      fetchWithdrawRequests();
    } else {
      toast({
        title: "Error",
        description: response.message,
        variant: "destructive",
      });
    }

    fetchWalletInfo();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d+(\.\d{0,2})?$/.test(value)) {
      setDepositAmount(value);
    }
  };

  const handleQuickSelect = (amount: number) => {
    setDepositAmount(amount.toString());
  };

  const handleBankNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBankNote(e.target.value);
  };

  const isAmountValid = (amount: number) => {
    if (isNaN(amount) || amount < 20000 || amount > 10000000) {
      toast({
        title: "Invalid Amount",
        description: "Please enter an amount between 20,000 VND and 10,000,000 VND",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">General</h1>

      {user && (
        <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <img
                src={user.imageUrl || "/default-avatar.png"}
                alt="User Avatar"
                className="h-24 w-24 rounded-full object-cover"
              />
              <div>
                <h2 className="text-xl font-semibold">{user.fullName}</h2>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="mt-2 flex items-center text-sm text-gray-600">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Loyalty Points: {wallet?.loyaltyPoints || user.loyaltyPoints}
                </p>
              </div>
            </div>
            <Link href="/profile/edit">
              <Button variant="outline" size="icon">
                <Edit2 className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      <h2 className="mb-4 text-xl font-bold">My Wallet</h2>

      {wallet ? (
        <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-lg">
              Current Balance:{" "}
              <span className="font-bold">{formatPriceVND(wallet.balance)}</span>
            </p>
            <div className="flex space-x-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Deposit VNPay</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Deposit VNPay</DialogTitle>
                    <DialogDescription>
                      Enter the amount to deposit via VNPay.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="amount" className="text-right">
                        Amount
                      </Label>
                      <Input
                        id="amount"
                        type="text"
                        inputMode="decimal"
                        value={depositAmount}
                        onChange={handleInputChange}
                        placeholder="Enter amount"
                        className="col-span-3"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {[20000, 50000, 100000, 200000, 500000, 1000000, 5000000].map((amount) => (
                        <Button
                          key={amount}
                          onClick={() => handleQuickSelect(amount)}
                          variant="outline"
                          className="text-sm"
                        >
                          {formatPriceVND(amount)}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleDepositVNPay} disabled={loading}>
                      {loading ? "Processing..." : "Deposit VNPay"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Deposit PayOS</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Deposit PayOS</DialogTitle>
                    <DialogDescription>
                      Enter the amount to deposit via PayOS.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="amount" className="text-right">
                        Amount
                      </Label>
                      <Input
                        id="amount"
                        type="text"
                        inputMode="decimal"
                        value={depositAmount}
                        onChange={handleInputChange}
                        placeholder="Enter amount"
                        className="col-span-3"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {[20000, 50000, 100000, 200000, 500000, 1000000, 5000000].map((amount) => (
                        <Button
                          key={amount}
                          onClick={() => handleQuickSelect(amount)}
                          variant="outline"
                          className="text-sm"
                        >
                          {formatPriceVND(amount)}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleDepositPayOS} disabled={loading}>
                      {loading ? "Processing..." : "Deposit PayOS"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      ) : (
        <p>Loading wallet information...</p>
      )}

      <h2 className="mb-4 text-xl font-bold">My Withdrawn Requests</h2>

      {withdrawRequests.length > 0 ? (
        <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
          <table className="min-w-full table-auto bg-white">
            <thead>
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Bank Note</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Created At</th>
              </tr>
            </thead>
            <tbody>
              {withdrawRequests.map((request) => (
                <tr key={request.id} className="border-b">
                  <td className="px-4 py-2">{request.id}</td>
                  <td className="px-4 py-2">{request.bankNote}</td>
                  <td className="px-4 py-2">{formatPriceVND(request.amount)}</td>
                  <td className="px-4 py-2">{request.status}</td>
                  <td className="px-4 py-2">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No withdrawal requests found.</p>
      )}
    </div>
  );
}
