"use client";

import axiosClient from '@/lib/api/axiosClient';
import { format } from 'date-fns';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface KoiFish {
  id: number;
  name?: string;
  origin?: string;
  gender?: string;
  dob?: string;
  length?: number;
  weight?: number;
  personalityTraits?: string;
  dailyFeedAmount?: number;
  lastHealthCheck?: string;
  isAvailableForSale: boolean;
  price: number;
  isConsigned?: boolean;
  isSold?: boolean;
}

interface Consignment {
  id: number;
  customerId?: number | null;
  koiFishId: number;
  dietId: number;
  staffId?: number | null;
  consignmentDate?: string | null;
  startDate: string;
  endDate: string;
  note?: string | null;
  dietCost: number;
  laborCost?: number | null;
  dailyFeedAmount?: number;
  totalDays: number;
  projectedCost?: number;
  actualCost?: number | null;
  inspectionRequired?: boolean | null;
  inspectionDate?: string | null;
  consignmentStatus: string;
}

interface OrderDetail {
  id: number;
  koiFish?: KoiFish;
  consignmentForNurture?: Consignment;
  price: number;
  status: string;
}

interface WalletTransaction {
  transactionType?: string;
  paymentMethod?: string;
  amount?: number;
  balanceBefore?: number;
  balanceAfter?: number;
  transactionDate?: string;
  transactionStatus?: string;
}

interface Order {
  id: number;
  userId: number;
  orderDate: string;
  totalAmount: number;
  orderStatus: string;
  shippingAddress: string;
  paymentMethod: string;
  note?: string;
  walletTransaction?: WalletTransaction | null;
  orderDetails: OrderDetail[];
  userName?: string;
}

export default function OrderManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axiosClient.get("/orders");
        if (response.data.isSuccess) {
          setOrders(response.data.data
            .sort((a: Order, b: Order) => {
              return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
            })
          );
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleAssignStaff = (orderDetailId: number, staffId: number) => {
    console.log(`Assigning staff ID ${staffId} to order detail ID ${orderDetailId}`);
    // Add API call or additional logic for staff assignment
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Order Management</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full border-collapse border">
          <thead>
            <tr>
              <th className="border p-2">Order ID</th>
              <th className="border p-2">Order Date</th>
              <th className="border p-2">Total Amount</th>
              <th className="border p-2">Order Status</th>
              <th className="border p-2">Shipping Address</th>
              <th className="border p-2">Payment Method</th>
              <th className="border p-2">Username/Email</th>
              <th className="border p-2">Order Details</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="border p-2">{order.id}</td>
                <td className="border p-2">{format(new Date(order.orderDate), "HH:mm dd/MM/yyyy")}</td>
                <td className="border p-2">{
                  // format VND
                  new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(order.totalAmount)
                  
                  }</td>
                <td className="border p-2">{order.orderStatus}</td>
                <td className="border p-2">{order.shippingAddress}</td>
                <td className="border p-2">{order.paymentMethod}</td>
                <td className="border p-2">{order?.userName}</td>
                <td className="border p-2">
                  <Link href={`/manager/order-management/${order.id}`} className='underline text-blue-400'>
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
