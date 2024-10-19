"use client";

import React, { useState, useEffect } from "react";
import walletAPI from "@/lib/api/walletAPI";
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
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchWalletInfo();
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

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive number",
        variant: "destructive",
      });
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string or numbers with up to 2 decimal places
    if (value === "" || /^\d+(\.\d{0,2})?$/.test(value)) {
      setDepositAmount(value);
    }
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
              <span className="font-bold">
                {formatPriceVND(wallet.balance)}
              </span>
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Deposit Money</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Deposit Money</DialogTitle>
                  <DialogDescription>
                    Enter the amount you want to deposit into your wallet.
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
                </div>
                <DialogFooter>
                  <Button onClick={handleDeposit} disabled={loading}>
                    {loading ? "Processing..." : "Deposit"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      ) : (
        <p>Loading wallet information...</p>
      )}
    </div>
  );
}
