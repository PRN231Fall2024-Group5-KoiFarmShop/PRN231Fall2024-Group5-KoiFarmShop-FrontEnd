"use client";

import axiosClient from '@/lib/api/axiosClient';
import { format } from 'date-fns';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Enum values based on OrderStatusEnums from the backend
const OrderStatusOptions = [
  { value: '', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'REFUNDED', label: 'Refunded' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

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
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [nameFilter, setNameFilter] = useState<string>('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axiosClient.get("/orders");
        if (response.data.isSuccess) {
          const sortedOrders = response.data.data.sort((a: Order, b: Order) => {
            return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
          });
          setOrders(sortedOrders);
          setFilteredOrders(sortedOrders); // Initially, set filtered orders to all orders
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    // Filter orders based on status and name filters
    const filtered = orders.filter(order => {
      const matchesStatus = statusFilter ? order.orderStatus === statusFilter : true;
      const matchesName = nameFilter ? order.userName?.toLowerCase().includes(nameFilter.toLowerCase()) : true;
      return matchesStatus && matchesName;
    });
    setFilteredOrders(filtered);
  }, [statusFilter, nameFilter, orders]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Order Management</h1>
      
      {/* Filter Inputs */}
      <div className="flex gap-4 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded"
        >
          {OrderStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <input
          type="text"
          placeholder="Filter by Name"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

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
              <th className="border p-2">Username/Email</th>
              <th className="border p-2">Order Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td className="border p-2">{order.id}</td>
                <td className="border p-2">{format(new Date(order.orderDate), "HH:mm dd/MM/yyyy")}</td>
                <td className="border p-2">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(order.totalAmount)}
                </td>
                <td className="border p-2">{order.orderStatus}</td>
                <td className="border p-2">{order.shippingAddress}</td>
                <td className="border p-2">{order.userName}</td>
                <td className="border p-2">
                  <Link href={`/manager/order-management/${order.id}`} className="underline text-blue-400">
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
