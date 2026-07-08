import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { loginUser } from "@/api/auth";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Code2, ArrowRight, Mail, Lock, Loader2 } from "lucide-react";

function LoginPage() {
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const mutation = useMutation({
        mutationFn: loginUser,
        onSuccess: (data) => {
            setAuth(data.user, data.accessToken);
            toast.success("Logged in successfully");
            navigate("/");
        },
        onError: (error: any) => {
            const message =
                error?.response?.data?.message || "Something went wrong. Try again.";
            toast.error(message);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate({ email, password });
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 px-4 py-12 overflow-hidden">
            {/* Soft background glow effects */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute top-1/4 left-1/4 h-[350px] w-[350px] rounded-full bg-indigo-500/5 blur-[80px]" />
                <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-violet-500/5 blur-[80px]" />
            </div>

            {/* Subtle grid pattern */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage:
                        "linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)",
                    backgroundSize: "30px 30px",
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-md"
            >
                {/* Brand Logo & Title */}
                <div className="mb-8 text-center">
                    <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group justify-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-md shadow-indigo-500/10 transition-transform group-hover:scale-105">
                            <Code2 className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 bg-clip-text text-transparent">
                            CodeForum
                        </span>
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
                    <p className="mt-1.5 text-sm text-slate-500">
                        Log in to access your coding Q&A community.
                    </p>
                </div>

                {/* Form Card */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-8 shadow-xl shadow-slate-100/50 backdrop-blur-xl">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-700 font-semibold text-sm">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    className="pl-10 h-11 border-slate-200/80 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500/50 focus:ring-indigo-500/10 transition-colors"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-700 font-semibold text-sm">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10 h-11 border-slate-200/80 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500/50 focus:ring-indigo-500/10 transition-colors"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 font-bold text-white shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70 disabled:pointer-events-none"
                            disabled={mutation.isPending}
                        >
                            {mutation.isPending ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Logging in...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-1.5">
                                    Log In
                                    <ArrowRight className="h-4 w-4" />
                                </span>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-500">
                        Don't have an account?{" "}
                        <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700 underline underline-offset-4 decoration-indigo-600/30 hover:decoration-indigo-700 transition-colors">
                            Register
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default LoginPage;