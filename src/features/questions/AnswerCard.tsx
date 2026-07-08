import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { upvoteAnswer, downvoteAnswer } from "@/api/votes";
import { acceptAnswer } from "@/api/answers";
import { useAuthStore } from "@/store/authStore";
import VoteButtons from "./VoteButtons";
import type { Answer } from "@/types/question";
import { Check, Clock, Loader2 } from "lucide-react";

interface AnswerCardProps {
    answer: Answer;
    questionId: string;
    isQuestionOwner: boolean;
}

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

function AnswerCard({ answer, questionId, isQuestionOwner }: AnswerCardProps) {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user);

    const voteMutation = useMutation({
        mutationFn: (type: "up" | "down") =>
            type === "up" ? upvoteAnswer(answer._id) : downvoteAnswer(answer._id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["question", questionId] });
        },
        onError: () => {
            toast.error("Failed to vote. Try again.");
        },
    });

    const acceptMutation = useMutation({
        mutationFn: () => acceptAnswer(answer._id),
        onSuccess: () => {
            toast.success("Answer marked as accepted");
            queryClient.invalidateQueries({ queryKey: ["question", questionId] });
        },
        onError: (error: any) => {
            toast.error(
                error?.response?.data?.message || "Failed to accept answer"
            );
        },
    });

    const isOwnAnswer = user?._id === answer.author?._id;

    return (
        <div
            className={`rounded-xl border p-5 shadow-xs transition-all duration-300 ${answer.isAccepted
                    ? "border-emerald-500/30 bg-emerald-500/[0.03] dark:border-emerald-500/25 dark:bg-emerald-950/10"
                    : "border-slate-100 bg-white dark:border-slate-800/80 dark:bg-slate-900/40"
                }`}
        >
            <div className="flex gap-4">
                <VoteButtons
                    upvotes={answer.upvotes}
                    downvotes={answer.downvotes}
                    myVote={answer.myVote}
                    onUpvote={() => voteMutation.mutate("up")}
                    onDownvote={() => voteMutation.mutate("down")}
                    disabled={isOwnAnswer}
                    isPending={voteMutation.isPending}
                />

                <div className="flex-1 min-w-0">
                    {answer.isAccepted && (
                        <Badge className="mb-3 bg-emerald-500/10 text-emerald-600 border-emerald-500/25 hover:bg-emerald-500/15 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center gap-1 text-[11px] font-semibold py-0.5 px-2.5 rounded-full w-fit">
                            <Check className="h-3.5 w-3.5" />
                            Accepted Solution
                        </Badge>
                    )}

                    <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                        {answer.content}
                    </p>

                    <div className="mt-5 flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6 ring-2 ring-slate-100 dark:ring-slate-800">
                                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-500 text-white font-bold text-[10px]">
                                        {answer.author?.username?.[0]?.toUpperCase() ?? "?"}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                    {answer.author?.username ?? "unknown"}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 font-medium">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{timeAgo(answer.createdAt)}</span>
                            </div>
                        </div>

                        {isQuestionOwner && !answer.isAccepted && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => acceptMutation.mutate()}
                                disabled={acceptMutation.isPending}
                                className="h-8 rounded-lg border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-950/20 transition-all text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                            >
                                {acceptMutation.isPending ? (
                                    <>
                                        <Loader2 className="h-3 w-3 animate-spin text-emerald-500" />
                                        <span>Accepting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="h-3.5 w-3.5" />
                                        <span>Accept Answer</span>
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AnswerCard;