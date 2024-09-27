import axiosClient from './axiosClient';

interface ApiResponse<T> {
  data: T;
  message: string;
  isSuccess: boolean;
  metadata?: any
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
  koiBreeds: { id: number; name: string }[];
  koiFishImages: string[];
  price: number;
  isAvailableForSale: boolean;
  isConsigned: boolean;
  isSold: boolean;
  koiBreedIds?: number[];
  imageUrl?: string[];
}

const koiFishApi = {
  getAll: async ({page}:any): Promise<ApiResponse<KoiFish[]>> => {
    const response = await axiosClient.get<ApiResponse<KoiFish[]>>('/KoiFish'+`?PageNumber=${page ? page : 1}`);
    return response.data;
  },
  getById: async (id: number): Promise<ApiResponse<KoiFish>> => {
    const response = await axiosClient.get<ApiResponse<KoiFish>>(`/KoiFish/${id}`);
    return response.data;
  },
  create: async (data: Omit<KoiFish, 'id'>): Promise<ApiResponse<KoiFish>> => {
    const response = await axiosClient.post<ApiResponse<KoiFish>>('/KoiFish', data);
    return response.data;
  },
  update: async (id: number, data: Omit<KoiFish, 'id'>): Promise<ApiResponse<KoiFish>> => {
    const response = await axiosClient.put<ApiResponse<KoiFish>>(`/KoiFish/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await axiosClient.delete<ApiResponse<null>>(`/KoiFish/${id}`);
    return response.data;
  },
};

export default koiFishApi;
