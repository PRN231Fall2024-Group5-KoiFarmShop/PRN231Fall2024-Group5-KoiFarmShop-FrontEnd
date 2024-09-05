import { request } from "@/lib/configs/axios.config";

export type ItemCreateModel = {
  name: string;
  description: string;
};

export type ItemModel = ItemCreateModel & {
  id: string;
};

export type ItemQuery = {
  OrderBy?: string;
  SearchTerm?: string;
  Status?: boolean;
  PageNumber?: number;
  PageSize?: number;
  [key: string]: any;
};

// Fetch all items
export const fetchItemList = () => {
  return request({
    method: "GET",
    url: `/api/test`,
  });
};

// Fetch a single item by ID
export const getItemById = (id: string) => {
  return request({
    method: "GET",
    url: `/api/test/${id}`,
  });
};

// Create a new item
export const createItem = (data: ItemCreateModel) => {
  return request({
    method: "POST",
    url: `/api/test`,
    data,
  });
};

// Update an item
export const updateItem = (data: ItemModel) => {
  return request({
    method: "PUT",
    url: `/api/test`,
    params: {
      id: data.id,
    },
    data,
  });
};

// Delete an item by ID
export const deleteItem = (id: string) => {
  return request({
    method: "DELETE",
    url: `/api/test/${id}`,
  });
};

// Query items with filters
export const queryItem = (query: ItemQuery) => {
  return request({
    method: "GET",
    url: `/api/test`,
    params: {
      ...query,
    },
  });
};
