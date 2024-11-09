import axiosClient from "./axiosClient";

interface ApiResponse<T> {
  data: T;
  message: string;
  isSuccess: boolean;
}

// API response interface
export interface FAQResponse {
  id: number;
  question: string;
  answer: string;
  createdAt: string;
  createdBy: number;
  modifiedAt: string | null;
  modifiedBy: number | null;
  deletedAt: string | null;
  deletedBy: number | null;
  isDeleted: boolean;
}

export interface FAQCreate {
  question: string;
  answer: string;
}

export interface FAQUpdate {
  question: string;
  answer: string;
}

const faqAPI = {
  // Get all FAQs
  getAll: async (): Promise<ApiResponse<FAQResponse[]>> => {
    try {
      const response = await axiosClient.get<FAQResponse[]>("/faqs");

      return {
        isSuccess: true,
        data: response.data,
        message: "Success",
      };
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      return {
        isSuccess: false,
        data: [],
        message: "Failed to fetch FAQs",
      };
    }
  },

  // Create new FAQ
  create: async (data: FAQCreate): Promise<ApiResponse<FAQResponse>> => {
    try {
      const response = await axiosClient.post<ApiResponse<FAQResponse>>(
        "/faqs",
        data,
      );
      return response.data;
    } catch (error) {
      console.error("Error creating FAQ:", error);
      return {
        isSuccess: false,
        data: {} as FAQResponse,
        message: "Failed to create FAQ",
      };
    }
  },

  // Update FAQ
  update: async (
    id: number,
    data: FAQUpdate,
  ): Promise<ApiResponse<FAQResponse>> => {
    try {
      const response = await axiosClient.put<ApiResponse<FAQResponse>>(
        `/faqs/${id}`,
        data,
      );
      return response.data;
    } catch (error) {
      console.error("Error updating FAQ:", error);
      return {
        isSuccess: false,
        data: {} as FAQResponse,
        message: "Failed to update FAQ",
      };
    }
  },

  // Delete FAQ
  delete: async (id: number): Promise<ApiResponse<null>> => {
    try {
      const response = await axiosClient.delete<ApiResponse<null>>(
        `/faqs/${id}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      return {
        isSuccess: false,
        data: null,
        message: "Failed to delete FAQ",
      };
    }
  },
};

export default faqAPI;
