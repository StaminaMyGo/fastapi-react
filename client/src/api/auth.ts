import apiClient from "./client";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface UserInfo {
  id: number;
  email: string;
  name: string;
  role: string;
  status: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: UserInfo;
}

export const loginApi = async (data: LoginData): Promise<AuthResponse> => {
  const res = await apiClient.post("/auth/login", data);
  return res.data;
};

export const registerApi = async (data: RegisterData): Promise<UserInfo> => {
  const res = await apiClient.post("/auth/register", data);
  return res.data;
};

export const getMeApi = async (): Promise<UserInfo> => {
  const res = await apiClient.get("/users/me");
  return res.data;
};
