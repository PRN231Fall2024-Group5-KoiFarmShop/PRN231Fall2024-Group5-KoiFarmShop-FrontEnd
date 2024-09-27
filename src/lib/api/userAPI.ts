// src/apis/userApi.ts

import { request } from "@/lib/configs/axios.config";
import { UserCreateDTO, UserUpdateDTO } from "@/types/user";

// Fetch all users
export const fetchUserList = () => {
  return request({
    method: "GET",
    url: `/users`,
  });
};

// Fetch a single user by ID
export const getUserById = (id: number) => {
  return request({
    method: "GET",
    url: `/users/${id}`,
  });
};

// Create a new user
export const createUser = (data: UserCreateDTO) => {
  return request({
    method: "POST",
    url: `/users`,
    data,
  });
};

// Update a user
export const updateUser = (id: number, data: UserUpdateDTO) => {
  return request({
    method: "PUT",
    url: `/users/${id}`,
    data,
  });
};

// Delete a user by ID
export const deleteUser = (id: number) => {
  return request({
    method: "DELETE",
    url: `/users/${id}`,
  });
};

// Query users with filters (optional)
export const queryUser = (query: { [key: string]: any }) => {
  return request({
    method: "GET",
    url: `/users`,
    params: {
      ...query,
    },
  });
};
