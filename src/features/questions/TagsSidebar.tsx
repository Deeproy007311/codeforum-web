import { Badge } from "@/components/ui/badge";
import type { Question } from "@/types/question";
import { MessageSquare, Sparkles, ArrowUp, CheckCircle2 } from "lucide-react";

function TagsSidebar({ questions }: { questions: Question[] }) {
    const tagCounts = new Map<string, number>();

    questions.forEach((q) => {
        q.tags.forEach((tag) => {
            tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
        });
    });

    const topTags = [...tagCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    return (
        <div className="rounded-xl border border-slate-100 bg-white p-5 dark:border-slate-800/80 dark:bg-slate-900/40 shadow-xs">
            <h3 className="mb-4 text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                Popular Tags
            </h3>
            {topTags.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500">
                    Tags will appear here once questions are asked.
                </p>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {topTags.map(([tag, count]) => (
                        <Badge
                            key={tag}
                            variant="secondary"
                            className="bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-100/50 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800/80 text-[11px] font-medium py-0.5 pl-2 pr-1.5 flex items-center gap-1.5 cursor-pointer rounded-full"
                        >
                            #{tag}
                            <span className="flex items-center justify-center h-4 w-4 rounded-full bg-slate-200/50 dark:bg-slate-700/80 text-[9px] font-bold text-slate-500 dark:text-slate-400">
                                {count}
                            </span>
                        </Badge>
                    ))}
                </div>
            )}

            <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800/80">
                <h3 className="mb-4 text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                    How CodeForum works
                </h3>
                <div className="space-y-3.5">
                    <div className="flex gap-2.5 items-start text-xs text-slate-600 dark:text-slate-300 leading-normal">
                        <div className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 mt-0.5">
                            <MessageSquare className="h-3.5 w-3.5" />
                        </div>
                        <span>Ask a coding question, get detailed community answers</span>
                    </div>

                    <div className="flex gap-2.5 items-start text-xs text-slate-600 dark:text-slate-300 leading-normal">
                        <div className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400 mt-0.5">
                            <Sparkles className="h-3.5 w-3.5" />
                        </div>
                        <span>Get instant AI-assisted responses to unblock your build</span>
                    </div>

                    <div className="flex gap-2.5 items-start text-xs text-slate-600 dark:text-slate-300 leading-normal">
                        <div className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400 mt-0.5">
                            <ArrowUp className="h-3.5 w-3.5" />
                        </div>
                        <span>Vote on topics to surface the best solutions to the top</span>
                    </div>

                    <div className="flex gap-2.5 items-start text-xs text-slate-600 dark:text-slate-300 leading-normal">
                        <div className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 mt-0.5">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                        </div>
                        <span>Mark verified answers as solved to guide future visitors</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TagsSidebar;