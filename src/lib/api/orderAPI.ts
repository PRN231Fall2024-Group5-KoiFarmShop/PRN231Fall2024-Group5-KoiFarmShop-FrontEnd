import axiosClient from "./axiosClient";

interface PurchaseFish {
  fishId: number;
  isNuture: boolean;
  dietId?: number;
  startDate?: string;
  endDate?: string;
  note?: string;
}

interface CreateOrderRequest {
  purchaseFishes: PurchaseFish[];
  shippingAddress: string;
  note?: string;
}

interface ApiResponse<T> {
  data: T;
  message: string;
  isSuccess: boolean;
}

const orderAPI = {
  createOrder: async (
    orderData: CreateOrderRequest,
  ): Promise<ApiResponse<any>> => {
    try {
      const response = await axiosClient.post<ApiResponse<any>>(
        "/payment/purchase",
        orderData,
      );
      return response.data;
    } catch (error) {
      console.error("Error creating order:", error);
      return {
        data: null,
        message: "Failed to create order. Please try again.",
        isSuccess: false,
      };
    }
  },
};

export default orderAPI;

// Helper function to create order data from cart items
export const createOrderDataFromCart = (
  cartItems: any[],
  shippingAddress: string,
  note?: string,
): CreateOrderRequest => {
  const purchaseFishes = cartItems.map((item) => ({
    fishId: item.id,
    isNuture: item.consign,
    ...(item.consign && item.consignmentConfig
      ? {
          dietId: item.consignmentConfig.dietId,
          startDate:
            typeof item.consignmentConfig.dateRange?.from === "string"
              ? item.consignmentConfig.dateRange.from
              : item.consignmentConfig.dateRange?.from?.toISOString(),
          endDate:
            typeof item.consignmentConfig.dateRange?.to === "string"
              ? item.consignmentConfig.dateRange.to
              : item.consignmentConfig.dateRange?.to?.toISOString(),
        }
      : {}),
    note: item.note, // Add this if you have a note for individual items
  }));

  return {
    purchaseFishes,
    shippingAddress,
    note,
  };
};
