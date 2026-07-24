import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { upvoteAnswer, downvoteAnswer } from "@/api/votes";
import { acceptAnswer, editAnswer } from "@/api/answers";
import { useAuthStore } from "@/store/authStore";
import VoteButtons from "./VoteButtons";
import type { Answer } from "@/types/question";
import { motion } from "framer-motion";
import { CheckCircle2, Edit2, Loader2, Check } from "lucide-react";

interface AnswerCardProps {
    answer: Answer;
    questionId: string;
    isQuestionOwner: boolean;
}

function AnswerCard({ answer, questionId, isQuestionOwner }: AnswerCardProps) {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(answer.content);

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
            toast.error(error?.response?.data?.message || "Failed to accept answer");
        },
    });

    const editMutation = useMutation({
        mutationFn: () => editAnswer(answer._id, editContent),
        onSuccess: () => {
            toast.success("Answer updated");
            setIsEditing(false);
            queryClient.invalidateQueries({ queryKey: ["question", questionId] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to update answer");
        },
    });

    const isOwnAnswer = user?._id === answer.author?._id;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`relative overflow-hidden rounded-xl border p-5 transition-all duration-200 hover:shadow-sm ${answer.isAccepted
                    ? "border-emerald-500/30 bg-emerald-50/20 dark:border-emerald-500/20 dark:bg-emerald-950/10"
                    : "border-slate-100 bg-white dark:border-slate-800/80 dark:bg-slate-900/40 hover:border-slate-200 dark:hover:border-slate-700"
                }`}
        >
            {answer.isAccepted && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-l-xl" />
            )}

            <div className="flex gap-4">
                <VoteButtons
                    upvotes={answer.upvotes}
                    downvotes={answer.downvotes}
                    myVote={answer.myVote}
                    onUpvote={() => voteMutation.mutate("up")}
                    onDownvote={() => voteMutation.mutate("down")}
                    disabled={isOwnAnswer}
                    isUpvoting={voteMutation.isPending && voteMutation.variables === "up"}
                    isDownvoting={voteMutation.isPending && voteMutation.variables === "down"}
                />

                <div className="flex-1 min-w-0">
                    {answer.isAccepted && (
                        <Badge className="mb-3 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center gap-1 w-fit text-[11px] font-semibold py-0.5 px-2">
                            <CheckCircle2 className="h-3 w-3" />
                            Accepted Answer
                        </Badge>
                    )}

                    {isEditing ? (
                        <div className="space-y-3">
                            <Textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                rows={5}
                                className="w-full rounded-lg border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900/60"
                            />
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    onClick={() => editMutation.mutate()}
                                    disabled={editMutation.isPending}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-xs"
                                >
                                    {editMutation.isPending ? (
                                        <>
                                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Save"
                                    )}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditContent(answer.content);
                                    }}
                                    className="border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-200 text-[15px] leading-relaxed font-normal">
                            {answer.content}
                        </p>
                    )}

                    <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4 dark:border-slate-800/40 flex-wrap gap-3">
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

                        <div className="flex gap-2">
                            {isOwnAnswer && !isEditing && (
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setIsEditing(true)}
                                    className="h-8 border-slate-200 hover:bg-slate-50 text-slate-600 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 flex items-center gap-1.5"
                                >
                                    <Edit2 className="h-3 w-3" />
                                    Edit
                                </Button>
                            )}
                            {isQuestionOwner && !answer.isAccepted && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => acceptMutation.mutate()}
                                    disabled={acceptMutation.isPending}
                                    className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200/60 dark:text-emerald-400 dark:hover:bg-emerald-950/20 dark:border-emerald-800/80 flex items-center gap-1.5"
                                >
                                    {acceptMutation.isPending ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                        <Check className="h-3 w-3" />
                                    )}
                                    Mark as Accepted
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default AnswerCard;