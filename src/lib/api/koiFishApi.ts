import axios from "axios";
import axiosClient from "./axiosClient";

interface ApiResponse<T> {
  data: T;
  message: string;
  isSuccess: boolean;
  metadata?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
  };
}

export interface KoiFish {
  id: number;
  name: string;
  origin: string;
  gender: string;
  dob?: string;
  age: number;
  length: number;
  weight: number;
  personalityTraits: string;
  dailyFeedAmount: number;
  lastHealthCheck: string;
  isAvailableForSale: boolean | null;
  price: number;
  isConsigned: boolean | null;
  isSold: boolean | null;
  consignedBy: string | null;
  koiCertificates: any[]; // You may want to create a specific interface for this
  koiBreeds: KoiBreed[];
  koiFishImages: KoiFishImage[];
  koiDiaries: any[]; // You may want to create a specific interface for this
}

export interface KoiBreed {
  id: number;
  name: string;
  content: string;
  imageUrl: string | null;
  isDeleted: boolean;
}

export interface KoiFishImage {
  id: number;
  koiFishId: number;
  name: string | null;
  imageUrl: string;
}

export interface KoiFishQueryParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  koiBreedId?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
}

const koiFishApi = {
  getAll: async (
    params: KoiFishQueryParams,
  ): Promise<ApiResponse<KoiFish[]>> => {
    const response = await axiosClient.get<ApiResponse<KoiFish[]>>(
      "/koi-fishes",
      {
        params,
      },
    );
    return response.data;
  },
  getById: async (id: number): Promise<ApiResponse<KoiFish>> => {
    const response = await axiosClient.get<ApiResponse<KoiFish>>(
      `/koi-fishes/${id}`,
    );
    return response.data;
  },
  create: async (data: Omit<KoiFish, "id">): Promise<ApiResponse<KoiFish>> => {
    const response = await axiosClient.post<ApiResponse<KoiFish>>(
      "/koi-fishes",
      data,
    );
    return response.data;
  },
  update: async (
    id: number,
    data: Partial<KoiFish>,
  ): Promise<ApiResponse<KoiFish>> => {
    const response = await axiosClient.put<ApiResponse<KoiFish>>(
      `/koi-fishes/${id}`,
      data,
    );
    return response.data;
  },
  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await axiosClient.delete<ApiResponse<null>>(
      `/koi-fishes/${id}`,
    );
    return response.data;
  },

  // Updated to use axiosClient for fetching certificates
  getCertificates: async (fishId: number): Promise<ApiResponse<any[]>> => {
    try {
      const response = await axiosClient.get<ApiResponse<any[]>>(
        `/KoiCertificate/getList/${fishId}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching certificates:", error);
      return {
        isSuccess: false,
        data: [],
        message: "Failed to fetch certificates",
      };
    }
  },

  // Updated to use axiosClient for adding certificates
  addCertificate: async (certificateData: {
    koiFishId: number;
    certificateType: string;
    certificateUrl: string;
  }): Promise<ApiResponse<any>> => {
    try {
      const response = await axiosClient.post<ApiResponse<any>>(
        "/KoiCertificate",
        certificateData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error adding certificate:", error);
      return {
        isSuccess: false,
        message: "Failed to add certificate",
        data: [],
      };
    }
  },

  // Add this new function to your koiFishApi object
  getMultipleKoiDetails: async (
    ids: number[],
  ): Promise<ApiResponse<KoiFish[]>> => {
    if (ids.length === 0) {
      return { isSuccess: false, data: [], message: "No IDs provided" };
    }
    if (ids.length > 100) {
      // Adjust this limit based on API constraints
      return { isSuccess: false, data: [], message: "Too many IDs requested" };
    }
    const idsString = ids.join(",");
    const query = `/odata/koi-fishes?$filter=id in (${idsString})`;
    try {
      const response = await axiosClient.get<{ value: KoiFish[] }>(query);
      return { isSuccess: true, data: response.data.value, message: "Success" };
    } catch (error) {
      console.error("Error fetching multiple koi details:", error);
      return {
        isSuccess: false,
        data: [],
        message: "Failed to fetch koi details",
      };
    }
  },
};

export default koiFishApi;
