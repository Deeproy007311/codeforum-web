import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAllQuestions } from "@/api/questions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";
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
    Sparkles,
    Terminal,
    Brain,
    Cpu,
    Lightbulb,
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
        bgColor: "bg-violet-50/50 text-violet-600 border-violet-100 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-900/50",
    },
    {
        icon: ArrowUp,
        title: "Community Voting",
        description:
            "The best answers rise to the top through upvotes from real developers.",
        bgColor: "bg-cyan-50/50 text-cyan-600 border-cyan-100 dark:bg-cyan-950/20 dark:text-cyan-400 dark:border-cyan-900/50",
    },
    {
        icon: CheckCircle2,
        title: "Solved & Tracked",
        description:
            "Mark questions solved so others can find working answers instantly.",
        bgColor: "bg-emerald-50/50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50",
    },
];

const aiShowcaseTabs = [
    {
        id: "answers",
        title: "AI Answers",
        badge: "Beta",
        tagline: "Instant Expert Solutions",
        description: "Get complete, context-aware coding solutions generated instantly when questions are posted. Our models supply code snippets, explain dependencies, and help you skip search-engine cycles.",
        icon: Sparkles,
    },
    {
        id: "explain",
        title: "AI Code Explain",
        badge: "Coming Soon",
        tagline: "Understand Complex Logic",
        description: "Struggling with advanced or poorly documented code? Highlight syntax, APIs, or loops, and get a clear line-by-line breakdown of exactly what is happening under the hood.",
        icon: Terminal,
    },
    {
        id: "ask",
        title: "Smart Ask Assist",
        badge: "Beta",
        tagline: "Write Structured Questions",
        description: "Our assistant analyzes drafts in real-time. It suggests titles optimized for search indexers, formats code blocks appropriately, and auto-assigns matching developer tags.",
        icon: Brain,
    }
];

