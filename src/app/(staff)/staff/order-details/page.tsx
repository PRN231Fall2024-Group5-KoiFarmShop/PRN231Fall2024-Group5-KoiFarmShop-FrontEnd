"use client";
import { Toast, ToastProvider } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';
import axiosClient from '@/lib/api/axiosClient';
import { useEffect, useState } from 'react';

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

type Task = {
  id: number;
  orderId: number;
  koiFishId: number;
  price: number;
  status: string;
  staffId: number;
  koiFish: KoiFish;
};

enum OrderDetailStatusEnum {
  PENDING = "PENDING",
  GETTINGFISH = "GETTINGFISH",
  ISSHIPPING = "ISSHIPPING",
  ISNUTURING = "ISNUTURING",
  COMPLETED = "COMPLETED",
  CANCELED = "CANCELED",
}

export default function OrderDetailsTask() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const toast = useToast();

  const fetchTask = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
      const { data } = await axiosClient.get(`/staffs/${userId}/order-details`);
      if (data.isSuccess) {
        setTasks(data.data);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchTask();
  }, []);

  const handleAction = async (orderDetailsId: number, action: string) => {
    const urlMap: { [key: string]: string } = {
      assign: `/order-details/${orderDetailsId}/assign`,
      approve: `/order-details/${orderDetailsId}/approve`,
      complete: `/order-details/${orderDetailsId}/complete`,
      reject: `/order-details/${orderDetailsId}/reject`,
      endSoon: `/order-details/${orderDetailsId}/ship`,
    };

    try {
      await axiosClient.put(urlMap[action]);
      fetchTask(); // Refresh tasks to reflect updated status
    } catch (error:any) {
      toast.toast({ title: error.message});
      console.error(`Error updating task ${orderDetailsId} for ${action}:`, error);
    }
  };

  const renderButtons = (task: Task) => {
    switch (task.status) {
      case OrderDetailStatusEnum.PENDING:
        return (
          <button
            onClick={() => handleAction(task.id, 'assign')}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Assign
          </button>
        );
      case OrderDetailStatusEnum.GETTINGFISH:
        return (
          <>
            <button
              onClick={() => handleAction(task.id, 'approve')}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Approve
            </button>
            <button
              onClick={() => handleAction(task.id, 'reject')}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Reject
            </button>
          </>
        );
      case OrderDetailStatusEnum.ISSHIPPING:
        return (
          <button
            onClick={() => handleAction(task.id, 'complete')}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Complete
          </button>
        );
      case OrderDetailStatusEnum.ISNUTURING:
        return (
          <button
            onClick={() => handleAction(task.id, 'endSoon')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            End Soon
          </button>
        );
      case OrderDetailStatusEnum.COMPLETED:
      case OrderDetailStatusEnum.CANCELED:
        return <span className="text-gray-500">No actions available</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Order Details Tasks</h1>
      <ul className="space-y-4">
        {tasks.map((task) => (
          <li key={task.id} className="p-4 bg-white rounded shadow">
            <div className="text-lg font-semibold">Order ID: {task.orderId}</div>
            <div>Koi Fish Name: {task.koiFish.name}</div>
            <div>Origin: {task.koiFish.origin}</div>
            <div>Gender: {task.koiFish.gender}</div>
            <div>Date of Birth: {new Date(task.koiFish.dob).toLocaleDateString()}</div>
            <div>Length: {task.koiFish.length} cm</div>
            <div>Weight: {task.koiFish.weight} g</div>
            <div>Personality Traits: {task.koiFish.personalityTraits}</div>
            <div>Status: {task.status}</div>
            <div>Price: {task.price} VND</div>

            {/* Action Buttons */}
            <div className="mt-4 flex gap-2">
              {renderButtons(task)}
            </div>
          </li>
        ))}
      </ul>
      <ToastProvider>
      <Toast />
      </ToastProvider>
    </div>
  );
}
