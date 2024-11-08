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
  ownerId: number | null;
};

type Consignment = {
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
};

type Task = {
  id: number;
  orderId: number;
  koiFishId: number;
  price: number;
  status: string;
  staffId: number;
  koiFish: KoiFish;
  consignmentForNurture?: Consignment;
};

enum OrderDetailStatusEnum {
  PENDING = "PENDING",
  GETTINGFISH = "GETTINGFISH",
  ISSHIPPING = "ISSHIPPING",
  ISNUTURING = "ISNUTURING",
  COMPLETED = "COMPLETED",
  CANCELED = "CANCELED",
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  GETTINGFISH: "bg-blue-100 text-blue-800",
  ISSHIPPING: "bg-purple-100 text-purple-800",
  ISNUTURING: "bg-green-100 text-green-800",
  COMPLETED: "bg-gray-100 text-gray-800",
  CANCELED: "bg-red-100 text-red-800",
};

export default function OrderDetailsTask() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { toast } = useToast();

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
    } catch (error: any) {
      toast({ title: error.message });
      console.error(`Error updating task ${orderDetailsId} for ${action}:`, error);
    }
  };

  const renderButtons = (task: Task) => {
    switch (task.status) {
      case OrderDetailStatusEnum.PENDING:
        return (
          <button
            onClick={() => handleAction(task.id, 'assign')}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Assign
          </button>
        );
      case OrderDetailStatusEnum.GETTINGFISH:
        return (
          <>
            <button
              onClick={() => handleAction(task.id, 'approve')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Complete
          </button>
        );
      case OrderDetailStatusEnum.ISNUTURING:
        return (
          <button
            onClick={() => handleAction(task.id, 'endSoon')}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
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
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Order Details Tasks</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center">
              <div className="text-lg font-semibold text-gray-800">Order ID: {task.orderId}</div>
              <span className={`px-2 py-1 rounded text-sm font-medium ${statusColors[task.status]}`}>
                {task.status}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-gray-700"><strong>Koi Fish:</strong> {task.koiFish.name}</p>
              <p className="text-gray-700"><strong>Origin:</strong> {task.koiFish.origin}</p>
              <p className="text-gray-700"><strong>Gender:</strong> {task.koiFish.gender}</p>
              <p className="text-gray-700"><strong>Date of Birth:</strong> {new Date(task.koiFish.dob).toLocaleDateString()}</p>
              <p className="text-gray-700"><strong>Length:</strong> {task.koiFish.length} cm</p>
              <p className="text-gray-700"><strong>Weight:</strong> {task.koiFish.weight} g</p>
              <p className="text-gray-700"><strong>Personality:</strong> {task.koiFish.personalityTraits}</p>
              <p className="text-gray-700"><strong>Price:</strong> {task.price.toLocaleString()} VND</p>
            </div>
            
            {/* Consignment Details */}
            {task.consignmentForNurture && (
              <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                <h2 className="text-md font-semibold text-gray-600">Consignment Details</h2>
                <p className="text-gray-700"><strong>Start Date:</strong> {new Date(task.consignmentForNurture.startDate).toLocaleDateString()}</p>
                <p className="text-gray-700"><strong>End Date:</strong> {new Date(task.consignmentForNurture.endDate).toLocaleDateString()}</p>
                <p className="text-gray-700"><strong>Diet Cost:</strong> {task.consignmentForNurture.dietCost.toLocaleString()} VND</p>
                <p className="text-gray-700"><strong>Projected Cost:</strong> {task.consignmentForNurture.projectedCost?.toLocaleString()} VND</p>
                <p className="text-gray-700"><strong>Actual Cost:</strong> {task.consignmentForNurture.actualCost?.toLocaleString()} VND</p>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="mt-4 flex gap-2">
              {renderButtons(task)}
            </div>
          </div>
        ))}
      </div>
      <ToastProvider>
        <Toast />
      </ToastProvider>
    </div>
  );
}
