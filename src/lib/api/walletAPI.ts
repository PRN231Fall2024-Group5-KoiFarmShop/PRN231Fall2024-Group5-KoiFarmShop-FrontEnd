import axiosClient from "./axiosClient";

interface Wallet {
  userId: number;
  balance: number;
  loyaltyPoints: number;
  status: string;
}

interface Transaction {
  orderId: number | null;
  transactionType: string;
  paymentMethod: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  transactionDate: string;
  transactionStatus: string;
  note: string;
}

interface DepositResponse {
  transaction: Transaction;
  payUrl: string;
}

interface ApiResponse<T> {
  isSuccess: boolean;
  data: T | null;
  message: string;
}

interface WalletTransaction {
  orderId: number | null;
  transactionType: string;
  paymentMethod: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  transactionDate: string;
  transactionStatus: string;
  note: string;
}

interface KoiFish {
  id: number;
  name: string;
  price: number;
  // Add other relevant properties
}

interface OrderDetail {
  id: number;
  koiFishId: number;
  consignmentForNurtureId: number | null;
  price: number;
  status: string;
  koiFish: KoiFish;
}

interface Order {
  id: number;
  userId: number;
  orderDate: string;
  totalAmount: number;
  orderStatus: string;
  shippingAddress: string;
  paymentMethod: string;
  note: string;
  orderDetails: OrderDetail[];
}

const walletAPI = {
  getCurrentUserWallet: async (): Promise<ApiResponse<Wallet>> => {
    try {
      const response =
        await axiosClient.get<ApiResponse<Wallet>>("/users/me/wallets");
      return response.data;
    } catch (error) {
      console.error("Error fetching user wallet:", error);
      return {
        isSuccess: false,
        data: null,
        message: "Failed to fetch wallet information. Please try again.",
      };
    }
  },

  depositMoney: async (
    amount: number,
  ): Promise<ApiResponse<DepositResponse>> => {
    try {
      const response = await axiosClient.post<ApiResponse<DepositResponse>>(
        `/wallets/deposit?amount=${amount}`,
        null, // No body needed for this request
      );
      return response.data;
    } catch (error) {
      console.error("Error depositing money:", error);
      return {
        isSuccess: false,
        data: null,
        message: "Failed to create deposit order. Please try again.",
      };
    }
  },

  depositMoneyByPayOs: async (
    amount: number,
  ): Promise<ApiResponse<DepositResponse>> => {
    try {
      const response = await axiosClient.post<ApiResponse<DepositResponse>>(
        `/create-payment-link-payos`,
        { amount },
      );
      return response.data;
    } catch (error) {
      console.error("Error depositing money by PayOs:", error);
      return {
        isSuccess: false,
        data: null,
        message: "Failed to create deposit order. Please try again.",
      };
    }
  },

  getWalletTransactions: async (): Promise<
    ApiResponse<WalletTransaction[]>
  > => {
    try {
      const response = await axiosClient.get<ApiResponse<WalletTransaction[]>>(
        "/users/me/wallet-transactions",
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching wallet transactions:", error);
      return {
        isSuccess: false,
        data: null,
        message: "Failed to fetch transaction history. Please try again.",
      };
    }
  },

  getOrderHistory: async (): Promise<ApiResponse<Order[]>> => {
    try {
      const response =
        await axiosClient.get<ApiResponse<Order[]>>("/users/me/orders");
      return response.data;
    } catch (error) {
      console.error("Error fetching order history:", error);
      return {
        isSuccess: false,
        data: null,
        message: "Failed to fetch order history. Please try again.",
      };
    }
  },

  getOrderTransactions: async (
    orderId: number,
  ): Promise<ApiResponse<WalletTransaction[]>> => {
    try {
      const response = await axiosClient.get<ApiResponse<WalletTransaction[]>>(
        `/wallets/orders/${orderId}/wallet-transactions`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching order transactions:", error);
      return {
        isSuccess: false,
        data: null,
        message: "Failed to fetch order transactions. Please try again.",
      };
    }
  },
};

export default walletAPI;
