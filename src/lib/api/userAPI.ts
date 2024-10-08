import axiosClient from "./axiosClient";

interface ApiResponse<T> {
    data: T;
    message: string;
    isSuccess: boolean;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  dob: string;
  phoneNumber: string;
  imageUrl: string | null;
  address: string;
  roleName: 'ADMIN' | 'STAFF' | 'MANAGER' | 'CUSTOMER'; // Predefined roles
}

const userApi = {
  getAll: async (): Promise<ApiResponse<User[]>> => {
    const response = await axiosClient.get<ApiResponse<User[]>>('v1/Users');
    return response.data;
  },
  getById: async (id: number): Promise<ApiResponse<User>> => {
    const response = await axiosClient.get<ApiResponse<User>>(`v1/Users/${id}`);
    return response.data;
  },
  create: async (data: Omit<User, 'id'>): Promise<ApiResponse<User>> => {
    const response = await axiosClient.post<ApiResponse<User>>('v1/Users', data);
    return response.data;
  },
  update: async (id: number, data: Omit<User, 'id'>): Promise<ApiResponse<User>> => {
    const response = await axiosClient.put<ApiResponse<User>>(`v1/Users/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await axiosClient.delete<ApiResponse<null>>(`v1/Users/${id}`);
    return response.data;
  },
};

export default userApi;
