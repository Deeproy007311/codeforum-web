import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createAnswer } from "@/api/answers";
import { Loader2, Send, PenTool } from "lucide-react";

function AnswerForm({ questionId }: { questionId: string }) {
    const [content, setContent] = useState("");
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: () => createAnswer(questionId, content),
        onSuccess: () => {
            toast.success("Answer posted successfully");
            setContent("");
            queryClient.invalidateQueries({ queryKey: ["question", questionId] });
        },
        onError: (error: any) => {
            toast.error(
                error?.response?.data?.message || "Failed to post answer"
            );
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (content.trim().length < 5) {
            toast.error("Answer must be at least 5 characters");
            return;
        }
        mutation.mutate();
    };

    return (
        <form onSubmit={handleSubmit} className="mt-8 border-t border-slate-100 dark:border-slate-800/80 pt-6">
            <h3 className="mb-4 text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <PenTool className="h-4.5 w-4.5 text-indigo-500" />
                Your Answer
            </h3>
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your constructive answer here... Use details to explain your solution."
                rows={6}
                className="w-full rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-100 dark:placeholder:text-slate-600 transition-all shadow-xs"
                required
                disabled={mutation.isPending}
            />
            <Button
                type="submit"
                className="mt-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] h-10.5 px-5 rounded-xl flex items-center gap-2"
                disabled={mutation.isPending}
            >
                {mutation.isPending ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                        <span>Posting Answer...</span>
                    </>
                ) : (
                    <>
                        <Send className="h-4 w-4" />
                        <span>Post Answer</span>
                    </>
                )}
            </Button>
        </form>
    );
}

export default AnswerForm;