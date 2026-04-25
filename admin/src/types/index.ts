import type { UserInfo } from "../api/auth";

export interface UserDetail extends UserInfo {
  created_at: string;
}

export interface ReviewData {
  action: "approve" | "reject";
}
