import { apiClient } from "./client";
import type {
    AuthResponse,
    LoginPayload,
    RegisterPayload,
    User,
    UpdatePasswordPayload,
} from "@/types/auth";

export const registerUser = async (
    payload: RegisterPayload
): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>(
        "/api/users/register",
        payload
    );
    return data;
};

export const loginUser = async (
    payload: LoginPayload
): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>(
        "/api/users/login",
        payload
    );
    return data;
};

export const getCurrentUser = async (): Promise<User> => {
    const { data } = await apiClient.get<{ success: boolean; user: User }>(
        "/api/users/me"
    );
    return data.user;
};

export const deleteMyAccount = async (): Promise<void> => {
    await apiClient.delete("/api/users/me");
};

export const updatePassword = async (
    payload: UpdatePasswordPayload
): Promise<void> => {
    await apiClient.put("/api/users/update-password", payload);
};