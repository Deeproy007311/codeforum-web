import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getSingleQuestion } from "@/api/questions";
import { upvoteQuestion, downvoteQuestion } from "@/api/votes";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/authStore";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Clock, Edit2, Trash2 } from "lucide-react";
import VoteButtons from "./VoteButtons";
import AnswerCard from "./AnswerCard";
import AnswerForm from "./AnswerForm";
import { deleteQuestion } from "@/api/questions";
import { Button } from "@/components/ui/button";
import AIAnswerSection from "./AIAnswerSection";
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

const detailContainerVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.16, 1, 0.3, 1]
        } as any
    }
};

const QuestionDetailSkeleton = () => (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        {/* Back Link Skeleton */}
        <Skeleton className="h-5 w-36 rounded-md" />

        {/* Question Card Skeleton */}
        <div className="rounded-xl border border-slate-100 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900/40 space-y-4">
            <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-8 w-2/3 rounded-md" />
            </div>

            <div className="flex gap-2">
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
            </div>

            <div className="flex gap-4 pt-2">
                {/* Vote buttons placeholder */}
                <div className="flex flex-col items-center gap-2 px-1">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-4 w-5 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                </div>

                {/* Body placeholder */}
                <div className="flex-1 space-y-3.5">
                    <Skeleton className="h-4 w-full rounded-md" />
                    <Skeleton className="h-4 w-full rounded-md" />
                    <Skeleton className="h-4 w-11/12 rounded-md" />
                    <Skeleton className="h-4 w-4/5 rounded-md" />

                    <div className="flex justify-between items-center pt-5">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <Skeleton className="h-3 w-16 rounded-md" />
                        </div>
                        <Skeleton className="h-3.5 w-24 rounded-md" />
                    </div>
                </div>
            </div>
        </div>

        {/* Answers Header Skeleton */}
        <div className="space-y-4 pt-4">
            <Skeleton className="h-6 w-28 rounded-md" />

            {/* Answer Skeletons */}
            {[1, 2].map((i) => (
                <div key={i} className="rounded-xl border border-slate-100 bg-white p-5 dark:border-slate-800/80 dark:bg-slate-900/40">
                    <div className="flex gap-4">
                        <div className="flex flex-col items-center gap-2 px-1">
                            <Skeleton className="h-8 w-8 rounded-lg" />
                            <Skeleton className="h-4 w-5 rounded-md" />
                            <Skeleton className="h-8 w-8 rounded-lg" />
                        </div>
                        <div className="flex-1 space-y-3">
                            <Skeleton className="h-4 w-full rounded-md" />
                            <Skeleton className="h-4 w-5/6 rounded-md" />

                            <div className="flex items-center gap-2 pt-3">
                                <Skeleton className="h-5 w-5 rounded-full" />
                                <Skeleton className="h-3 w-16 rounded-md" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

function QuestionDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["question", id],
        queryFn: () => getSingleQuestion(id as string),
        enabled: !!id,
    });

    const voteMutation = useMutation({
        mutationFn: (type: "up" | "down") =>
            type === "up" ? upvoteQuestion(id as string) : downvoteQuestion(id as string),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["question", id] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to vote");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: () => deleteQuestion(id as string),
        onSuccess: () => {
            toast.success("Question deleted");
            queryClient.invalidateQueries({ queryKey: ["questions"] });
            navigate("/questions");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to delete question");
        },
    });

    if (isLoading) {
        return <QuestionDetailSkeleton />;
    }

    if (isError || !data) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-8">
                <div className="rounded-xl border border-red-200 bg-red-50/50 p-6 text-center text-red-600 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
                    <p className="font-semibold">Question not found, or you don't have access to view it.</p>
                </div>
                <button
                    onClick={() => navigate("/questions")}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to all questions
                </button>
            </div>
        );
    }

    const { question, answers } = data;
    const isQuestionOwner = user?._id === question.author?._id;

    return (
        <motion.div
            variants={detailContainerVariants}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-4xl px-4 py-8"
        >
            <Link
                to="/questions"
                className="group mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
            >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to all questions
            </Link>

            {/* Question Card */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/40 transition-all duration-200">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                    {question.isSolved && (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/15 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center gap-1 text-[11px] font-semibold py-0.5 px-2">
                            <CheckCircle2 className="h-3 w-3 animate-pulse" />
                            Solved
                        </Badge>
                    )}
                    <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 leading-snug sm:text-2xl tracking-tight">
                        {question.title}
                    </h1>
                </div>

                <div className="mb-5 flex flex-wrap gap-1.5 border-b border-slate-100 pb-5 dark:border-slate-800/40">
                    {question.tags.map((tag) => (
                        <Badge
                            key={tag}
                            variant="secondary"
                            className="bg-indigo-50/50 hover:bg-indigo-100/75 border border-indigo-100/60 text-indigo-600 hover:text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/50 dark:hover:bg-indigo-950/30 text-[11px] font-semibold py-0.5 px-2.5 rounded-md transition-all duration-150 cursor-default"
                        >
                            #{tag}
                        </Badge>
                    ))}
                </div>

                {isQuestionOwner && (
                    <div className="mb-5 flex gap-2 border-b border-slate-50 pb-4 dark:border-slate-800/30">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/questions/${question._id}/edit`)}
                            className="h-8.5 border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 flex items-center gap-1.5 font-medium"
                        >
                            <Edit2 className="h-3.5 w-3.5" />
                            Edit Question
                        </Button>

                        <AlertDialog>
                            <AlertDialogTrigger className="inline-flex h-8.5 items-center justify-center rounded-md border border-red-200/60 bg-transparent px-3 text-xs font-semibold text-red-600 shadow-none transition-colors hover:bg-red-50 hover:text-red-700 hover:border-red-300 dark:border-red-950/50 dark:text-red-400 dark:hover:bg-red-950/20 flex items-center gap-1.5 cursor-pointer">
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete Question
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-2xl">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-slate-900 dark:text-slate-100">Delete this question?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
                                        This will permanently delete the question and all its answers.
                                        This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-red-600 hover:bg-red-700 text-white rounded-lg"
                                        onClick={() => deleteMutation.mutate()}
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                )}

                <div className="flex gap-4">
                    <VoteButtons
                        upvotes={question.upvotes}
                        downvotes={question.downvotes}
                        myVote={question.myVote}
                        onUpvote={() => voteMutation.mutate("up")}
                        onDownvote={() => voteMutation.mutate("down")}
                        disabled={isQuestionOwner}
                        isUpvoting={voteMutation.isPending && voteMutation.variables === "up"}
                        isDownvoting={voteMutation.isPending && voteMutation.variables === "down"}
                    />

                    <div className="flex-1 min-w-0">
                        <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-200 text-[15px] leading-relaxed font-normal">
                            {question.description}
                        </p>

                        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800/40 flex-wrap gap-3">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8 ring-2 ring-slate-100 dark:ring-slate-800">
                                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-xs shadow-xs">
                                        {question.author?.username?.[0]?.toUpperCase() ?? "?"}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    {question.author?.username ?? "unknown"}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-medium">
                                <Clock className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" />
                                <span>asked {timeAgo(question.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Answers Section */}
            <div className="mt-8">
                <h2 className="mb-4 text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <span>{answers.length} {answers.length === 1 ? "Answer" : "Answers"}</span>
                </h2>

                {answers.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-800">
                        <p className="text-sm text-slate-400 dark:text-slate-500">
                            No answers yet. Be the first to assist by writing an answer below.
                        </p>
                    </div>
                )}

                <div className="space-y-4">
                    {answers.map((answer) => (
                        <AnswerCard
                            key={answer._id}
                            answer={answer}
                            questionId={question._id}
                            isQuestionOwner={isQuestionOwner}
                        />
                    ))}
                </div>
            </div>

            <AIAnswerSection question={question} />
            <AnswerForm questionId={question._id} />
        </motion.div>
    );
}

export default QuestionDetailPage;