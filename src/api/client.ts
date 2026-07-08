import axios from "axios";
import { useAuthStore } from "@/store/authStore";

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const isAuthEndpoint =
            error.config?.url?.includes("/api/users/login") ||
            error.config?.url?.includes("/api/users/register");

        if (error.response?.status === 401 && !isAuthEndpoint) {
            useAuthStore.getState().logout();
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);