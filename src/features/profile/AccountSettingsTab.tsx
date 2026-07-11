import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteMyAccount } from "@/api/auth";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

function AccountSettingsTab() {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);

    const deleteMutation = useMutation({
        mutationFn: deleteMyAccount,
        onSuccess: () => {
            toast.success("Account deleted");
            logout();
            navigate("/");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to delete account");
        },
    });

    if (!user) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-5 dark:border-slate-800/80 dark:bg-slate-900/40">
                <Avatar className="h-14 w-14">
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-lg font-bold text-white">
                        {user.username?.[0]?.toUpperCase() ?? "?"}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{user.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">@{user.username}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                </div>
            </div>

            <div className="rounded-xl border border-red-200 bg-red-50/40 p-5 dark:border-red-900/40 dark:bg-red-950/10">
                <h3 className="mb-1 text-sm font-semibold text-red-700 dark:text-red-400">
                    Danger Zone
                </h3>
                <p className="mb-4 text-sm text-red-600/80 dark:text-red-400/70">
                    Deleting your account permanently removes your questions, answers,
                    votes, and AI history. This cannot be undone.
                </p>

                <AlertDialog>
                    <AlertDialogTrigger className="inline-flex h-9 items-center gap-1.5 rounded-md bg-red-600 px-4 text-sm font-medium text-white transition-colors hover:bg-red-700">
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete My Account
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete your account and all associated
                                data — questions, answers, votes, and AI history. This action
                                cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => deleteMutation.mutate()}
                            >
                                Yes, delete my account
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}

export default AccountSettingsTab;