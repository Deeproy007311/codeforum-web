import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAllQuestions } from "@/api/questions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/authStore";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { motion } from "framer-motion";
import { 
    PlusCircle, 
    Clock, 
    CheckCircle2, 
    HelpCircle
} from "lucide-react";
import TagsSidebar from "./TagsSidebar";
import SearchBar from "./SearchBar";

function timeAgo(dateString: string) {
    const date = new Date(dateString);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    const intervals: [number, string][] = [
        [31536000, "y"],
        [2592000, "mo"],
        [86400, "d"],
        [3600, "h"],
        [60, "m"],
    ];

    for (const [secs, label] of intervals) {
        const count = Math.floor(seconds / secs);
        if (count >= 1) return `${count}${label} ago`;
    }
    return "just now";
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 260,
            damping: 20
        } as any
    }
};

const QuestionCardSkeleton = () => (
    <div className="rounded-xl border border-slate-100 bg-white p-5 dark:border-slate-800/80 dark:bg-slate-900/40">
        <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-6 w-3/4 rounded-md" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full rounded-md" />
                    <Skeleton className="h-4 w-5/6 rounded-md" />
                </div>
                <div className="flex gap-2 pt-2">
                    <Skeleton className="h-5 w-14 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-12 rounded-full" />
                </div>
            </div>
            <div className="flex shrink-0 flex-col items-end justify-between h-24">
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-4 w-20 rounded-md" />
                <div className="flex items-center gap-1.5">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-3 w-16 rounded-md" />
                </div>
            </div>
        </div>
    </div>
);

function QuestionsListPage() {
    const navigate = useNavigate();
    const isLoggedIn = useAuthStore((state) => !!state.token);
    const { requireAuth } = useRequireAuth();
    const [search, setSearch] = useState("");

    const { data, isLoading, isError } = useQuery({
        queryKey: ["questions"],
        queryFn: () => getAllQuestions(),
    });

    const handleAskQuestion = () => {
        requireAuth(() => navigate("/ask"));
    };

    const filteredQuestions = data?.questions.filter((q) =>
        q.title.toLowerCase().includes(search.toLowerCase()) ||
        q.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-8 md:grid-cols-[1fr_300px]">
            <div>
                {/* Header Section */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6 dark:border-slate-800/80">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl bg-gradient-to-r from-slate-955 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                            All Questions
                        </h1>
                        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                            {data ? `Explore ${data.count} community discussions and bugs.` : "Loading questions..."}
                        </p>
                    </div>
                    <Button 
                        onClick={handleAskQuestion}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] h-10 px-4 rounded-xl flex items-center gap-1.5"
                    >
                        <PlusCircle className="h-4.5 w-4.5" />
                        Ask Question
                    </Button>
                </div>

                {/* Search Bar Wrapper */}
                <div className="mb-6">
                    <SearchBar onSearch={setSearch} />
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <QuestionCardSkeleton key={i} />
                        ))}
                    </div>
                )}

                {/* Error State */}
                {isError && (
                    <div className="rounded-xl border border-red-200 bg-red-50/50 p-6 text-center text-red-600 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
                        <p className="font-semibold">Failed to load questions</p>
                        <p className="mt-1 text-sm text-red-500/80">Please check your connection and try again later.</p>
                    </div>
                )}

                {/* Empty State */}
                {data && filteredQuestions?.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center dark:border-slate-800">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-900 dark:text-slate-600">
                            <HelpCircle className="h-6 w-6" />
                        </div>
                        <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">
                            {search ? "No matching questions" : "No questions yet"}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {search ? "Try adjusting your search terms or filters." : "Be the first to start a discussion in our community."}
                        </p>
                        {!search && (
                            <Button className="mt-5 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleAskQuestion}>
                                Ask the first question
                            </Button>
                        )}
                    </div>
                )}

                {/* Questions List */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4"
                >
                    {filteredQuestions?.map((question) => {
                        const score = question.upvotes - question.downvotes;
                        return (
                            <motion.div 
                                key={question._id} 
                                variants={itemVariants}
                                whileHover={{ y: -2 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Link
                                    to={isLoggedIn ? `/questions/${question._id}` : "#"}
                                    onClick={(e) => {
                                        if (!isLoggedIn) {
                                            e.preventDefault();
                                            requireAuth(() => { });
                                        }
                                    }}
                                    className="block rounded-xl border border-slate-100 bg-white p-5 shadow-xs transition-all duration-300 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 dark:border-slate-800/80 dark:bg-slate-900/40 dark:hover:border-indigo-500/30"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="mb-2.5 flex flex-wrap items-center gap-2">
                                                {question.isSolved && (
                                                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/15 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center gap-1 text-[11px] font-semibold py-0.5 px-2">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Solved
                                                    </Badge>
                                                )}
                                                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-snug hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1">
                                                    {question.title}
                                                </h2>
                                            </div>
                                            <p className="mb-4 line-clamp-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                                {question.description}
                                            </p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {question.tags.map((tag) => (
                                                    <Badge
                                                        key={tag}
                                                        variant="secondary"
                                                        className="bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800 text-[11px] font-medium py-0 px-2.5"
                                                    >
                                                        #{tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 flex-col items-end gap-2.5">
                                            {/* Score pill */}
                                            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                score > 0 
                                                    ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' 
                                                    : score < 0 
                                                        ? 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'
                                                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                            }`}>
                                                {score > 0 ? '+' : ''}{score} votes
                                            </div>

                                            <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 font-medium">
                                                <Clock className="h-3.5 w-3.5" />
                                                <span>{timeAgo(question.createdAt)}</span>
                                            </div>

                                            {/* Author */}
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6 ring-2 ring-slate-100 dark:ring-slate-800">
                                                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-500 text-white font-bold text-[10px]">
                                                        {question.author?.username?.[0]?.toUpperCase() ?? "?"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate max-w-[80px]">
                                                    {question.author?.username ?? "unknown"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>

            <div className="hidden md:block">
                <TagsSidebar questions={data?.questions ?? []} />
            </div>
        </div>
    );
}

export default QuestionsListPage;