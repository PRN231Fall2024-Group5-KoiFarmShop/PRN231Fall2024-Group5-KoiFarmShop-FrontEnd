import axios from "axios";
import axiosClient from "./axiosClient";
import { KoiFishCertificate } from "./koiCertAPI";

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

export interface KoiFishCreate {
  name: string;
  origin: string;
  gender: string;
  dob: string;
  // age?: number;
  length: number;
  weight: number;
  isAvailableForSale: boolean;
  price: number;
  isSold: boolean;
  personalityTraits: string;
  dailyFeedAmount: number;
  lastHealthCheck: string;
  koiBreedIds: number[];
  imageUrls: string[];
  ownerId: number | null;
  certificates?: KoiFishCertificate[];
}

export interface KoiFishUpdate {
  name: string;
  origin: string;
  gender: boolean;
  dob: string;
  length: number;
  weight: number;
  isAvailableForSale: boolean;
  price: number;
  isSold: boolean;
  isDeleted: boolean;
  personalityTraits: string;
  dailyFeedAmount: number;
  lastHealthCheck: string;
  koiBreedIds: number[];
  imageUrls: string[];
}

export interface KoiFish {
  id: number;
  name: string;
  origin: string;
  gender: string;
  dob?: string;
  // age: number;
  ownerId: number | null;
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
  koiCertificates: KoiFishCertificate[];
  koiBreeds: KoiBreed[];
  koiFishImages: KoiFishImage[];
  koiDiaries: any[]; // You may want to create a specific interface for this
  createdAt?: string;
  createdBy?: number;
  modifiedAt?: string;
  modifiedBy?: number;
  deletedAt?: string | null;
  deletedBy?: number | null;
  isDeleted?: boolean;
  consignments?: {
    id: number;
    startDate: string;
    endDate: string;
    consignmentStatus: string;
    dietId: number;
    dietCost: number;
    totalDays: number;
    projectedCost: number;
    actualCost: number | null;
    note: string | null;
  }[];
  owner?: {
    fullName: string;
    avatarUrl: string;
  } | null;
}

export interface KoiFishOdata {
  Id: number;
  Name: string;
  Origin: string;
  Gender: boolean;
  Dob: string;
  Length: number;
  Weight: number;
  PersonalityTraits: string;
  DailyFeedAmount: number;
  LastHealthCheck: string;
  IsAvailableForSale: boolean;
  Price: number;
  IsConsigned: boolean;
  IsSold: boolean;
  OwnerId: number | null;
  CreatedAt: string;
  CreatedBy: number;
  ModifiedAt: string;
  ModifiedBy: number;
  DeletedAt: string | null;
  DeletedBy: number | null;
  IsDeleted: boolean;
  KoiBreeds: {
    Id: number;
    Name: string;
    Content: string;
    ImageUrl: string | null;
    CreatedAt: string;
    CreatedBy: number;
    ModifiedAt: string;
    ModifiedBy: number;
    DeletedAt: string | null;
    DeletedBy: number | null;
    IsDeleted: boolean;
  }[];
  ConsignmentForNurtures: {
    Id: number;
    CustomerId: number;
    KoiFishId: number;
    DietId: number;
    StaffId: number | null;
    ConsignmentDate: string;
    StartDate: string;
    EndDate: string;
    Note: string | null;
    DietCost: number;
    LaborCost: number | null;
    DailyFeedAmount: number | null;
    TotalDays: number;
    ProjectedCost: number;
    ActualCost: number | null;
    InspectionRequired: boolean | null;
    InspectionDate: string | null;
    ConsignmentStatus: string;
    CreatedAt: string;
    CreatedBy: number;
    ModifiedAt: string | null;
    ModifiedBy: number | null;
    DeletedAt: string | null;
    DeletedBy: number | null;
    IsDeleted: boolean;
  }[];
  KoiFishImages: {
    Id: number;
    KoiFishId: number;
    Name: string | null;
    ImageUrl: string;
  }[];
  KoiCertificates: {
    Id: number;
    KoiFishId: number;
    CertificateType: string;
    CertificateUrl: string;
  }[];
  Owner: {
    FullName: string;
    AvatarUrl: string;
  } | null;
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
  isAvailableForSale?: boolean;
}

