export interface User {
    _id: string;
    name: string;
    username: string;
    email: string;
    avatar?: string;
    bio?: string;
    skills?: string[];
    emailVerified?: boolean;
    plan: "free" | "pro";
}

export interface AuthResponse {
    success: boolean;
    message: string;
    accessToken: string;
    user: User;
}

export interface RegisterPayload {
    name: string;
    username: string;
    email: string;
    password: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface UpdatePasswordPayload {
    currentPassword: string;
    newPassword: string;
}