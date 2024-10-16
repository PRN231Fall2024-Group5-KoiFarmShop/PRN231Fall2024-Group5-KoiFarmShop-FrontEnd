import axios from "axios";

const axiosClient = axios.create({
  baseURL: 'https://koi.eventzone.id.vn/odata',
  headers: {
    'Content-Type': 'application/json',
  },
});

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
    const response = await axiosClient.get<ApiResponse<KoiFish[]>>("/KoiFish", {
      params,
    });
    return response.data;
  },
  getById: async (id: number): Promise<ApiResponse<KoiFish>> => {
    const response = await axiosClient.get<ApiResponse<KoiFish>>(
      `/KoiFish/${id}`,
    );
    return response.data;
  },
  create: async (data: Omit<KoiFish, "id">): Promise<ApiResponse<KoiFish>> => {
    const response = await axiosClient.post<ApiResponse<KoiFish>>(
      "/KoiFish",
      data,
    );
    return response.data;
  },
  update: async (
    id: number,
    data: Partial<KoiFish>,
  ): Promise<ApiResponse<KoiFish>> => {
    const response = await axiosClient.put<ApiResponse<KoiFish>>(
      `/KoiFish/${id}`,
      data,
    );
    return response.data;
  },
  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await axiosClient.delete<ApiResponse<null>>(
      `/KoiFish/${id}`,
    );
    return response.data;
  },
};

export default koiFishApi;
