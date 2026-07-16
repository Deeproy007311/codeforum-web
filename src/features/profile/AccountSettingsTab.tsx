import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteMyAccount } from "@/api/auth";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Trash2, ShieldAlert, KeyRound, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

function AccountSettingsTab() {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);

    // Mock password state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const deleteMutation = useMutation({
        mutationFn: deleteMyAccount,
        onSuccess: () => {
            toast.success("Account permanently deleted. We're sad to see you go!");
            logout();
            navigate("/");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to delete account");
        },
    });

    if (!user) return null;

    const handleUpdatePassword = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match!");
            return;
        }

        setIsUpdatingPassword(true);
        
        // Mock API latency
        setTimeout(() => {
            setIsUpdatingPassword(false);
            toast.success("Password updated successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        }, 1200);
    };

    return (
        <div className="space-y-6">
            
            {/* Password security section */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800/80 dark:bg-slate-900/10"
            >
                <div className="flex items-center gap-2 mb-4">
                    <KeyRound className="h-4.5 w-4.5 text-indigo-500" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                        Security & Authentication
                    </h3>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                    <div className="space-y-1.5 relative">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            Current Password
                        </label>
                        <div className="relative">
                            <Input
                                type={showPass ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="h-9.5 pr-10 text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                New Password
                            </label>
                            <Input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Min. 8 characters"
                                required
                                className="h-9.5 text-sm"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                Confirm New Password
                            </label>
                            <Input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm password"
                                required
                                className="h-9.5 text-sm"
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isUpdatingPassword}
                        className="h-9 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                    >
                        {isUpdatingPassword ? "Updating security keys..." : "Update Password"}
                    </Button>
                </form>
            </motion.div>

            {/* Danger Zone */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="rounded-2xl border border-red-200 bg-red-500/5 p-5 dark:border-red-900/50 dark:bg-red-950/5"
            >
                <div className="flex items-center gap-2 mb-2.5">
                    <ShieldAlert className="h-4.5 w-4.5 text-red-500 shrink-0" />
                    <h3 className="text-sm font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">
                        Danger Zone
                    </h3>
                </div>
                
                <p className="mb-4 text-xs text-red-600/90 dark:text-red-400/80 leading-relaxed max-w-xl">
                    Deleting your account permanently removes your questions, answers, votes, and AI request history. This action is immediate, irreversible, and cannot be undone.
                </p>

                <AlertDialog>
                    <AlertDialogTrigger className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-transparent bg-red-600 hover:bg-red-700 text-white text-xs font-bold gap-1.5 px-4 cursor-pointer">
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete My Account
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-slate-900 dark:text-white font-extrabold">Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-500 dark:text-slate-400 text-sm">
                                This will permanently delete your account and remove all related data from our servers: questions asked, code answers created, votes submitted, and AI requests history.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
                                onClick={() => deleteMutation.mutate()}
                            >
                                Yes, delete my account
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </motion.div>
        </div>
    );
}

export default AccountSettingsTab;