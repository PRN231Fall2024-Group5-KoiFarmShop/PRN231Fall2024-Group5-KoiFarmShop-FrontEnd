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
};

export default consignmentAPI;