// Add this interface to define the structure of the OData response
interface ODataResponse<T> {
  value: T[];
  "@odata.count"?: number;
}

// Add this interface for manager query params
export interface KoiFishManagerQueryParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  koiBreedId?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  isAvailableForSale?: boolean;
  isSold?: boolean;
  isConsigned?: boolean;
  showFarmOwned?: boolean;
}

const mapOdataToKoiFish = (odataKoi: KoiFishOdata): KoiFish => ({
  id: odataKoi.Id,
  name: odataKoi.Name,
  origin: odataKoi.Origin,
  gender: odataKoi.Gender ? "Male" : "Female",
  dob: odataKoi.Dob,
  // age: new Date().getFullYear() - new Date(odataKoi.Dob).getFullYear(),
  ownerId: odataKoi.OwnerId,
  length: odataKoi.Length,
  weight: odataKoi.Weight,
  personalityTraits: odataKoi.PersonalityTraits,
  dailyFeedAmount: odataKoi.DailyFeedAmount,
  lastHealthCheck: odataKoi.LastHealthCheck,
  isAvailableForSale: odataKoi.IsAvailableForSale,
  price: odataKoi.Price,
  isConsigned: odataKoi.IsConsigned,
  isSold: odataKoi.IsSold,
  consignedBy: odataKoi.OwnerId ? "Owner" : null,
  koiCertificates: odataKoi.KoiCertificates?.map((cert) => ({
    id: cert.Id,
    koiFishId: cert.KoiFishId,
    certificateType: cert.CertificateType,
    certificateUrl: cert.CertificateUrl,
  })),
  koiBreeds: odataKoi.KoiBreeds?.map((breed) => ({
    id: breed.Id,
    name: breed.Name,
    content: breed.Content,
    imageUrl: breed.ImageUrl,
    isDeleted: breed.IsDeleted,
  })),
  koiFishImages: odataKoi.KoiFishImages?.map((image) => ({
    id: image.Id,
    koiFishId: image.KoiFishId,
    name: image.Name,
    imageUrl: image.ImageUrl,
  })),
  koiDiaries: [],
  createdAt: odataKoi.CreatedAt,
  createdBy: odataKoi.CreatedBy,
  modifiedAt: odataKoi.ModifiedAt,
  modifiedBy: odataKoi.ModifiedBy,
  deletedAt: odataKoi.DeletedAt,
  deletedBy: odataKoi.DeletedBy,
  isDeleted: odataKoi.IsDeleted,
  consignments: odataKoi.ConsignmentForNurtures?.map((consignment) => ({
    id: consignment.Id,
    startDate: consignment.StartDate,
    endDate: consignment.EndDate,
    consignmentStatus: consignment.ConsignmentStatus,
    dietId: consignment.DietId,
    dietCost: consignment.DietCost,
    totalDays: consignment.TotalDays,
    projectedCost: consignment.ProjectedCost,
    actualCost: consignment.ActualCost,
    note: consignment.Note,
  })),
  owner: odataKoi.Owner
    ? {
        fullName: odataKoi.Owner.FullName,
        avatarUrl: odataKoi.Owner.AvatarUrl,
      }
    : null,
});

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
  createByUser: async (data: KoiFishCreate): Promise<ApiResponse<KoiFish>> => {
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
  updateByUser: async (
    id: number,
    data: KoiFishUpdate,
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
    const query = `/odata/koi-fishes?$filter=id in (${idsString})&$expand=KoiBreeds,KoiFishImages`;
    try {
      const response = await axiosClient.get<{ value: KoiFishOdata[] }>(query);

      return {
        isSuccess: true,
        data: response.data.value.map(mapOdataToKoiFish),
        message: "Success",
      };
    } catch (error) {
      console.error("Error fetching multiple koi details:", error);
      return {
        isSuccess: false,
        data: [],
        message: "Failed to fetch koi details",
      };
    }
  },

  // Add this new function to your koiFishApi object
  getAvailableKoi: async (
    params: KoiFishQueryParams = {},
  ): Promise<ApiResponse<KoiFish[]>> => {
    const baseFilter = "IsAvailableForSale eq true and IsConsigned eq false";
    const userFilter = params.searchTerm ? `and (${params.searchTerm})` : "";
    const fullFilter = `${baseFilter} ${userFilter}`;

    let query = `/odata/koi-fishes?$filter=${encodeURIComponent(fullFilter)}`;

    // Add $expand to include KoiBreeds
    query += "&$expand=KoiBreeds,KoiFishImages,Owner";

    // Add other query parameters
    if (params.pageNumber)
      query += `&$skip=${(params.pageNumber - 1) * (params.pageSize || 10)}`;
    if (params.pageSize) query += `&$top=${params.pageSize}`;
    if (params.sortBy)
      query += `&$orderby=${encodeURIComponent(params.sortBy)}`;

    try {
      const response =
        await axiosClient.get<ODataResponse<KoiFishOdata>>(query);
      const totalCount =
        response.data["@odata.count"] || response.data.value.length;
      const mappedData = response.data.value.map(mapOdataToKoiFish);
      return {
        isSuccess: true,
        data: mappedData,
        message: "Success",
        metadata: {
          currentPage: params.pageNumber || 1,
          pageSize: params.pageSize || response.data.value.length,
          totalCount: totalCount,
          totalPages: Math.ceil(totalCount / (params.pageSize || 10)),
        },
      };
    } catch (error) {
      console.error("Error fetching available koi:", error);
      return {
        isSuccess: false,
        data: [],
        message: "Failed to fetch available koi",
      };
    }
  },

  getAvailableKoiByBreed: async (
    params: KoiFishQueryParams = {},
  ): Promise<ApiResponse<KoiFish[]>> => {
    let baseFilter = "IsAvailableForSale eq true and IsConsigned eq false";

    // Add breed filter if koiBreedId is provided
    if (params.koiBreedId) {
      baseFilter += ` and KoiBreeds/any(kb: kb/Id eq ${params.koiBreedId})`;
    }

    // Add search filter if searchTerm is provided
    if (params.searchTerm) {
      baseFilter += ` and contains(Name, '${params.searchTerm}')`;
    }

    let query = `/odata/koi-fishes?$filter=${encodeURIComponent(baseFilter)}`;

    // Add $expand to include KoiBreeds
    query += "&$expand=KoiBreeds,KoiFishImages,Owner";

    // Add other query parameters
    if (params.pageNumber)
      query += `&$skip=${(params.pageNumber - 1) * (params.pageSize || 10)}`;
    if (params.pageSize) query += `&$top=${params.pageSize}`;
    if (params.sortBy)
      query += `&$orderby=${encodeURIComponent(params.sortBy)}`;

    try {
      const response =
        await axiosClient.get<ODataResponse<KoiFishOdata>>(query);
      const totalCount =
        response.data["@odata.count"] || response.data.value.length;
      const mappedData = response.data.value.map(mapOdataToKoiFish);
      return {
        isSuccess: true,
        data: mappedData,
        message: "Success",
        metadata: {
          currentPage: params.pageNumber || 1,
          pageSize: params.pageSize || response.data.value.length,
          totalCount: totalCount,
          totalPages: Math.ceil(totalCount / (params.pageSize || 10)),
        },
      };
    } catch (error) {
      console.error("Error fetching available koi by breed:", error);
      return {
        isSuccess: false,
        data: [],
        message: "Failed to fetch available koi by breed",
      };
    }
  },

  getMyKoiFish: async (
    params: KoiFishQueryParams = {},
  ): Promise<ApiResponse<KoiFish[]>> => {
    let query =
      "/odata/my-koi-fishes?$count=true&$expand=KoiBreeds,ConsignmentForNurtures";

    // Add pagination parameters if provided
    if (params.pageNumber && params.pageSize) {
      query += `&$skip=${(params.pageNumber - 1) * params.pageSize}&$top=${params.pageSize}`;
    }

    // Add sorting if provided
    if (params.sortBy) {
      query += `&$orderby=${encodeURIComponent(params.sortBy)}`;
    }

    // Add search term if provided
    if (params.searchTerm) {
      query += `&$filter=contains(Name, '${encodeURIComponent(params.searchTerm)}')`;
    }

    try {
      const response =
        await axiosClient.get<ODataResponse<KoiFishOdata>>(query);
      const totalCount =
        response.data["@odata.count"] || response.data.value.length;
      const mappedData = response.data.value.map(mapOdataToKoiFish);

      return {
        isSuccess: true,
        data: mappedData,
        message: "Success",
        metadata: {
          currentPage: params.pageNumber || 1,
          pageSize: params.pageSize || response.data.value.length,
          totalCount: totalCount,
          totalPages: Math.ceil(
            totalCount / (params.pageSize || response.data.value.length),
          ),
        },
      };
    } catch (error) {
      console.error("Error fetching my koi fish:", error);
      return {
        isSuccess: false,
        data: [],
        message: "Failed to fetch my koi fish",
      };
    }
  },

  // Add this new function to your koiFishApi object
  getMyKoiFishDetailById: async (
    id: number,
  ): Promise<ApiResponse<KoiFish | null>> => {
    let query = `/odata/my-koi-fishes?$filter=Id eq ${id}&$expand=KoiBreeds,ConsignmentForNurtures,koiFishImages,KoiCertificates`;

    try {
      const response =
        await axiosClient.get<ODataResponse<KoiFishOdata>>(query);

      if (response.data.value.length === 0) {
        return {
          isSuccess: false,
          data: null,
          message: "Koi fish not found",
        };
      }

      const mappedData = mapOdataToKoiFish(response.data.value[0]);

      return {
        isSuccess: true,
        data: mappedData,
        message: "Success",
      };
    } catch (error) {
      console.error("Error fetching my koi fish detail:", error);
      return {
        isSuccess: false,
        data: null,
        message: "Failed to fetch koi fish detail",
      };
    }
  },

  // Add this function to koiFishApi object
  getKoiFishForManager: async (
    params: KoiFishManagerQueryParams = {},
  ): Promise<ApiResponse<KoiFish[]>> => {
    let baseFilter = "1 eq 1"; // Always true condition to start with

    baseFilter += " and IsDeleted eq false";
    // Add ownership filter
    if (params.showFarmOwned) {
      baseFilter += " and OwnerId eq null"; // Farm-owned fish
    } else {
      baseFilter += " and OwnerId ne null"; // User-owned fish
    }

    // Build filter string
    if (params.searchTerm) {
      baseFilter += ` and contains(Name, '${params.searchTerm}')`;
    }
    if (params.koiBreedId) {
      baseFilter += ` and KoiBreeds/any(kb: kb/Id eq ${params.koiBreedId})`;
    }
    if (params.minPrice) {
      baseFilter += ` and Price ge ${params.minPrice}`;
    }
    if (params.maxPrice) {
      baseFilter += ` and Price le ${params.maxPrice}`;
    }
    if (params.isAvailableForSale !== undefined) {
      baseFilter += ` and IsAvailableForSale eq ${params.isAvailableForSale}`;
    }
    if (params.isSold !== undefined) {
      baseFilter += ` and IsSold eq ${params.isSold}`;
    }
    if (params.isConsigned !== undefined) {
      baseFilter += ` and IsConsigned eq ${params.isConsigned}`;
    }

    let query = `/odata/koi-fishes?$filter=${encodeURIComponent(baseFilter)}`;

    // Add $expand to include related entities
    query += "&$expand=KoiBreeds,KoiFishImages,KoiCertificates";

    // Add pagination
    if (params.pageNumber && params.pageSize) {
      query += `&$skip=${(params.pageNumber - 1) * params.pageSize}&$top=${params.pageSize}`;
    }

    // Add sorting
    if (params.sortBy) {
      query += `&$orderby=${encodeURIComponent(params.sortBy)}`;
    }

    try {
      const response =
        await axiosClient.get<ODataResponse<KoiFishOdata>>(query);
      const totalCount =
        response.data["@odata.count"] || response.data.value.length;
      const mappedData = response.data.value.map(mapOdataToKoiFish);

      return {
        isSuccess: true,
        data: mappedData,
        message: "Success",
        metadata: {
          currentPage: params.pageNumber || 1,
          pageSize: params.pageSize || response.data.value.length,
          totalCount: totalCount,
          totalPages: Math.ceil(totalCount / (params.pageSize || 10)),
        },
      };
    } catch (error) {
      console.error("Error fetching koi fish:", error);
      return {
        isSuccess: false,
        data: [],
        message: "Failed to fetch koi fish",
      };
    }
  },
};

export default koiFishApi;
