import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/authStore";
import AIHistoryTab from "./AIHistoryTab";
import AccountSettingsTab from "./AccountSettingsTab";
import { Sparkles, Settings, CreditCard } from "lucide-react";

function ProfilePage() {
    const user = useAuthStore((state) => state.user);

    return (
        <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {user?.username ?? "Your"}'s Profile
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Manage your account, view AI usage, and check your plan.
                </p>
            </div>

            <Tabs defaultValue="ai-history" className="w-full">
                <TabsList className="mb-6">
                    <TabsTrigger value="ai-history" className="flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5" />
                        AI History
                    </TabsTrigger>
                    <TabsTrigger value="subscription" className="flex items-center gap-1.5" disabled>
                        <CreditCard className="h-3.5 w-3.5" />
                        Subscription
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="flex items-center gap-1.5">
                        <Settings className="h-3.5 w-3.5" />
                        Account Settings
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="ai-history">
                    <AIHistoryTab />
                </TabsContent>

                <TabsContent value="subscription">
                    <p className="text-sm text-slate-400">Coming soon in Phase 5.</p>
                </TabsContent>

                <TabsContent value="settings">
                    <AccountSettingsTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default ProfilePage;