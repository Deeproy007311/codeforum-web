import { apiClient } from "./client";
import type {
    GetSubscriptionResponse,
    RazorpayOrderResponse,
    VerifyPaymentPayload,
    VerifyPaymentResponse,
} from "@/types/subscription";

export const getMySubscription = async (): Promise<GetSubscriptionResponse> => {
    const { data } = await apiClient.get<GetSubscriptionResponse>(
        "/api/subscriptions/me"
    );
    return data;
};

export const createRazorpayOrder = async (): Promise<RazorpayOrderResponse> => {
    const { data } = await apiClient.post<RazorpayOrderResponse>(
        "/api/subscriptions/create-order"
    );
    return data;
};

export const verifyRazorpayPayment = async (
    payload: VerifyPaymentPayload
): Promise<VerifyPaymentResponse> => {
    const { data } = await apiClient.post<VerifyPaymentResponse>(
        "/api/subscriptions/verify-payment",
        payload
    );
    return data;
};