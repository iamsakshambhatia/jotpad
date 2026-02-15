import { createMutation } from "react-query-kit";
import { axiosInstance } from "./axios";
import type { AuthTokens, LoginRequest, RegisterRequest, User } from "../types";

export const useLogin = createMutation({
  mutationFn: async (variables: LoginRequest): Promise<AuthTokens> => {
    const { data } = await axiosInstance.post<AuthTokens>("/api/v1/login", variables);
    return data;
  },
});

export const useRegister = createMutation({
  mutationFn: async (variables: RegisterRequest): Promise<User> => {
    const { data } = await axiosInstance.post<User>("/api/v1/users/", variables);
    return data;
  },
});
