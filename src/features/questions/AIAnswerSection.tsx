import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { generateAIAnswer, getAIUsage } from "@/api/ai";
import type { Question } from "@/types/question";

interface AIAnswerSectionProps {
    question: Question;
}

function AIAnswerSection({ question }: AIAnswerSectionProps) {
    const [aiAnswer, setAiAnswer] = useState<string | null>(null);
    const [fromCache, setFromCache] = useState(false);

    const { data: usage, refetch: refetchUsage } = useQuery({
        queryKey: ["ai-usage"],
        queryFn: getAIUsage,
    });

    const mutation = useMutation({
        mutationFn: () =>
            generateAIAnswer({
                title: question.title,
                description: question.description,
                tags: question.tags,
            }),
        onSuccess: (data) => {
            setAiAnswer(data.answer);
            setFromCache(data.fromCache);
            refetchUsage();
        },
        onError: (error: any) => {
            const status = error?.response?.status;
            const message = error?.response?.data?.message;

            if (status === 429) {
                toast.error(
                    message || "AI limit reached. Please wait or try again later."
                );
            } else {
                toast.error(message || "Failed to generate AI answer");
            }
        },
    });

    const limitReached = usage && !usage.canUseAI;

    return (
        <div className="mt-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100">
                    <Sparkles className="h-4.5 w-4.5 text-indigo-500" />
                    AI Assistant
                </h2>

                {usage && (
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                        {usage.used}/{usage.limit} AI requests used this month
                    </span>
                )}
            </div>

            {!aiAnswer && (
                <div className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/30 p-6 text-center dark:border-indigo-900/40 dark:bg-indigo-950/10">
                    <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
                        {limitReached
                            ? `You've used all ${usage?.limit} AI requests for this month.`
                            : "Get an instant AI-generated answer to this question."}
                    </p>
                    <Button
                        onClick={() => mutation.mutate()}
                        disabled={mutation.isPending || limitReached}
                        className="bg-indigo-600 text-white shadow-md shadow-indigo-500/10 hover:bg-indigo-700 hover:shadow-indigo-500/20"
                    >
                        {mutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Zap className="mr-2 h-4 w-4" />
                                Generate AI Answer
                            </>
                        )}
                    </Button>
                </div>
            )}

            <AnimatePresence>
                {aiAnswer && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="relative overflow-hidden rounded-xl border border-indigo-200/60 bg-gradient-to-b from-indigo-50/40 to-white p-5 dark:border-indigo-900/40 dark:from-indigo-950/20 dark:to-slate-900/40"
                    >
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500" />

                        <div className="mb-3 flex flex-wrap items-center gap-2">
                            <Badge className="flex items-center gap-1 border-indigo-200 bg-indigo-100 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300">
                                <Sparkles className="h-3 w-3" />
                                AI Generated
                            </Badge>
                            {fromCache && (
                                <Badge
                                    variant="secondary"
                                    className="text-[11px] font-normal text-slate-500"
                                >
                                    cached response
                                </Badge>
                            )}
                            <span className="text-[11px] text-slate-400">
                                via Groq · llama-3.3-70b
                            </span>
                        </div>

                        <div className="ai-markdown text-[15px] leading-relaxed text-slate-700 dark:text-slate-200">
                            <ReactMarkdown
                                components={{
                                    h1: (props) => (
                                        <h1 className="mb-2 mt-4 text-lg font-bold text-slate-800 dark:text-slate-100" {...props} />
                                    ),
                                    h2: (props) => (
                                        <h2 className="mb-2 mt-4 text-base font-bold text-slate-800 dark:text-slate-100" {...props} />
                                    ),
                                    h3: (props) => (
                                        <h3 className="mb-1.5 mt-3 text-sm font-bold text-slate-800 dark:text-slate-100" {...props} />
                                    ),
                                    p: (props) => <p className="mb-3" {...props} />,
                                    ul: (props) => <ul className="mb-3 list-disc space-y-1 pl-5" {...props} />,
                                    ol: (props) => <ol className="mb-3 list-decimal space-y-1 pl-5" {...props} />,
                                    li: (props) => <li {...props} />,
                                    strong: (props) => (
                                        <strong className="font-semibold text-slate-800 dark:text-slate-100" {...props} />
                                    ),
                                    code({ className, children, ...props }: any) {
                                        const match = /language-(\w+)/.exec(className || "");
                                        const isInline = !match;
                                        if (isInline) {
                                            return (
                                                <code
                                                    className="rounded bg-slate-100 px-1.5 py-0.5 text-[13px] text-indigo-700 dark:bg-slate-800 dark:text-indigo-300"
                                                    {...props}
                                                >
                                                    {children}
                                                </code>
                                            );
                                        }
                                        return (
                                            <SyntaxHighlighter
                                                style={oneDark as any}
                                                language={match[1]}
                                                PreTag="div"
                                                customStyle={{
                                                    borderRadius: "0.5rem",
                                                    fontSize: "13px",
                                                    margin: "0.75rem 0",
                                                }}
                                            >
                                                {String(children).replace(/\n$/, "")}
                                            </SyntaxHighlighter>
                                        );
                                    },
                                }}
                            >
                                {aiAnswer}
                            </ReactMarkdown>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-3 border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950/30"
                            onClick={() => mutation.mutate()}
                            disabled={mutation.isPending || (usage && !usage.canUseAI)}
                        >
                            {mutation.isPending ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                "Regenerate"
                            )}
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default AIAnswerSection;