import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAIHistory } from "@/api/ai";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Wand2, Code2, Zap, CornerDownRight } from "lucide-react";
import { motion } from "framer-motion";

const featureConfig = {
    answer: { 
        label: "AI Answer", 
        icon: Zap, 
        color: "text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/50",
        description: "Generated instant code solutions and explanations"
    },
    "improve-question": { 
        label: "Improve Question", 
        icon: Wand2, 
        color: "text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/50",
        description: "Enhanced titles, details, and formatting suggestions"
    },
    "explain-code": { 
        label: "Explain Code", 
        icon: Code2, 
        color: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50",
        description: "Requested line-by-line syntax & logic analysis"
    },
};

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

const listVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
} as const;

function AIHistoryTab() {
    const [page, setPage] = useState(1);

    const { data, isLoading } = useQuery({
        queryKey: ["ai-history", page],
        queryFn: () => getAIHistory(page, 15),
    });

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex gap-4 rounded-xl border border-slate-100 bg-white p-4 dark:border-slate-800/80 dark:bg-slate-900/20">
                        <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-1/3 rounded" />
                            <Skeleton className="h-4 w-3/4 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!data || data.history.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center dark:border-slate-800/80">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-900/60">
                    <Sparkles className="h-6 w-6 text-slate-400 dark:text-slate-600" />
                </div>
                <h4 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-1">
                    No AI activity yet
                </h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
                    Try generating an AI answer to a question or asking the code explainer for helper feedback.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header info */}
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Latest AI Queries
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                    Showing {data.history.length} of {data.pagination.total} entries
                </span>
            </div>

            {/* List */}
            <motion.div 
                variants={listVariants}
                initial="hidden"
                animate="show"
                className="space-y-3"
            >
                {data.history.map((entry) => {
                    const config = featureConfig[entry.feature] || featureConfig["answer"];
                    const Icon = config.icon;
                    return (
                        <motion.div
                            key={entry._id}
                            variants={itemVariants}
                            whileHover={{ y: -1, scale: 1.005 }}
                            className="flex items-start gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-xs hover:border-slate-200 hover:shadow-md hover:shadow-slate-100/50 dark:border-slate-800/80 dark:bg-slate-900/20 dark:hover:border-slate-800 dark:hover:bg-slate-900/40 dark:hover:shadow-none transition-all duration-200"
                        >
                            {/* Feature icon box */}
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${config.color} shadow-xs`}>
                                <Icon className="h-5 w-5" />
                            </div>

                            {/* Center description */}
                            <div className="min-w-0 flex-1">
                                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        {config.label}
                                    </span>
                                    {entry.fromCache && (
                                        <Badge variant="outline" className="bg-emerald-500/5 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 text-[10px] px-1.5 font-bold uppercase tracking-wide h-4.5">
                                            Cached
                                        </Badge>
                                    )}
                                    <span className="ml-auto text-[11px] font-medium text-slate-400 dark:text-slate-500">
                                        {timeAgo(entry.createdAt)}
                                    </span>
                                </div>

                                {/* Preview block */}
                                <div className="rounded-lg bg-slate-50/80 p-2.5 dark:bg-slate-950/60 border border-slate-100/50 dark:border-slate-900/40 flex items-start gap-2">
                                    <CornerDownRight className="h-3.5 w-3.5 mt-0.5 text-slate-400 shrink-0" />
                                    <p className="font-mono text-xs text-slate-600 dark:text-slate-300 break-all line-clamp-2">
                                        {entry.inputPreview}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Pagination */}
            {data.pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => {
                            setPage((p) => p - 1);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="h-8 rounded-lg text-xs font-semibold px-3"
                    >
                        Previous
                    </Button>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                        Page {data.pagination.page} of {data.pagination.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= data.pagination.totalPages}
                        onClick={() => {
                            setPage((p) => p + 1);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="h-8 rounded-lg text-xs font-semibold px-3"
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}

export default AIHistoryTab;