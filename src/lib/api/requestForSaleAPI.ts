import axiosClient from "./axiosClient";
import { KoiFish } from "./koiFishApi";
import { User } from "./userAPI";

export const REQUEST_FOR_SALE_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CANCELED: "CANCELED",
};

// Interface for creating a request for sale
export interface RequestForSaleCreate {
  userId: number;
  koiFishId: number;
  priceDealed: number;
  note?: string;
}

// Interface for request for sale response
export interface RequestForSale {
  id: number;
  userId: number;
  koiFishId: number;
  priceDealed: number;
  requestStatus: string;
  note: string | null;
  createdAt: string;
  createdBy: number;
  modifiedAt: string | null;
  modifiedBy: number | null;
  deletedAt: string | null;
  deletedBy: number | null;
  isDeleted: boolean;
  user?: User;
  koiFish?: {
    id: number;
    name: string;
    origin: string;
    gender: string;
    dob: string;
    length: number;
    weight: number;
    personalityTraits: string;
    dailyFeedAmount: number;
    lastHealthCheck: string;
    isAvailableForSale: boolean;
    price: number;
    isConsigned: boolean;
    ownerId: number;
    createdAt: string;
    createdBy: number;
    modifiedAt: string | null;
    modifiedBy: number | null;
    deletedAt: string | null;
    deletedBy: number | null;
    isDeleted: boolean;
  };
}

// Interface for OData response format
interface RequestForSaleOData {
  Id: number;
  UserId: number;
  KoiFishId: number;
  PriceDealed: number;
  RequestStatus: string;
  Note: string | null;
  CreatedAt: string;
  CreatedBy: number;
  ModifiedAt: string | null;
  ModifiedBy: number | null;
  DeletedAt: string | null;
  DeletedBy: number | null;
  IsDeleted: boolean;
  KoiFish?: KoiFishOData;
}

// Interface for API response
interface ApiResponse<T> {
  isSuccess: boolean;
  data: T;
  message: string;
}

// Interface for OData response
interface ODataResponse<T> {
  "@odata.context"?: string;
  value: T[];
  "@odata.count"?: number;
}

// Add these interfaces at the top with the other interfaces
export interface RequestForSaleQueryParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  status?: string;
  koiFishId?: number;
}

// Add KoiFish OData interface
interface KoiFishOData {
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
  OwnerId: number;
  Id: number;
  CreatedAt: string;
  CreatedBy: number;
  ModifiedAt: string | null;
  ModifiedBy: number | null;
  DeletedAt: string | null;
  DeletedBy: number | null;
  IsDeleted: boolean;
  ImageUrl?: string | null;
}

// Add KoiFish mapping function
const mapODataToKoiFish = (odata: KoiFishOData) => ({
  id: odata.Id,
  name: odata.Name,
  origin: odata.Origin,
  gender: odata.Gender ? "Male" : "Female",
  dob: odata.Dob,
  length: odata.Length,
  weight: odata.Weight,
  personalityTraits: odata.PersonalityTraits,
  dailyFeedAmount: odata.DailyFeedAmount,
  lastHealthCheck: odata.LastHealthCheck,
  isAvailableForSale: odata.IsAvailableForSale,
  price: odata.Price,
  isConsigned: odata.IsConsigned,
  ownerId: odata.OwnerId,
  createdAt: odata.CreatedAt,
  createdBy: odata.CreatedBy,
  modifiedAt: odata.ModifiedAt,
  modifiedBy: odata.ModifiedBy,
  deletedAt: odata.DeletedAt,
  deletedBy: odata.DeletedBy,
  isDeleted: odata.IsDeleted,
  imageUrl: odata.ImageUrl
    ? odata.ImageUrl.startsWith("http") || odata.ImageUrl.startsWith("/")
      ? odata.ImageUrl
      : `/images/${odata.ImageUrl}`
    : "/images/no-image.png",
});

// Update the mapping function to include KoiFish
const mapODataToRequestForSale = (
  odata: RequestForSaleOData,
): RequestForSale => ({
  id: odata.Id,
  userId: odata.UserId,
  koiFishId: odata.KoiFishId,
  priceDealed: odata.PriceDealed,
  requestStatus: odata.RequestStatus,
  note: odata.Note,
  createdAt: odata.CreatedAt,
  createdBy: odata.CreatedBy,
  modifiedAt: odata.ModifiedAt,
  modifiedBy: odata.ModifiedBy,
  deletedAt: odata.DeletedAt,
  deletedBy: odata.DeletedBy,
  isDeleted: odata.IsDeleted,
  koiFish: odata.KoiFish ? mapODataToKoiFish(odata.KoiFish) : undefined,
});

const requestForSaleApi = {
  create: async (
    data: RequestForSaleCreate,
  ): Promise<ApiResponse<RequestForSale>> => {
    const response = await axiosClient.post<ApiResponse<RequestForSale>>(
      "/RequestForSale",
      data,
    );
    return response.data;
  },

  // Updated function to get my request for sales with proper mapping
  getMyRequestForSales: async (
    params: RequestForSaleQueryParams = {},
  ): Promise<ODataResponse<RequestForSale>> => {
    try {
      let query = "/odata/my-request-for-sales?$expand=KoiFish";

      // Add koiFishId filter if provided
      if (params.koiFishId) {
        query += `${query.includes("?") ? "&" : "?"}$filter=KoiFishId eq ${params.koiFishId}`;
      }

      // Add search filter if searchTerm is provided
      // if (params.searchTerm) {
      //   query += `?$filter=contains(Note, '${encodeURIComponent(params.searchTerm)}')`;
      // }

      // Add status filter if provided
      // if (params.status) {
      //   const filterPrefix = query.includes("?$filter=")
      //     ? " and "
      //     : "?$filter=";
      //   query += `${filterPrefix}RequestStatus eq '${params.status}'`;
      // }

      // Add pagination parameters if provided
      if (params.pageNumber && params.pageSize) {
        const skipParam = `$skip=${(params.pageNumber - 1) * params.pageSize}`;
        const topParam = `$top=${params.pageSize}`;
        query += query.includes("?")
          ? `&${skipParam}&${topParam}`
          : `?${skipParam}&${topParam}`;
      }

      // Add sorting if provided
      if (params.sortBy) {
        const orderByParam = `$orderby=${encodeURIComponent(params.sortBy)}`;
        query += query.includes("?") ? `&${orderByParam}` : `?${orderByParam}`;
      }

      const response =
        await axiosClient.get<ODataResponse<RequestForSaleOData>>(query);

      return {
        "@odata.context": response.data["@odata.context"],
        "@odata.count": response.data["@odata.count"],
        value: response.data.value.map(mapODataToRequestForSale),
      };
    } catch (error) {
      console.error("Error fetching my request for sales:", error);
      return { value: [] };
    }
  },

  cancel: async (id: number): Promise<ApiResponse<RequestForSale>> => {
    const response = await axiosClient.put<ApiResponse<RequestForSale>>(
      `/RequestForSale/${id}/cancel`,
    );
    return response.data;
  },
};

export default requestForSaleApi;
