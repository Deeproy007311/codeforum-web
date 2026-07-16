import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getMySubscription, createRazorpayOrder, verifyRazorpayPayment } from "@/api/subscription";
import { loadRazorpayScript } from "@/lib/razorpay";
import { useAuthStore } from "@/store/authStore";
import { getAIUsage } from "@/api/ai";
import { Crown, Sparkles, CalendarClock, ShieldCheck, Check, Info } from "lucide-react";
import { motion } from "framer-motion";

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

    const { data: subscriptionData, isLoading: isSubLoading } = useQuery({
        queryKey: ["subscription"],
        queryFn: getMySubscription,
    });

    const { data: aiUsage, isLoading: isUsageLoading } = useQuery({
        queryKey: ["ai-usage"],
        queryFn: getAIUsage,
        refetchOnWindowFocus: false,
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

                const razorpayInstance = new (window as any).Razorpay(options);
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

    if (isSubLoading || isUsageLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-44 w-full rounded-2xl" />
                <Skeleton className="h-60 w-full rounded-2xl" />
            </div>
        );
    }

    const isPro = subscriptionData?.plan === "pro";
    const subscription = subscriptionData?.subscription;

    return (
        <div className="space-y-6">
            {/* Top info badge */}
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Plan Overview
                </span>
                <Badge variant="outline" className="border-slate-200 dark:border-slate-800 text-[10px] uppercase font-semibold">
                    Billing cycle: Monthly
                </Badge>
            </div>

            {/* Premium Active Plan Card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl border p-6 relative overflow-hidden transition-all duration-300 shadow-xs ${
                    isPro
                        ? "border-amber-300/80 bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-yellow-500/5 dark:border-amber-500/30 dark:from-amber-500/10 dark:via-amber-600/5 dark:to-transparent"
                        : "border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-900/10"
                }`}
            >
                {/* Background glow decoration */}
                {isPro && (
                    <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full blur-[80px] opacity-10 dark:opacity-20 pointer-events-none translate-x-12 -translate-y-12" />
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`h-11 w-11 flex items-center justify-center rounded-xl shrink-0 shadow-xs ${
                            isPro 
                                ? "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400" 
                                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        }`}>
                            {isPro ? (
                                <Crown className="h-5 w-5" />
                            ) : (
                                <ShieldCheck className="h-5 w-5" />
                            )}
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                                Current Plan
                            </span>
                            <span className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5 inline-block">
                                {isPro ? "CodeForum Pro" : "CodeForum Basic Free"}
                            </span>
                        </div>
                    </div>
                    
                    <Badge
                        className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 border uppercase tracking-wider ${
                            isPro
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400"
                                : "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/60 dark:text-slate-400 dark:border-slate-800"
                        }`}
                    >
                        Active
                    </Badge>
                </div>

                {isPro && subscription && (
                    <div className="mb-6 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 rounded-xl px-4 py-2.5 w-fit">
                        <CalendarClock className="h-4 w-4 text-amber-500 shrink-0" />
                        <span>
                            Renews / expires on <span className="font-bold text-slate-900 dark:text-white">{formatDate(subscription.endDate)}</span>
                        </span>
                    </div>
                )}

                {/* Progress usage meter (if queries stats loaded) */}
                {aiUsage && (
                    <div className="mb-6 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/10 border border-slate-100 dark:border-slate-800/80">
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">AI Limit Requests</span>
                            <span className="text-slate-500 dark:text-slate-400 font-bold">
                                {aiUsage.used} / {aiUsage.limit} requests used
                            </span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 transition-all duration-500 rounded-full"
                                style={{ width: `${Math.min(100, (aiUsage.used / aiUsage.limit) * 100)}%` }}
                            />
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 flex items-center gap-1.5">
                            <Info className="h-3.5 w-3.5" />
                            Limits reset at the end of each monthly billing cycle.
                        </p>
                    </div>
                )}

                {/* Checklist of benefits */}
                <div className="border-t border-slate-100 dark:border-slate-800/80 pt-5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3.5">
                        Plan Benefits & Features
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <li className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                            <div className="h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="h-3 w-3 stroke-[3]" />
                            </div>
                            <span>
                                <strong className="text-slate-800 dark:text-white font-bold">{isPro ? "100" : "10"} AI requests</strong> per month
                            </span>
                        </li>
                        <li className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                            <div className="h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="h-3 w-3 stroke-[3]" />
                            </div>
                            <span>
                                <strong className="text-slate-800 dark:text-white font-bold">{isPro ? "Priority" : "Standard"} speed</strong> response queue
                            </span>
                        </li>
                        <li className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                            <div className="h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="h-3 w-3 stroke-[3]" />
                            </div>
                            <span>Unlimited question posts</span>
                        </li>
                        <li className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                            <div className="h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="h-3 w-3 stroke-[3]" />
                            </div>
                            <span>Unlimited community answers</span>
                        </li>
                    </ul>
                </div>
            </motion.div>

            {/* Upgrade Pricing Tier Card (only shown for Free plan) */}
            {!isPro && (
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-2xl border-2 border-indigo-600 bg-slate-900/5 dark:bg-indigo-950/5 p-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
                >
                    <div className="absolute top-0 left-0 w-24 h-24 bg-indigo-500 rounded-full blur-[70px] opacity-10 dark:opacity-20 pointer-events-none -translate-x-6 -translate-y-6" />
                    
                    <div className="space-y-1.5 text-center md:text-left">
                        <Badge className="bg-indigo-600 text-white font-bold tracking-wider text-[10px] uppercase h-5">
                            Recommended
                        </Badge>
                        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                            Upgrade to CodeForum Pro
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                            Get 10x more AI code explanations, cache-free answers, and instant response queues to solve bugs instantly.
                        </p>
                    </div>

                    <div className="text-center md:text-right shrink-0 flex flex-col gap-3.5 w-full md:w-auto">
                        <div>
                            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">₹199</span>
                            <span className="text-slate-500 text-xs font-semibold"> / month</span>
                        </div>
                        
                        <Button
                            onClick={() => upgradeMutation.mutate()}
                            disabled={upgradeMutation.isPending}
                            className="w-full md:w-auto px-6 h-11 bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/20 hover:from-indigo-500 hover:to-violet-500 rounded-xl font-bold gap-1.5 relative overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.99]"
                        >
                            {upgradeMutation.isPending ? (
                                "Initializing..."
                            ) : (
                                <>
                                    <Sparkles className="h-4.5 w-4.5 animate-pulse text-amber-300" />
                                    Get Pro Now
                                </>
                            )}
                        </Button>
                    </div>
                </motion.div>
            )}

            <div className="flex flex-col items-center justify-center gap-1.5 pt-4">
                <p className="text-center text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Info className="h-3.5 w-3.5 shrink-0" />
                    Test mode — transactions are fully simulated. No real charges are applied.
                </p>
            </div>
        </div>
    );
}

export default SubscriptionTab;