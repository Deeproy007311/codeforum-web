import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getMySubscription, createRazorpayOrder, verifyRazorpayPayment } from "@/api/subscription";
import { loadRazorpayScript } from "@/lib/razorpay";
import { useAuthStore } from "@/store/authStore";
import { Crown, Sparkles, CalendarClock, ShieldCheck } from "lucide-react";

function formatDate(dateString: string | null) {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function SubscriptionTab() {
    const queryClient = useQueryClient();
    const setUser = useAuthStore((state) => state.setUser);
    const user = useAuthStore((state) => state.user);

    const { data, isLoading } = useQuery({
        queryKey: ["subscription"],
        queryFn: getMySubscription,
    });

    const upgradeMutation = useMutation({
        mutationFn: async () => {
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                throw new Error("Failed to load Razorpay. Check your connection.");
            }

            const orderData = await createRazorpayOrder();

            return new Promise((resolve, reject) => {
                const options = {
                    key: orderData.keyId,
                    amount: orderData.order.amount,
                    currency: orderData.order.currency,
                    name: "CodeForum",
                    description: `Upgrade to ${orderData.plan.name} Plan`,
                    order_id: orderData.order.id,
                    handler: async (response: any) => {
                        try {
                            const result = await verifyRazorpayPayment({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            });
                            resolve(result);
                        } catch (err) {
                            reject(err);
                        }
                    },
                    modal: {
                        ondismiss: () => {
                            reject(new Error("Payment cancelled"));
                        },
                    },
                    theme: { color: "#4f46e5" },
                };

                const razorpayInstance = new window.Razorpay(options);
                razorpayInstance.open();
            });
        },
        onSuccess: (result: any) => {
            toast.success("Payment successful! You're now on Pro.");
            if (user) {
                setUser({ ...user, plan: result.user.plan });
            }
            queryClient.invalidateQueries({ queryKey: ["subscription"] });
            queryClient.invalidateQueries({ queryKey: ["ai-usage"] });
        },
        onError: (error: any) => {
            if (error?.message === "Payment cancelled") {
                toast.info("Payment cancelled");
                return;
            }
            const message = error?.response?.data?.message || error?.message;
            toast.error(message || "Payment failed. Please try again.");
        },
    });

    if (isLoading) {
        return <Skeleton className="h-48 w-full rounded-xl" />;
    }

    const isPro = data?.plan === "pro";
    const subscription = data?.subscription;

    return (
        <div className="space-y-4">
            <div
                className={`rounded-2xl border p-6 ${isPro
                        ? "border-amber-300/60 bg-gradient-to-br from-amber-50 to-orange-50 dark:border-amber-800/40 dark:from-amber-950/20 dark:to-orange-950/10"
                        : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/40"
                    }`}
            >
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {isPro ? (
                            <Crown className="h-5 w-5 text-amber-500" />
                        ) : (
                            <ShieldCheck className="h-5 w-5 text-slate-400" />
                        )}
                        <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                            {isPro ? "Pro Plan" : "Free Plan"}
                        </span>
                    </div>
                    <Badge
                        className={
                            isPro
                                ? "bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300"
                        }
                    >
                        {data?.plan.toUpperCase()}
                    </Badge>
                </div>

                {isPro && subscription && (
                    <div className="mb-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <CalendarClock className="h-4 w-4" />
                        Renews / expires on{" "}
                        <span className="font-medium">{formatDate(subscription.endDate)}</span>
                    </div>
                )}

                <ul className="mb-5 space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
                    <li>• {isPro ? "100" : "10"} AI requests per month</li>
                    <li>• {isPro ? "Priority" : "Standard"} response speed</li>
                    <li>• Unlimited questions & answers</li>
                </ul>

                {!isPro && (
                    <Button
                        onClick={() => upgradeMutation.mutate()}
                        disabled={upgradeMutation.isPending}
                        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md hover:from-indigo-500 hover:to-violet-500"
                    >
                        {upgradeMutation.isPending ? (
                            "Processing..."
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Upgrade to Pro — ₹199/month
                            </>
                        )}
                    </Button>
                )}
            </div>

            <p className="text-center text-xs text-slate-400 dark:text-slate-500">
                Test mode — no real charges will be made.
            </p>
        </div>
    );
}

export default SubscriptionTab;