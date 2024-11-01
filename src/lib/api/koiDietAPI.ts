import axiosClient from "./axiosClient";

interface ApiResponse<T> {
  data: T;
  message: string;
  isSuccess: boolean;
}

export interface KoiDiet {
  id: number;
  name: string;
  dietCost: number;
  description: string;
  createdAt?: string;
  createdBy?: string;
  modifiedAt?: string;
  modifiedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  isDeleted?: boolean;
}

export interface KoiDietRestResponse {
  name: string;
  dietCost: number;
  description: string;
}

interface ApiKoiDiet {
  Id: number;
  Name: string;
  DietCost: number;
  Description: string;
  CreatedAt?: string;
  CreatedBy?: string;
  ModifiedAt?: string;
  ModifiedBy?: string;
  DeletedAt?: string;
  DeletedBy?: string;
  IsDeleted?: boolean;
}

const mapApiDietToKoiDiet = (apiDiet: ApiKoiDiet): KoiDiet => ({
  id: apiDiet.Id,
  name: apiDiet.Name,
  dietCost: apiDiet.DietCost,
  description: apiDiet.Description,
  createdAt: apiDiet.CreatedAt,
  createdBy: apiDiet.CreatedBy,
  modifiedAt: apiDiet.ModifiedAt,
  modifiedBy: apiDiet.ModifiedBy,
  deletedAt: apiDiet.DeletedAt,
  deletedBy: apiDiet.DeletedBy,
  isDeleted: apiDiet.IsDeleted,
});

const koiDietApi = {
  getDietList: async (): Promise<ApiResponse<KoiDiet[]>> => {
    const response = await axiosClient.get<{ value: ApiKoiDiet[] }>(
      "/odata/diets",
    );
    return {
      data: response.data.value.map(mapApiDietToKoiDiet),
      message: "Diet list retrieved successfully",
      isSuccess: true,
    };
  },

  getDietById: async (id: number): Promise<ApiResponse<KoiDiet>> => {
    const response = await axiosClient.get<ApiKoiDiet>(`/odata/diets(${id})`);
    return {
      data: mapApiDietToKoiDiet(response.data),
      message: "Diet details retrieved successfully",
      isSuccess: true,
    };
  },

  createDiet: async (diet: {
    name: string;
    dietCost: number;
    description: string;
  }): Promise<ApiResponse<KoiDietRestResponse>> => {
    try {
      const response = await axiosClient.post<ApiResponse<KoiDietRestResponse>>(
        "/diets",
        {
          name: diet.name,
          dietCost: diet.dietCost,
          description: diet.description,
        },
      );

      return response.data;
    } catch (error) {
      console.error("Error creating certificate:", error);
      return {
        isSuccess: false,
        data: {} as KoiDietRestResponse,
        message: "Failed to create diet",
      };
    }
  },

  updateDiet: async (
    id: number,
    diet: {
      name: string;
      dietCost: number;
      description: string;
    },
  ): Promise<ApiResponse<KoiDietRestResponse>> => {
    try {
      const response = await axiosClient.put<ApiResponse<KoiDietRestResponse>>(
        `/diets/${id}`,
        {
          name: diet.name,
          dietCost: diet.dietCost,
          description: diet.description,
        },
      );

      return response.data;
    } catch (error) {
      console.error("Error creating certificate:", error);
      return {
        isSuccess: false,
        data: {} as KoiDietRestResponse,
        message: "Failed to create diet",
      };
    }
  },

  deleteDiet: async (id: number): Promise<ApiResponse<void>> => {
    const response = await axiosClient.delete<ApiResponse<void>>(
      `/diets/${id}`,
    );
    return {
      data: undefined,
      message: response.data.message,
      isSuccess: response.data.isSuccess,
    };
  },
};

export default koiDietApi;
