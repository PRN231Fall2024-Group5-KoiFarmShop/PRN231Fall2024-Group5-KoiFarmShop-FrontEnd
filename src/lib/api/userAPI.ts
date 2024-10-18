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
  roleName: "ADMIN" | "STAFF" | "MANAGER" | "CUSTOMER"; // Predefined roles
  isDeleted?: boolean;
}

export interface UserUpdateProfile {
  fullName: string;
  dob: string;
  phoneNumber: string;
  imageUrl: string | null;
  address: string;
}

const userApi = {
  getAll: async (): Promise<ApiResponse<User[]>> => {
    const response = await axiosClient.get<ApiResponse<User[]>>("/Users");
    return response.data;
  },
  getById: async (id: number): Promise<ApiResponse<User>> => {
    const response = await axiosClient.get<ApiResponse<User>>(`/Users/${id}`);
    return response.data;
  },
  create: async (data: Omit<User, "id">): Promise<ApiResponse<User>> => {
    const response = await axiosClient.post<ApiResponse<User>>("/Users", data);
    return response.data;
  },
  update: async (
    id: number,
    data: Omit<User, "id">,
  ): Promise<ApiResponse<User>> => {
    const response = await axiosClient.put<ApiResponse<User>>(
      `/Users/${id}`,
      data,
    );
    return response.data;
  },
  updateProfile: async (
    id: number,
    data: Omit<UserUpdateProfile, "id">,
  ): Promise<ApiResponse<object>> => {
    const response = await axiosClient.put<ApiResponse<UserUpdateProfile>>(
      `/users/customers/` + id,
      data,
    );
    return response.data;
  },
  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await axiosClient.delete<ApiResponse<null>>(
      `/Users/${id}`,
    );
    return response.data;
  },
};

export default userApi;
