import { CreateUserDTO } from "@/app/(manager)/manager/user-management/_lib/userSchema";
import { backendUrl } from "../constraint";
import { request } from "../configs/axios.config";

export const createAccount = (createAccount: CreateUserDTO) => {
    return request({
      method: "POST",
      url: `${backendUrl}/users?role=${createAccount?.role ?? "CUSTOMER"}`,
      data: {
        ...createAccount,
      },
    });
  };
  