function LandingPage() {
    const navigate = useNavigate();
    const isLoggedIn = useAuthStore((state) => !!state.token);
    const [activeTab, setActiveTab] = useState<string>("answers");

    const { data, isLoading } = useQuery({
        queryKey: ["questions"],
        queryFn: () => getAllQuestions(),
    });

    const recentQuestions = data?.questions.slice(0, 4) ?? [];

    return (
        <div className="bg-slate-50/50 min-h-screen">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-b from-indigo-50/80 via-white to-slate-50/50 border-b border-slate-100/85 py-20 sm:py-28">
                {/* Decorative glow elements */}
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute top-0 left-1/4 h-[450px] w-[450px] rounded-full bg-indigo-500/5 blur-[120px]" />
                    <div className="absolute right-1/4 bottom-0 h-[350px] w-[350px] rounded-full bg-violet-500/5 blur-[90px]" />
                </div>

                {/* Micro Grid Background */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.01]"
                    style={{
                        backgroundImage:
                            "linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)",
                        backgroundSize: "32px 32px",
                    }}
                />

                <div className="relative mx-auto max-w-5xl px-4 text-center">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/50 px-4 py-1.5 text-xs font-semibold text-indigo-700 backdrop-blur-xs hover:bg-indigo-50 transition-colors"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
                        </span>
                        Next-Gen AI Developer Forum
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
                        <span className="bg-gradient-to-r from-indigo-650 via-violet-650 to-cyan-600 bg-clip-text text-transparent">
                            Ship faster.
                        </span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        custom={1}
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        className="mx-auto mt-6 max-w-2xl text-lg text-slate-655 leading-relaxed font-normal"
                    >
                        A coding Q&A community loaded with **autonomous AI code answers**,
                        deep explanation structures, and developer peer reviews to keep you flowing.
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
                                className="h-12 px-7 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-white shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Browse Q&A Forum
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <>
                                <Button
                                    size="lg"
                                    onClick={() => navigate("/register")}
                                    className="h-12 px-7 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-white shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
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
                            <span className="text-2xl font-extrabold text-slate-900">{value}</span>
                            <span className="text-xs font-semibold text-slate-400 mt-0.5">{label}</span>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Interactive AI Feature Showcase */}
            <div className="border-b border-slate-100/80 bg-slate-50/20 py-20">
                <div className="mx-auto max-w-5xl px-4">
                    <div className="mb-14 text-center max-w-xl mx-auto">
                        <Badge className="bg-indigo-500/10 hover:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-semibold mb-3 border border-indigo-200/50">
                            Feature Highlights
                        </Badge>
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                            AI-Powered Developer Utilities
                        </h2>
                        <p className="text-slate-500 text-sm mt-2">
                            Explore the custom AI systems built directly into the forum to solve, explain, and write software faster.
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-5 items-start">
                        {/* Selector Tabs (left) */}
                        <div className="md:col-span-2 space-y-3.5">
                            {aiShowcaseTabs.map((tab) => {
                                const Icon = tab.icon;
                                const isSelected = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full text-left p-4.5 rounded-2xl border transition-all flex items-start gap-4 focus:outline-hidden cursor-pointer ${isSelected
                                            ? "bg-white border-indigo-200 shadow-md shadow-indigo-100/40 translate-x-1"
                                            : "bg-transparent border-slate-100 hover:bg-slate-50/80 hover:border-slate-200"
                                            }`}
                                    >
                                        <div className={`mt-0.5 p-2.5 rounded-xl border ${isSelected
                                            ? "bg-indigo-600 text-white border-indigo-700"
                                            : "bg-slate-100 text-slate-500 border-slate-200"
                                            }`}>
                                            <Icon className="h-4.5 w-4.5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-bold text-[15px] text-slate-900">
                                                    {tab.title}
                                                </span>
                                                <span className={`text-[9px] font-bold py-0.5 px-1.5 rounded-full uppercase tracking-wider ${tab.badge === "Coming Soon"
                                                    ? "bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900"
                                                    : "bg-indigo-50 text-indigo-600 border border-indigo-100"
                                                    }`}>
                                                    {tab.badge}
                                                </span>
                                            </div>
                                            <p className="text-[11px] font-bold text-indigo-500/90 mt-0.5">{tab.tagline}</p>
                                            <p className="text-xs text-slate-500 leading-relaxed mt-1.5 line-clamp-2">
                                                {tab.description}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Interactive IDE / Panel Showcase (right) */}
                        <div className="md:col-span-3 h-[320px] rounded-2xl border border-slate-200 bg-slate-900 shadow-xl overflow-hidden relative flex flex-col">
                            {/* Window Header */}
                            <div className="h-10 border-b border-slate-800 bg-slate-950/80 px-4 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-1.5">
                                    <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                                    <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                                    <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                                </div>
                                <span className="text-[11px] font-mono text-slate-500">
                                    {activeTab === "answers" && "ai_answer_assistant.py"}
                                    {activeTab === "explain" && "use_debounce.tsx"}
                                    {activeTab === "ask" && "smart_draft_assist.json"}
                                </span>
                                <div className="h-4.5 w-12 rounded bg-slate-800 shrink-0" />
                            </div>

                            {/* Panel Body */}
                            <div className="flex-1 overflow-y-auto p-5 font-mono text-xs text-slate-300 relative">
                                <AnimatePresence mode="wait">
                                    {activeTab === "answers" && (
                                        <motion.div
                                            key="answers"
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            transition={{ duration: 0.2 }}
                                            className="space-y-4"
                                        >
                                            <div className="bg-slate-800/80 border border-slate-800 rounded-xl p-3">
                                                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">User Question</div>
                                                <span className="text-slate-200 font-bold font-sans">
                                                    "How do I setup MongoDB client pooling in Express?"
                                                </span>
                                            </div>

                                            <div className="bg-indigo-600/10 border border-indigo-500/25 rounded-xl p-3.5 space-y-2.5 relative overflow-hidden">
                                                <div className="absolute right-3 top-3 flex items-center gap-1 bg-indigo-500/20 text-indigo-455 border border-indigo-500/30 text-[9px] font-bold py-0.5 px-2 rounded-full">
                                                    <Sparkles className="h-3 w-3 animate-pulse" />
                                                    AI Verified Answer
                                                </div>
                                                <div className="text-[10px] text-indigo-400 uppercase tracking-wider font-bold">AI Auto-Reply</div>
                                                <pre className="text-[11px] text-slate-200 leading-relaxed overflow-x-auto">
                                                    {`const client = new MongoClient(uri, {
  maxPoolSize: 50,
  minPoolSize: 10
});`}
                                                </pre>
                                                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                                                    The driver pool is initialized automatically. maxPoolSize prevents socket leakage under heavy concurrent traffic.
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === "explain" && (
                                        <motion.div
                                            key="explain"
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            transition={{ duration: 0.2 }}
                                            className="grid grid-cols-5 gap-3 h-full"
                                        >
                                            {/* Code Editor */}
                                            <div className="col-span-3 bg-slate-950 p-3 rounded-lg border border-slate-800 text-[10px] space-y-1 overflow-x-auto">
                                                <div className="text-slate-600">// Custom Debounce hook</div>
                                                <div><span className="text-indigo-400">useEffect</span>(() =&gt; &#123;</div>
                                                <div className="bg-indigo-500/10 border-l border-indigo-505 pl-1"><span className="text-slate-400">  const</span> handler = setTimeout(() =&gt; &#123;</div>
                                                <div className="bg-indigo-500/10 border-l border-indigo-505 pl-1">    setDebounced(val);</div>
                                                <div className="bg-indigo-500/10 border-l border-indigo-505 pl-1">  &#125;, delay);</div>
                                                <div>  <span className="text-violet-400">return</span> () =&gt; clearTimeout(handler);</div>
                                                <div>&#125;, [val, delay]);</div>
                                            </div>

                                            {/* Explanations panel */}
                                            <div className="col-span-2 bg-slate-800/60 p-3 rounded-lg border border-slate-800 flex flex-col justify-center space-y-2">
                                                <div className="flex items-center gap-1.5 text-indigo-400 text-[10px] font-bold">
                                                    <Cpu className="h-3 w-3" />
                                                    LINE EXPLAINER
                                                </div>
                                                <div className="space-y-1.5">
                                                    <p className="text-[10px] font-bold text-slate-200">Timeout Scheduling</p>
                                                    <p className="text-[10px] text-slate-400 leading-normal font-sans">
                                                        Updates the component state ONLY after the user stops typing for the <code className="text-indigo-300 font-mono">delay</code> duration.
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === "ask" && (
                                        <motion.div
                                            key="ask"
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            transition={{ duration: 0.2 }}
                                            className="space-y-3.5"
                                        >
                                            <div className="bg-slate-800/80 border border-slate-800 rounded-xl p-3.5">
                                                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">User Draft Input</div>
                                                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                                                    "getting cross origin error when querying my backend server using fetch in react"
                                                </p>
                                            </div>

                                            <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-3.5 space-y-3">
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                                                    <Lightbulb className="h-3.5 w-3.5 text-indigo-400" />
                                                    AI SUGGESTIONS
                                                </div>
                                                <div className="space-y-1 text-slate-350 font-sans">
                                                    <div className="text-[11px] font-bold text-slate-200">Optimized Title:</div>
                                                    <div className="text-[11px] bg-slate-950 p-2 rounded-md border border-slate-800 text-indigo-300 font-mono mt-1">
                                                        "How to resolve CORS errors in React fetch requests to custom APIs?"
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-400 border border-slate-700">#react</span>
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-400 border border-slate-700">#cors</span>
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-400 border border-slate-700">#fetch</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Questions Preview */}
            <div className="mx-auto max-w-5xl px-4 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-8 flex items-end justify-between"
                >
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                            Recently Asked
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Fresh questions from the community waiting for your expertise
                        </p>
                    </div>
                    <Link to="/questions">
                        <Button variant="ghost" className="group text-indigo-600 hover:text-indigo-700 font-semibold gap-1 cursor-pointer">
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
                                className="group flex h-full flex-col justify-between rounded-2xl border border-slate-200/75 bg-white p-6 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md hover:shadow-slate-100/50"
                            >
                                <div>
                                    <div className="mb-2.5 flex items-start gap-2">
                                        {q.isSolved && (
                                            <Badge className="shrink-0 bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-50 text-[10px] font-bold">
                                                Solved
                                            </Badge>
                                        )}
                                        <h3 className="line-clamp-1 font-bold text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight text-[15px]">
                                            {q.title}
                                        </h3>
                                    </div>
                                    <p className="mb-4 line-clamp-2 text-sm text-slate-500 leading-relaxed font-normal">
                                        {q.description}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6 border border-slate-100">
                                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-500 text-[10px] text-white font-bold">
                                                {q.author?.username?.[0]?.toUpperCase() ?? "?"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs font-bold text-slate-700">
                                            {q.author?.username ?? "unknown"}
                                        </span>
                                    </div>
                                    <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
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
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                            Why Developers Build on CodeForum
                        </h2>
                        <p className="text-slate-500 mt-2 text-sm">
                            Advanced utility suites paired with community reviews to get answers instantly.
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
                                <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border ${bgColor} shadow-xs`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <h3 className="mb-2 font-bold text-slate-900 text-lg tracking-tight">{title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed font-normal">
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