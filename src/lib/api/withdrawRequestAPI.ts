import axiosClient from "./axiosClient";

// Define the necessary interfaces
export interface WithdrawnRequest {
    id: number;
    userId: number;
    bankNote: string;
    amount: number;
    status: string;
    requestDate: string;
    user?: any;
    createdAt: string;
    imageUrl: string;
}

interface ApiResponse<T> {
  isSuccess: boolean;
  data: T | null;
  message: string;
}

const withdrawnRequestAPI = {
  // Get all withdrawn requests
  getAllWithdrawnRequests: async (): Promise<ApiResponse<WithdrawnRequest[]>> => {
    try {
      const response = await axiosClient.get<ApiResponse<WithdrawnRequest[]>>(
        "WithdrawnRequest"
      );
      return response.data;
    } catch (error:any) {
      console.error("Error fetching withdrawn requests:", error);
      return {
        isSuccess: false,
        data: null,
        message: error.response.data.message || "Failed to fetch withdrawn requests. Please try again.",
      };
    }
  },

  // Get withdrawn requests by user ID
  getWithdrawnRequestsByUserId: async (): Promise<ApiResponse<WithdrawnRequest[]>> => {
    try {
      const response = await axiosClient.get<ApiResponse<WithdrawnRequest[]>>(
        `WithdrawnRequest/GetListByUserId`
      );
      return response.data;
    } catch (error:any) {
      console.error("Error fetching user's withdrawn requests:", error);
      return {
        isSuccess: false,
        data: null,
        message: error.response.data.message || "Failed to fetch withdrawn requests for the user. Please try again.",
      };
    }
  },

  // Create a new withdrawn request
  createWithdrawnRequest: async (
    bankNote: string,
    amount: string
  ): Promise<ApiResponse<WithdrawnRequest>> => {
    try {
      const response = await axiosClient.post<ApiResponse<WithdrawnRequest>>(
        "WithdrawnRequest/CreateRequest",
        { bankNote, amount: amount }
      );
      return response.data;
    } catch (error:any) {
      console.error("Error creating withdrawn request:", error);
      return {
        isSuccess: false,
        data: null,
        message: error.response.data.message || "Failed to create withdrawn request. Please try again.",
      };
    }
  },

  // Approve a withdrawn request by ID
  approveWithdrawnRequest: async (
    id: number,
    approvalNote: string
  ): Promise<ApiResponse<WithdrawnRequest>> => {
    try {
      const response = await axiosClient.post<ApiResponse<WithdrawnRequest>>(
        `WithdrawnRequest/ApproveRequest/${id}`,
        approvalNote
      );
      return response.data;
    } catch (error) {
      console.error("Error approving withdrawn request:", error);
      return {
        isSuccess: false,
        data: null,
        message: "Failed to approve withdrawn request. Please try again.",
      };
    }
  },

  // Reject a withdrawn request by ID
  rejectWithdrawnRequest: async (
    id: number,
    rejectionNote: string
  ): Promise<ApiResponse<WithdrawnRequest>> => {
    try {
      const response = await axiosClient.post<ApiResponse<WithdrawnRequest>>(
        `WithdrawnRequest/RejectRequest/${id}`,
        { rejectionNote }
      );
      return response.data;
    } catch (error) {
      console.error("Error rejecting withdrawn request:", error);
      return {
        isSuccess: false,
        data: null,
        message: "Failed to reject withdrawn request. Please try again.",
      };
    }
  },
};

export default withdrawnRequestAPI;
