import axiosClient from "./axiosClient";

interface ApiResponse<T> {
  data: T;
  message: string;
  isSuccess: boolean;
}

export interface KoiBreed {
  id: number;
  name: string;
  content: string;
  imageUrl: string | null;
  isDeleted: boolean;
}

const koiBreedApi = {
  getAll: async (): Promise<ApiResponse<KoiBreed[]>> => {
    const response =
      await axiosClient.get<ApiResponse<KoiBreed[]>>("/koi-breeds");
    return response.data;
  },
  getById: async (id: number): Promise<ApiResponse<KoiBreed>> => {
    const response = await axiosClient.get<ApiResponse<KoiBreed>>(
      `/koi-breeds/${id}`,
    );
    return response.data;
  },
  create: async (
    data: Omit<KoiBreed, "id" | "isDeleted">,
  ): Promise<ApiResponse<KoiBreed>> => {
    const response = await axiosClient.post<ApiResponse<KoiBreed>>(
      "/koi-breeds",
      data,
    );
    return response.data;
  },
  update: async (
    id: number,
    data: Omit<KoiBreed, "id" | "isDeleted">,
  ): Promise<ApiResponse<KoiBreed>> => {
    const response = await axiosClient.put<ApiResponse<KoiBreed>>(
      `/koi-breeds/${id}`,
      data,
    );
    return response.data;
  },
  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await axiosClient.delete<ApiResponse<null>>(
      `/koi-breeds/${id}`,
    );
    return response.data;
  },
  getList: async (searchTerm?: string): Promise<ApiResponse<KoiBreed[]>> => {
    const params = searchTerm ? { SearchTerm: searchTerm } : {};
    const response = await axiosClient.get<ApiResponse<KoiBreed[]>>(
      "/koi-breeds",
      { params },
    );
    return response.data;
  },
};

export default koiBreedApi;
