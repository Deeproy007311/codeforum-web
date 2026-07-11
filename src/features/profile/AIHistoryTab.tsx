import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAIHistory } from "@/api/ai";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Wand2, Code2, Zap } from "lucide-react";

const featureConfig = {
    answer: { label: "AI Answer", icon: Zap, color: "text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/50" },
    "improve-question": { label: "Improve Question", icon: Wand2, color: "text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/50" },
    "explain-code": { label: "Explain Code", icon: Code2, color: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50" },
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

function AIHistoryTab() {
    const [page, setPage] = useState(1);

    const { data, isLoading } = useQuery({
        queryKey: ["ai-history", page],
        queryFn: () => getAIHistory(page, 20),
    });

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
            </div>
        );
    }

    if (!data || data.history.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center dark:border-slate-800">
                <Sparkles className="mx-auto mb-2 h-6 w-6 text-slate-300 dark:text-slate-700" />
                <p className="text-sm text-slate-400 dark:text-slate-500">
                    No AI activity yet. Try generating an AI answer or explaining some code.
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="space-y-2.5">
                {data.history.map((entry) => {
                    const config = featureConfig[entry.feature];
                    const Icon = config.icon;
                    return (
                        <div
                            key={entry._id}
                            className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-4 dark:border-slate-800/80 dark:bg-slate-900/40"
                        >
                            <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${config.color}`}>
                                <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="mb-1 flex flex-wrap items-center gap-2">
                                    <Badge variant="secondary" className="text-[11px] font-medium">
                                        {config.label}
                                    </Badge>
                                    {entry.fromCache && (
                                        <span className="text-[11px] text-slate-400">cached</span>
                                    )}
                                    <span className="ml-auto text-[11px] text-slate-400">
                                        {timeAgo(entry.createdAt)}
                                    </span>
                                </div>
                                <p className="truncate text-sm text-slate-600 dark:text-slate-300">
                                    {entry.inputPreview}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {data.pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                    >
                        Previous
                    </Button>
                    <span className="text-xs text-slate-400">
                        Page {data.pagination.page} of {data.pagination.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= data.pagination.totalPages}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}

export default AIHistoryTab;