// import { axiosClient, handleApiError } from "./axiosClient";

import { request } from "../configs/axios.config";

export const login = ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  return request({
    method: "POST",
    url: `/login`,
    data: {
      email: email,
      password: password,
    },
  });
};

export const refreshToken = (refreshToken: string) => {
  return request({
    method: "POST",
    url: `/refresh`,
    data: {
      refreshToken: refreshToken,
    },
  });
};

export const register = ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  return request({
    method: "POST",
    url: `/register`,
    data: {
      email: email,
      password: password,
    },
  });
};
