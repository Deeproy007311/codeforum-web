import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, Loader2, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { explainCode } from "@/api/ai";
import { getAIUsage } from "@/api/ai";

function ExplainCodePage() {
    const [code, setCode] = useState("");
    const [explanation, setExplanation] = useState<string | null>(null);
    const [fromCache, setFromCache] = useState(false);

    const { data: usage, refetch: refetchUsage } = useQuery({
        queryKey: ["ai-usage"],
        queryFn: getAIUsage,
    });

    const mutation = useMutation({
        mutationFn: () => explainCode(code),
        onSuccess: (data) => {
            setExplanation(data.explanation);
            setFromCache(data.fromCache);
            refetchUsage();
        },
        onError: (error: any) => {
            const status = error?.response?.status;
            const message = error?.response?.data?.message;
            if (status === 429) {
                toast.error(message || "AI limit reached. Please wait or try again later.");
            } else {
                toast.error(message || "Failed to explain code");
            }
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (code.trim().length < 5) {
            toast.error("Paste some code first");
            return;
        }
        mutation.mutate();
    };

    const limitReached = usage && !usage.canUseAI;

    return (
        <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
            {/* Header */}
            <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-50/50 via-purple-50/30 to-transparent p-6 md:p-8 dark:from-indigo-950/20 dark:via-purple-950/10">
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
                <div className="relative">
                    <div className="mb-2 flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400">
                            <Code2 className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            AI Tool
                        </span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                        Explain Code
                    </h1>
                    <p className="mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400">
                        Paste any code snippet and get a clear, professional breakdown of
                        what it does, how it works, and where it could be improved.
                    </p>
                    {usage && (
                        <p className="mt-3 text-xs font-medium text-slate-400 dark:text-slate-500">
                            {usage.used}/{usage.limit} AI requests used this month
                        </p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Input */}
                <form onSubmit={handleSubmit} className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Paste your code
                    </label>
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder={`function add(a, b) {\n  return a + b;\n}`}
                        rows={16}
                        className="w-full rounded-xl border border-slate-200 bg-white p-4 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500/50 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-100 dark:placeholder:text-slate-600"
                    />
                    <Button
                        type="submit"
                        disabled={mutation.isPending || limitReached}
                        className="flex w-full items-center justify-center gap-2 bg-indigo-600 text-white shadow-md shadow-indigo-500/10 hover:bg-indigo-700"
                    >
                        {mutation.isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Explaining...
                            </>
                        ) : (
                            <>
                                <Wand2 className="h-4 w-4" />
                                Explain This Code
                            </>
                        )}
                    </Button>
                    {limitReached && (
                        <p className="text-center text-xs text-rose-500">
                            You've used all {usage?.limit} AI requests for this month.
                        </p>
                    )}
                </form>

                {/* Output */}
                <div>
                    <label className="mb-3 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Explanation
                    </label>

                    {!explanation && !mutation.isPending && (
                        <div className="flex h-[420px] items-center justify-center rounded-xl border border-dashed border-slate-200 text-center dark:border-slate-800">
                            <p className="px-6 text-sm text-slate-400 dark:text-slate-500">
                                Your code explanation will appear here.
                            </p>
                        </div>
                    )}

                    {mutation.isPending && (
                        <div className="flex h-[420px] items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800">
                            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                        </div>
                    )}

                    <AnimatePresence>
                        {explanation && !mutation.isPending && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="relative max-h-[500px] overflow-y-auto rounded-xl border border-indigo-200/60 bg-gradient-to-b from-indigo-50/40 to-white p-5 dark:border-indigo-900/40 dark:from-indigo-950/20 dark:to-slate-900/40"
                            >
                                <div className="mb-3 flex flex-wrap items-center gap-2">
                                    <Badge className="flex items-center gap-1 border-indigo-200 bg-indigo-100 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300">
                                        <Sparkles className="h-3 w-3" />
                                        AI Generated
                                    </Badge>
                                    {fromCache && (
                                        <Badge variant="secondary" className="text-[11px] font-normal text-slate-500">
                                            cached response
                                        </Badge>
                                    )}
                                </div>

                                <div className="ai-markdown text-[15px] leading-relaxed text-slate-700 dark:text-slate-200">
                                    <ReactMarkdown
                                        components={{
                                            h1: (props) => <h1 className="mb-2 mt-4 text-lg font-bold text-slate-800 dark:text-slate-100" {...props} />,
                                            h2: (props) => <h2 className="mb-2 mt-4 text-base font-bold text-slate-800 dark:text-slate-100" {...props} />,
                                            h3: (props) => <h3 className="mb-1.5 mt-3 text-sm font-bold text-slate-800 dark:text-slate-100" {...props} />,
                                            p: (props) => <p className="mb-3" {...props} />,
                                            ul: (props) => <ul className="mb-3 list-disc space-y-1 pl-5" {...props} />,
                                            ol: (props) => <ol className="mb-3 list-decimal space-y-1 pl-5" {...props} />,
                                            strong: (props) => <strong className="font-semibold text-slate-800 dark:text-slate-100" {...props} />,
                                            code({ className, children, ...props }: any) {
                                                const match = /language-(\w+)/.exec(className || "");
                                                const isInline = !match;
                                                if (isInline) {
                                                    return (
                                                        <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[13px] text-indigo-700 dark:bg-slate-800 dark:text-indigo-300" {...props}>
                                                            {children}
                                                        </code>
                                                    );
                                                }
                                                return (
                                                    <SyntaxHighlighter
                                                        style={oneDark as any}
                                                        language={match[1]}
                                                        PreTag="div"
                                                        customStyle={{ borderRadius: "0.5rem", fontSize: "13px", margin: "0.75rem 0" }}
                                                    >
                                                        {String(children).replace(/\n$/, "")}
                                                    </SyntaxHighlighter>
                                                );
                                            },
                                        }}
                                    >
                                        {explanation}
                                    </ReactMarkdown>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

export default ExplainCodePage;