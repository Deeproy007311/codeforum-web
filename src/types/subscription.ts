export type SubscriptionPlan = "free" | "pro";
export type SubscriptionStatus = "active" | "cancelled" | "expired";

export interface Subscription {
    _id: string;
    user: string;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    startDate: string;
    endDate: string | null;
    paymentId: string;
    paymentProvider: "manual" | "razorpay";
    createdAt: string;
    updatedAt: string;
}

export interface GetSubscriptionResponse {
    success: boolean;
    plan: SubscriptionPlan;
    subscription: Subscription | null;
}

export interface RazorpayOrderResponse {
    success: boolean;
    order: {
        id: string;
        amount: number;
        currency: string;
    };
    keyId: string;
    plan: {
        name: string;
        amount: number;
        currency: string;
        durationDays: number;
    };
}

export interface VerifyPaymentPayload {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

export interface VerifyPaymentResponse {
    success: boolean;
    message: string;
    user: {
        _id: string;
        name: string;
        username: string;
        email: string;
        plan: SubscriptionPlan;
    };
    subscription: Subscription;
}