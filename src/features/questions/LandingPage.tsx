import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAllQuestions } from "@/api/questions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/authStore";
import { motion } from "framer-motion";
import {
    Bot,
    ArrowUp,
    CheckCircle2,
    ArrowRight,
    Users,
    Zap,
    Code2,
    CheckCheck,
    Clock,
} from "lucide-react";

function timeAgo(dateString: string) {
    const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    const intervals: [number, string][] = [
        [31536000, "y"], [2592000, "mo"], [86400, "d"], [3600, "h"], [60, "m"],
    ];
    for (const [secs, label] of intervals) {
        const count = Math.floor(seconds / secs);
        if (count >= 1) return `${count}${label} ago`;
    }
    return "just now";
}

const fadeUp = {
    hidden: { opacity: 0, y: 25 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] as any },
    }),
};

const stagger = {
    visible: { transition: { staggerChildren: 0.08 } },
};

const stats = [
    { label: "Active Developers", value: "12K+", icon: Users },
    { label: "Questions Solved", value: "48K+", icon: CheckCheck },
    { label: "AI Explanations", value: "130K+", icon: Bot },
    { label: "Response Time", value: "< 2h", icon: Zap },
];

const features = [
    {
        icon: Bot,
        title: "AI-Assisted Answers",
        description:
            "Get instant AI-generated answers and code explanations alongside real community input.",
        bgColor: "bg-violet-50 text-violet-600 border-violet-100",
    },
    {
        icon: ArrowUp,
        title: "Community Voting",
        description:
            "The best answers rise to the top through upvotes from real developers.",
        bgColor: "bg-cyan-50 text-cyan-600 border-cyan-100",
    },
    {
        icon: CheckCircle2,
        title: "Solved & Tracked",
        description:
            "Mark questions solved so others can find working answers instantly.",
        bgColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
];

function LandingPage() {
    const navigate = useNavigate();
    const isLoggedIn = useAuthStore((state) => !!state.token);

    const { data, isLoading } = useQuery({
        queryKey: ["questions"],
        queryFn: () => getAllQuestions(),
    });

    const recentQuestions = data?.questions.slice(0, 4) ?? [];

    return (
        <div className="bg-slate-50/50">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-b from-indigo-50/70 via-white to-slate-50/50 border-b border-slate-100 py-20 sm:py-28">
                {/* Decorative glow elements */}
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute top-0 left-1/4 h-[400px] w-[400px] rounded-full bg-indigo-500/5 blur-[100px]" />
                    <div className="absolute right-1/4 bottom-0 h-[300px] w-[300px] rounded-full bg-violet-500/5 blur-[80px]" />
                </div>

                {/* Micro Grid Background */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage:
                            "linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)",
                        backgroundSize: "40px 40px",
                    }}
                />

                <div className="relative mx-auto max-w-5xl px-4 text-center">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/50 px-4 py-1.5 text-xs font-semibold text-indigo-700 backdrop-blur-sm"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
                        </span>
                        AI-powered developer forum
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        custom={0}
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl md:text-7xl"
                    >
                        Ask. Answer.{" "}
                        <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 bg-clip-text text-transparent">
                            Ship faster.
                        </span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        custom={1}
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        className="mx-auto mt-6 max-w-xl text-lg text-slate-600 leading-relaxed"
                    >
                        A coding Q&A community with AI-assisted answers, code
                        explanations, and peer reviews to help you get unstuck instantly.
                    </motion.p>

                    {/* Action buttons */}
                    <motion.div
                        custom={2}
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        className="mt-8 flex justify-center gap-3.5"
                    >
                        {isLoggedIn ? (
                            <Button
                                size="lg"
                                onClick={() => navigate("/questions")}
                                className="h-12 px-7 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 font-bold text-white shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Browse Questions
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <>
                                <Button
                                    size="lg"
                                    onClick={() => navigate("/register")}
                                    className="h-12 px-7 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 font-bold text-white shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Get Started Free
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={() => navigate("/login")}
                                    className="h-12 px-7 rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Log In
                                </Button>
                            </>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="border-b border-slate-100 bg-white py-8">
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                    className="mx-auto grid max-w-5xl grid-cols-2 gap-4 px-4 sm:grid-cols-4"
                >
                    {stats.map(({ label, value, icon: Icon }) => (
                        <motion.div
                            key={label}
                            variants={fadeUp}
                            className="flex flex-col items-center p-3 text-center"
                        >
                            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                <Icon className="h-5 w-5" />
                            </div>
                            <span className="text-xl font-extrabold text-slate-900">{value}</span>
                            <span className="text-xs font-semibold text-slate-400 mt-0.5">{label}</span>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Recent Questions Preview */}
            <div className="mx-auto max-w-5xl px-4 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-8 flex items-end justify-between"
                >
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-900">
                            Recently Asked
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Fresh questions from the community waiting for your expertise
                        </p>
                    </div>
                    <Link to="/questions">
                        <Button variant="ghost" className="group text-indigo-600 hover:text-indigo-700 font-semibold gap-1">
                            View all
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </Button>
                    </Link>
                </motion.div>

                {isLoading && (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-36 w-full rounded-2xl bg-white border border-slate-200" />
                        ))}
                    </div>
                )}

                {!isLoading && recentQuestions.length === 0 && (
                    <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center text-slate-500">
                        No questions yet — be the first to ask one.
                    </div>
                )}

                <motion.div
                    variants={stagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid gap-4 sm:grid-cols-2"
                >
                    {recentQuestions.map((q) => (
                        <motion.div key={q._id} variants={fadeUp}>
                            <Link
                                to={isLoggedIn ? `/questions/${q._id}` : "/login"}
                                className="group flex h-full flex-col justify-between rounded-2xl border border-slate-200/75 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md hover:shadow-slate-100/50"
                            >
                                <div>
                                    <div className="mb-2.5 flex items-start gap-2">
                                        {q.isSolved && (
                                            <Badge className="shrink-0 bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-50">
                                                Solved
                                            </Badge>
                                        )}
                                        <h3 className="line-clamp-1 font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                            {q.title}
                                        </h3>
                                    </div>
                                    <p className="mb-4 line-clamp-2 text-sm text-slate-500 leading-relaxed">
                                        {q.description}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6 border border-slate-100">
                                            <AvatarFallback className="bg-indigo-50 text-[10px] text-indigo-600 font-bold">
                                                {q.author?.username?.[0]?.toUpperCase() ?? "?"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs font-semibold text-slate-600">
                                            {q.author?.username ?? "unknown"}
                                        </span>
                                    </div>
                                    <span className="flex items-center gap-1 text-xs text-slate-400">
                                        <Clock className="h-3.5 w-3.5" />
                                        {timeAgo(q.createdAt)}
                                    </span>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Features Section */}
            <div className="border-t border-slate-100 bg-white py-20">
                <div className="mx-auto max-w-5xl px-4">
                    <div className="mb-14 text-center">
                        <h2 className="text-3xl font-extrabold text-slate-900">
                            Why developers use CodeForum
                        </h2>
                        <p className="text-slate-500 mt-2">
                            Advanced tools and community power to solve your coding bugs
                        </p>
                    </div>
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-60px" }}
                        className="grid gap-8 sm:grid-cols-3"
                    >
                        {features.map(({ icon: Icon, title, description, bgColor }) => (
                            <motion.div
                                key={title}
                                variants={fadeUp}
                                className="flex flex-col items-center text-center p-4"
                            >
                                <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border ${bgColor} shadow-sm`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <h3 className="mb-2 font-bold text-slate-900 text-lg">{title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    {description}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-slate-100 bg-slate-50/50 py-10">
                <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600">
                            <Code2 className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-extrabold text-slate-900 text-sm">CodeForum</span>
                    </div>
                    <div className="text-center text-xs font-semibold text-slate-400">
                        © {new Date().getFullYear()} CodeForum. Built with React, Node.js, and MongoDB.
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;