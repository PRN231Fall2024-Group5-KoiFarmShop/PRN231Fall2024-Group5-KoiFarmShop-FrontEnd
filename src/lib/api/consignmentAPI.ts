import axiosClient from "./axiosClient";

interface Consignment {
  id: number;
  customerId: number | null;
  koiFishId: number;
  dietId: number;
  staffId: number | null;
  consignmentDate: string;
  startDate: string;
  endDate: string;
  note: string | null;
  dietCost: number;
  laborCost: number | null;
  dailyFeedAmount: number;
  totalDays: number;
  projectedCost: number;
  actualCost: number | null;
  inspectionRequired: boolean | null;
  inspectionDate: string | null;
  consignmentStatus: string;
}

interface ApiResponse<T> {
  isSuccess: boolean;
  data: T | null;
  message: string;
}

interface CreateConsignmentData {
  koiFishId: number;
  dietId: number;
  startDate: string;
  endDate: string;
  note?: string;
}

// Add new enum for consignment statuses
export enum ConsignmentStatus {
  CANCELED = "CANCELED",
  REJECTED = "REJECTED",
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
}

const consignmentAPI = {
  getConsignmentDetails: async (
    consignmentId: number,
  ): Promise<ApiResponse<Consignment>> => {
    try {
      const response = await axiosClient.get<ApiResponse<Consignment>>(
        `/nurture-consignments/${consignmentId}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching consignment details:", error);
      return {
        isSuccess: false,
        data: null,
        message: "Failed to fetch consignment details. Please try again.",
      };
    }
  },

  createConsignment: async (
    data: CreateConsignmentData,
  ): Promise<ApiResponse<Consignment>> => {
    try {
      const response = await axiosClient.post<ApiResponse<Consignment>>(
        "/nurture-consignments",
        data,
      );
      return response.data;
    } catch (error) {
      console.error("Error creating consignment:", error);
      return {
        isSuccess: false,
        data: null,
        message: "Failed to create consignment. Please try again.",
      };
    }
  },

  updateConsignmentStatus: async (
    consignmentId: number,
    newStatus: ConsignmentStatus,
  ): Promise<ApiResponse<void>> => {
    try {
      const response = await axiosClient.put<ApiResponse<void>>(
        `/nurture-consignments/${consignmentId}/status`,
        null,
        {
          params: {
            newStatus: newStatus,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error updating consignment status:", error);
      return {
        isSuccess: false,
        data: null,
        message: "Failed to update consignment status. Please try again.",
      };
    }
  },

  cancelConsignment: async (
    consignmentId: number,
  ): Promise<ApiResponse<void>> => {
    return consignmentAPI.updateConsignmentStatus(
      consignmentId,
      ConsignmentStatus.CANCELED,
    );
  },
};

export default consignmentAPI;
