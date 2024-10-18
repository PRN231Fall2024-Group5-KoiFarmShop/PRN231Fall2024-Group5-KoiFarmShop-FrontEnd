import axiosClient from "./axiosClient"; // Assuming you have this set up already
interface ApiResponse<T> {
  data: T;
  message: string;
  isSuccess: boolean;
}

interface LoginResponse {
  status: boolean;
  message: string;
  jwt: string;
  expired: string;
  jwtRefreshToken: string;
  userId: number;
}

interface RegisterResponse {
  id: number;
  email: string;
  fullName: string;
  unsignFullName: string;
  dob: string;
  phoneNumber: string;
  roleName: string;
  imageUrl: string;
  address: string;
  isActive: boolean;
  loyaltyPoints: number;
  isDeleted: boolean;
}

const authAPI = {
  login: async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<ApiResponse<LoginResponse>> => {
    const response = await axiosClient.post<ApiResponse<LoginResponse>>(
      "/users/login",
      {
        email,
        password,
      },
    );
    return response.data;
  },

  getCurrentUser: async (): Promise<ApiResponse<RegisterResponse>> => {
    try {
      const response =
        await axiosClient.get<ApiResponse<RegisterResponse>>("/users/me");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  register: async ({
    email,
    password,
    fullName,
    dob,
    phoneNumber,
    imageUrl,
    address,
    roleName,
  }: {
    email: string;
    password: string;
    fullName: string;
    dob: string;
    phoneNumber: string;
    imageUrl: string;
    address: string;
    roleName: string;
  }): Promise<ApiResponse<RegisterResponse>> => {
    const response = await axiosClient.post<ApiResponse<RegisterResponse>>(
      "/users/register",
      {
        email,
        password,
        fullName,
        dob,
        phoneNumber,
        imageUrl,
        address,
        roleName,
      },
    );
    return response.data;
  },
};

export default authAPI;
