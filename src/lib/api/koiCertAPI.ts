import axiosClient from "./axiosClient";

interface ApiResponse<T> {
  data: T;
  message: string;
  isSuccess: boolean;
}

// Interface for OData response
interface ODataResponse<T> {
  value: T[];
  "@odata.count"?: number;
}

export const CERTIFICATE_TYPES = [
  "Birth Certificate",
  "Breed Certificate",
  "Award Certificate",
] as const;

// OData interface matching the API response
export interface KoiCertificateOdata {
  Id: number;
  KoiFishId: number;
  CertificateType: string;
  CertificateUrl: string;
  CreatedAt: string;
  CreatedBy: number;
  ModifiedAt: string | null;
  ModifiedBy: number | null;
  DeletedAt: string | null;
  DeletedBy: number | null;
  IsDeleted: boolean;
}

// Our application interface
export interface KoiFishCertificate {
  id: number;
  koiFishId: number;
  certificateType: string;
  certificateUrl: string;
  createdAt?: string;
  createdBy?: number;
  modifiedAt?: string | null;
  modifiedBy?: number | null;
  deletedAt?: string | null;
  deletedBy?: number | null;
  isDeleted?: boolean;
}

export interface KoiFishCertificateCreate {
  koiFishId: number;
  certificateType: string;
  certificateUrl: string;
}

export interface KoiFishCertificateUpdate {
  certificateType: string;
  certificateUrl: string;
}

// Mapping function from OData to our application interface
const mapOdataToCertificate = (
  odataCert: KoiCertificateOdata,
): KoiFishCertificate => ({
  id: odataCert.Id,
  koiFishId: odataCert.KoiFishId,
  certificateType: odataCert.CertificateType,
  certificateUrl: odataCert.CertificateUrl,
  createdAt: odataCert.CreatedAt,
  createdBy: odataCert.CreatedBy,
  modifiedAt: odataCert.ModifiedAt,
  modifiedBy: odataCert.ModifiedBy,
  deletedAt: odataCert.DeletedAt,
  deletedBy: odataCert.DeletedBy,
  isDeleted: odataCert.IsDeleted,
});

const koiCertAPI = {
  // Get certificates by koi fish ID using OData
  getByKoiFishId: async (
    koiFishId: number,
  ): Promise<ApiResponse<KoiFishCertificate[]>> => {
    try {
      const query = `/odata/koi-certificates?$filter=KoiFishId eq ${koiFishId} and IsDeleted eq false`;
      const response =
        await axiosClient.get<ODataResponse<KoiCertificateOdata>>(query);

      const mappedData = response.data.value.map(mapOdataToCertificate);

      return {
        isSuccess: true,
        data: mappedData,
        message: "Success",
      };
    } catch (error) {
      console.error("Error fetching certificates:", error);
      return {
        isSuccess: false,
        data: [],
        message: "Failed to fetch certificates",
      };
    }
  },

  // Create new certificate
  create: async (
    data: KoiFishCertificateCreate,
  ): Promise<ApiResponse<KoiFishCertificate>> => {
    try {
      const response = await axiosClient.post<ApiResponse<KoiFishCertificate>>(
        "/koi-certificates",
        data,
      );
      return response.data;
    } catch (error) {
      console.error("Error creating certificate:", error);
      return {
        isSuccess: false,
        data: {} as KoiFishCertificate,
        message: "Failed to create certificate",
      };
    }
  },

  // Update certificate
  update: async (
    id: number,
    data: KoiFishCertificateUpdate,
  ): Promise<ApiResponse<KoiFishCertificate>> => {
    try {
      const response = await axiosClient.put<ApiResponse<KoiFishCertificate>>(
        `/koi-certificates/${id}`,
        data,
      );
      return response.data;
    } catch (error) {
      console.error("Error updating certificate:", error);
      return {
        isSuccess: false,
        data: {} as KoiFishCertificate,
        message: "Failed to update certificate",
      };
    }
  },

  // Delete certificate
  delete: async (id: number): Promise<ApiResponse<null>> => {
    try {
      const response = await axiosClient.delete<ApiResponse<null>>(
        `/koi-certificates/${id}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting certificate:", error);
      return {
        isSuccess: false,
        data: null,
        message: "Failed to delete certificate",
      };
    }
  },
};

export default koiCertAPI;
