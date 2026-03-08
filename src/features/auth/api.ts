import { apiClient } from "@/lib/api-client";
import { AuthResponse, User } from "@/types/auth.types";

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<AuthResponse>("/auth/login", { email, password }),

  logout: () =>
    apiClient.post("/auth/logout"),

  getMe: () =>
    apiClient.get<User>("/auth/me"),

  changePassword: (oldPassword: string, newPassword: string) =>
    apiClient.patch("/auth/change-password", { oldPassword, newPassword }),
};
