import apiClient from "./client";
import type { UserDetail, ReviewData } from "../types";

export const getPendingUsersApi = async (): Promise<UserDetail[]> => {
  const res = await apiClient.get("/users/pending");
  return res.data;
};

export const getAllUsersApi = async (): Promise<UserDetail[]> => {
  const res = await apiClient.get("/users");
  return res.data;
};

export const reviewUserApi = async (
  userId: number,
  data: ReviewData
): Promise<UserDetail> => {
  const res = await apiClient.post(`/users/${userId}/review`, data);
  return res.data;
};
