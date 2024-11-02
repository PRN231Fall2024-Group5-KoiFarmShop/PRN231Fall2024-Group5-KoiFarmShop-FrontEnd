// app/order/[orderId]/page.tsx
"use client";

import { useToast } from '@/hooks/use-toast';
import axiosClient from '@/lib/api/axiosClient';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

type KoiFish = {
  id: number;
  name: string;
  origin: string;
  gender: string;
  dob: string;
  length: number;
  weight: number;
  personalityTraits: string;
  dailyFeedAmount: number;
  lastHealthCheck: string;
  isAvailableForSale: boolean;
  price: number;
  isConsigned: boolean;
  isSold: boolean;
  ownerId: number;
};

type OrderDetail = {
  id: number;
  orderId: number;
  koiFishId: number;
  price: number;
  status: string;
  staffId: number | null;
  koiFish: KoiFish;
};

type Order = {
  id: number;
  userId: number;
  orderDate: string;
  totalAmount: number;
  orderStatus: string;
  shippingAddress: string;
  paymentMethod: string;
  note: string;
  userName: string;
  walletTransaction: any;
  orderDetails: OrderDetail[];
};

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [staffUsers, setStaffUsers] = useState<any[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<{ [key: number]: number }>({});
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      const { data } = await axiosClient.get(`/orders/${orderId}`);
      if (data.isSuccess) {
        setOrder(data.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchStaffUsers = async () => {
    try {
      const { data } = await axiosClient.get('/users');
      if (data.isSuccess) {
        setStaffUsers(data.data.filter((user: any) => user?.roleName === 'STAFF'));
      }
    } catch (error) {
      console.error("Error fetching staff users:", error);
    }
  };

  const assignStaffToOrderDetail = async (orderDetailId: number) => {
    const staffId = selectedStaff[orderDetailId];
    if (!staffId) {
      toast({
        title: "Error",
        description: "No staff selected for assignment.",
      });
      return;
    }

    try {
      await axiosClient.put(`/order-detail/${orderDetailId}/assign`, staffId);
      toast({
        title: "Success",
        description: "Staff assigned successfully.",
      });
      fetchOrders(); // Refresh to see updated staff assignment
    } catch (error:any) {
      toast({
        title: "Error",
        description: `Failed to assign staff: ${error.message}`,
      });
      console.error(`Error assigning staff to order detail ${orderDetailId}:`, error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStaffUsers();
  }, []);

  if (!order) return <div>Loading...</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Order Details for Order ID: {orderId}</h1>
      
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-2">Order Information</h2>
        <p><strong>User:</strong> {order.userName}</p>
        <p><strong>Order Date:</strong> {new Date(order.orderDate).toLocaleDateString()}</p>
        <p><strong>Total Amount:</strong> {order.totalAmount} VND</p>
        <p><strong>Status:</strong> {order.orderStatus}</p>
        <p><strong>Shipping Address:</strong> {order.shippingAddress}</p>
        <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
        <p><strong>Note:</strong> {order.note}</p>
      </div>

      <h2 className="text-xl font-semibold mb-2">Order Items</h2>
      <ul className="space-y-4">
        {order.orderDetails.map((detail) => {
          const assignedStaff = staffUsers.find((user) => user.id === detail.staffId);
          return (
            <li key={detail.id} className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-bold">Koi Fish: {detail.koiFish.name}</h3>
              <p><strong>Origin:</strong> {detail.koiFish.origin}</p>
              <p><strong>Gender:</strong> {detail.koiFish.gender}</p>
              <p><strong>Date of Birth:</strong> {new Date(detail.koiFish.dob).toLocaleDateString()}</p>
              <p><strong>Length:</strong> {detail.koiFish.length} cm</p>
              <p><strong>Weight:</strong> {detail.koiFish.weight} g</p>
              <p><strong>Personality:</strong> {detail.koiFish.personalityTraits}</p>
              <p><strong>Status:</strong> {detail.status}</p>
              <p><strong>Price:</strong> {detail.price} VND</p>

              {assignedStaff && (
                <p><strong>Assigned Staff:</strong> {assignedStaff.email}</p>
              )}

{
                  // status is pending
                  detail.status === 'PENDING' && (
                    <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Assign Staff</label>
                <select
                  value={selectedStaff[detail.id] || ""}
                  onChange={(e) =>
                    setSelectedStaff({ ...selectedStaff, [detail.id]: parseInt(e.target.value) })
                  }
                  className="p-2 border border-gray-300 rounded"
                >
                  <option value="">Select Staff</option>
                  {staffUsers.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.email}
                    </option>
                  ))}
                </select>
                <button
                      onClick={() => assignStaffToOrderDetail(detail.id)}
                      className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Assign
                    </button>
                
              </div>
                  )
                }

              
            </li>
          );
        })}
      </ul>
    </div>
  );
}
