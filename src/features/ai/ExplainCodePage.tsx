import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { motion, AnimatePresence } from "framer-motion";
import {
    Code2,
    Loader2,
    Sparkles,
    Wand2,
    Copy,
    Check,
    Trash2,
    FileCode,
    Info,
    ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { explainCode, getAIUsage } from "@/api/ai";

const PRESETS = [
    {
        name: "Async Fetch",
        language: "javascript",
        filename: "fetchData.js",
        code: `async function fetchUserData(userId) {
  try {
    const response = await fetch(\`https://api.codeforum.com/users/\${userId}\`);
    if (!response.ok) throw new Error("User data request failed");
    const data = await response.json();
    return { success: true, user: data.profile };
  } catch (err) {
    console.error("Fetch error:", err.message);
    return { success: false, error: err.message };
  }
}`
    },
    {
        name: "Quick Sort",
        language: "typescript",
        filename: "sort.ts",
        code: `function quickSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;
  const pivot = arr[arr.length - 1];
  const left: number[] = [];
  const right: number[] = [];
  
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] < pivot) left.push(arr[i]);
    else right.push(arr[i]);
  }
  
  return [...quickSort(left), pivot, ...quickSort(right)];
}`
    },
    {
        name: "React Custom Hook",
        language: "typescript",
        filename: "useLocalStorage.ts",
        code: `import { useState } from "react";

function useLocalStorage<T>(key: string, initialValue: T): [T, (val: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}`
    }
];

const LANGUAGES = [
    { id: "javascript", name: "JavaScript", filename: "script.js" },
    { id: "typescript", name: "TypeScript", filename: "App.tsx" },
    { id: "python", name: "Python", filename: "main.py" },
    { id: "html", name: "HTML", filename: "index.html" },
    { id: "css", name: "CSS", filename: "styles.css" },
    { id: "cpp", name: "C++", filename: "main.cpp" },
    { id: "go", name: "Go", filename: "main.go" },
];

function ExplainCodePage() {
    const [code, setCode] = useState("");
    const [language, setLanguage] = useState("javascript");
    const [filename, setFilename] = useState("script.js");
    const [explanation, setExplanation] = useState<string | null>(null);
    const [fromCache, setFromCache] = useState(false);
    const [isCopiedCode, setIsCopiedCode] = useState(false);
    const [isCopiedExpl, setIsCopiedExpl] = useState(false);

    const gutterRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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
            toast.success("Code explanation generated!");
        },
        onError: (error: any) => {
            const status = error?.response?.status;
            const message = error?.response?.data?.message;
            if (status === 429) {
                toast.error(message || "AI request limit reached for this month.");
            } else {
                toast.error(message || "Failed to explain code");
            }
        },
    });

    // Auto-update filename when language changes
    useEffect(() => {
        const matchingLang = LANGUAGES.find((l) => l.id === language);
        if (matchingLang) {
            setFilename(matchingLang.filename);
        }
    }, [language]);

    // Handle scroll synchronization between textarea and line number gutter
    const handleTextareaScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
        if (gutterRef.current) {
            gutterRef.current.scrollTop = e.currentTarget.scrollTop;
        }
    };

    const handleCopyCode = async () => {
        if (!code) return;
        await navigator.clipboard.writeText(code);
        setIsCopiedCode(true);
        toast.success("Code copied to clipboard");
        setTimeout(() => setIsCopiedCode(false), 2000);
    };

    const handleCopyExplanation = async () => {
        if (!explanation) return;
        await navigator.clipboard.writeText(explanation);
        setIsCopiedExpl(true);
        toast.success("Explanation copied to clipboard");
        setTimeout(() => setIsCopiedExpl(false), 2000);
    };

    const handleClearCode = () => {
        setCode("");
        toast.info("Code editor cleared");
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    };

    const handleLoadPreset = (preset: typeof PRESETS[0]) => {
        setCode(preset.code);
        setLanguage(preset.language);
        setFilename(preset.filename);
        toast.success(`Loaded preset: ${preset.name}`);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (code.trim().length < 5) {
            toast.error("Paste at least 5 characters of code first");
            return;
        }
        mutation.mutate();
    };

    // Calculate line numbers
    const lines = code.split("\n");
    const lineNumbers = Array.from({ length: Math.max(lines.length, 1) }, (_, i) => i + 1);

    const limitReached = usage && !usage.canUseAI;

    return (
        <div className="mx-auto max-w-6xl w-full px-4 py-8 md:py-12 flex-1 flex flex-col">
            {/* Elegant Header Block */}
            <div className="relative mb-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/40">
                {/* Background glow decoration */}
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 blur-3xl opacity-10 dark:opacity-20 pointer-events-none" />
                <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-indigo-500 blur-3xl opacity-5 dark:opacity-10 pointer-events-none" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:bg-indigo-500/20 dark:text-indigo-400 font-bold uppercase tracking-wider text-[10px]">
                                AI Code Explainer
                            </Badge>
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                            Explain Code
                        </h1>
                        <p className="max-w-xl text-sm text-slate-500 dark:text-slate-400">
                            Paste any script, method, or complex algorithm. The AI will generate a detailed walkthrough of its logic, dependencies, and code quality recommendations.
                        </p>
                    </div>

                    {/* Usage bar */}
                    {usage && (
                        <div className="w-full md:w-64 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/80">
                            <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                                <span className="text-slate-500 dark:text-slate-400">AI Limit Request Usage</span>
                                <span className="text-slate-800 dark:text-white font-bold">
                                    {usage.used} / {usage.limit}
                                </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 transition-all duration-500"
                                    style={{ width: `${Math.min(100, (usage.used / usage.limit) * 100)}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 flex items-center gap-1">
                                <Info className="h-3 w-3 shrink-0" />
                                Resets end of billing cycle
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Snippets Presets Bar */}
            <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2.5">
                    Demo Snippets (Click to load)
                </span>
                <div className="flex flex-wrap gap-2.5">
                    {PRESETS.map((preset, index) => (
                        <Button
                            key={index}
                            type="button"
                            variant="outline"
                            onClick={() => handleLoadPreset(preset)}
                            className="h-8 rounded-lg text-xs font-semibold border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-500 bg-white dark:bg-slate-900/20 shadow-xs"
                        >
                            <FileCode className="h-3.5 w-3.5 text-indigo-500" />
                            {preset.name}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Code Input & Explanation Output Grid */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                
                {/* Left Panel: Code Input */}
                <form onSubmit={handleSubmit} className="space-y-4 flex flex-col">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            Code Editor
                        </label>
                        {/* Language Selection */}
                        <div className="relative flex items-center gap-1.5">
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Syntax:</span>
                            <div className="relative inline-block">
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="appearance-none h-8 text-xs font-semibold pl-3 pr-8 rounded-lg border border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 focus:outline-none cursor-pointer"
                                >
                                    {LANGUAGES.map((lang) => (
                                        <option key={lang.id} value={lang.id}>
                                            {lang.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-2.5 h-3 w-3 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* IDE Visual Editor Box */}
                    <div className="rounded-xl border border-slate-200 bg-slate-950 shadow-md shadow-slate-100/50 dark:border-slate-800 dark:shadow-none overflow-hidden flex flex-col">
                        {/* IDE Header tabs bar */}
                        <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 select-none">
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1.5 mr-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 text-slate-300 rounded-t-lg border-t-2 border-indigo-500 text-xs font-mono">
                                    <FileCode className="h-3.5 w-3.5 text-indigo-400" />
                                    <span>{filename}</span>
                                </div>
                            </div>

                            {/* Utilities controls */}
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleCopyCode}
                                    disabled={!code}
                                    className="p-1.5 rounded-md text-slate-500 hover:text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                    title="Copy Code"
                                >
                                    {isCopiedCode ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleClearCode}
                                    disabled={!code}
                                    className="p-1.5 rounded-md text-slate-500 hover:text-rose-400 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                    title="Clear Editor"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* Editor Input Workspace */}
                        <div className="flex flex-1 relative font-mono text-xs overflow-hidden h-[400px]">
                            {/* Gutter Line numbers */}
                            <div
                                ref={gutterRef}
                                className="select-none text-right pr-3 pl-4 py-4 text-slate-600 border-r border-slate-800 bg-slate-900/30 min-w-[3.5rem] overflow-y-hidden"
                            >
                                {lineNumbers.map((n) => (
                                    <div key={n} className="leading-6">
                                        {n}
                                    </div>
                                ))}
                            </div>

                            {/* Text Input area */}
                            <textarea
                                ref={textareaRef}
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                onScroll={handleTextareaScroll}
                                placeholder={`// Paste code here, or click a demo preset above\n\nfunction add(a, b) {\n  return a + b;\n}`}
                                className="flex-1 w-full bg-transparent p-4 text-slate-200 placeholder:text-slate-700 focus:outline-none resize-none leading-6 overflow-y-auto whitespace-pre font-mono"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={mutation.isPending || limitReached}
                        className="flex w-full h-11 items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 text-white font-bold shadow-md shadow-indigo-600/10 hover:from-indigo-500 hover:to-violet-500 rounded-xl"
                    >
                        {mutation.isPending ? (
                            <>
                                <Loader2 className="h-4.5 w-4.5 animate-spin" />
                                Explaining Algorithm...
                            </>
                        ) : (
                            <>
                                <Wand2 className="h-4.5 w-4.5" />
                                Explain Code Logic
                            </>
                        )}
                    </Button>
                    {limitReached && (
                        <p className="text-center text-xs text-rose-500 font-semibold flex items-center justify-center gap-1">
                            <Info className="h-3.5 w-3.5 shrink-0" />
                            Monthly AI requests limit reached. Upgrade your plan to increase limits.
                        </p>
                    )}
                </form>

                {/* Right Panel: Explanation Output */}
                <div className="space-y-4 flex flex-col h-full">
                    <label className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        AI Walkthrough & Review
                    </label>

                    {/* Default state: No explanation loaded */}
                    {!explanation && !mutation.isPending && (
                        <div className="flex flex-1 min-h-[460px] items-center justify-center rounded-xl border border-dashed border-slate-200/80 dark:border-slate-800/80 bg-white/30 dark:bg-slate-900/10 text-center p-8">
                            <div className="space-y-3.5 max-w-sm">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/5 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                                    <Sparkles className="h-6 w-6 animate-pulse" />
                                </div>
                                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                    Waiting for Input
                                </h4>
                                <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                                    Paste some syntax in the code editor and submit. The AI will output line explanation blocks, complexity warnings, and quick refactoring samples.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Loading State: Custom glowing skeleton */}
                    {mutation.isPending && (
                        <div className="flex-1 min-h-[460px] rounded-xl border border-slate-200/80 bg-white/50 dark:border-slate-800/80 dark:bg-slate-900/10 p-6 flex flex-col justify-between space-y-6">
                            <div className="space-y-4 flex-1">
                                <div className="flex items-center gap-2">
                                    <div className="h-5 w-24 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                                    <div className="h-5 w-16 rounded bg-slate-100 dark:bg-slate-900 animate-pulse" />
                                </div>
                                <div className="h-6 w-2/3 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                                <div className="space-y-2 pt-2">
                                    <div className="h-4 w-full rounded bg-slate-100 dark:bg-slate-900/80 animate-pulse" />
                                    <div className="h-4 w-5/6 rounded bg-slate-100 dark:bg-slate-900/80 animate-pulse" />
                                    <div className="h-4 w-4/5 rounded bg-slate-100 dark:bg-slate-900/80 animate-pulse" />
                                </div>
                                <div className="h-28 w-full rounded-lg bg-slate-900/20 border border-slate-200/20 animate-pulse flex items-center justify-center">
                                    <Code2 className="h-8 w-8 text-indigo-500/20 animate-pulse" />
                                </div>
                            </div>
                            <div className="flex items-center justify-center text-xs text-slate-400 gap-1.5 select-none">
                                <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                                Processing code token nodes...
                            </div>
                        </div>
                    )}

                    {/* Output Content */}
                    <AnimatePresence>
                        {explanation && !mutation.isPending && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-col flex-1 rounded-xl border border-indigo-200/80 bg-gradient-to-b from-indigo-50/20 via-white to-white shadow-sm dark:border-indigo-950/60 dark:from-indigo-950/10 dark:via-slate-950 dark:to-slate-950 overflow-hidden max-h-[500px]"
                            >
                                {/* Output Header */}
                                <div className="flex items-center justify-between px-4 py-3 bg-indigo-500/5 dark:bg-indigo-950/20 border-b border-indigo-100/50 dark:border-indigo-950/50">
                                    <div className="flex items-center gap-2">
                                        <Badge className="flex items-center gap-1 border-indigo-200 bg-indigo-100 text-[10px] font-bold text-indigo-700 uppercase tracking-wide hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300 shrink-0">
                                            <Sparkles className="h-3 w-3" />
                                            AI Summary
                                        </Badge>
                                        {fromCache && (
                                            <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-900/60 dark:text-slate-400 dark:border-slate-800 uppercase font-semibold">
                                                Cached
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Action button */}
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleCopyExplanation}
                                        className="h-7 px-2.5 rounded-lg text-xs gap-1 hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400 text-slate-500"
                                    >
                                        {isCopiedExpl ? (
                                            <>
                                                <Check className="h-3.5 w-3.5 text-emerald-500" />
                                                Copied
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-3.5 w-3.5" />
                                                Copy Markdown
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {/* Generated markdown text */}
                                <div className="flex-1 overflow-y-auto px-5 py-4 font-sans text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-h-[440px]">
                                    <div className="ai-markdown text-[14px]">
                                        <ReactMarkdown
                                            components={{
                                                h1: (props) => <h1 className="mb-2 mt-4 text-base font-bold text-slate-900 dark:text-white" {...props} />,
                                                h2: (props) => <h2 className="mb-2 mt-4 text-sm font-extrabold text-slate-800 dark:text-slate-200" {...props} />,
                                                h3: (props) => <h3 className="mb-1.5 mt-3 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide" {...props} />,
                                                p: (props) => <p className="mb-3.5" {...props} />,
                                                ul: (props) => <ul className="mb-4 list-disc space-y-1.5 pl-5 text-slate-600 dark:text-slate-400" {...props} />,
                                                ol: (props) => <ol className="mb-4 list-decimal space-y-1.5 pl-5 text-slate-600 dark:text-slate-400" {...props} />,
                                                strong: (props) => <strong className="font-bold text-slate-900 dark:text-white" {...props} />,
                                                code({ className, children, ...props }: any) {
                                                    const match = /language-(\w+)/.exec(className || "");
                                                    const isInline = !match;
                                                    if (isInline) {
                                                        return (
                                                            <code className="rounded bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 font-mono text-[12px] text-indigo-700 dark:text-indigo-400 font-semibold border border-slate-200/30 dark:border-slate-800/40" {...props}>
                                                                {children}
                                                            </code>
                                                        );
                                                    }
                                                    return (
                                                        <SyntaxHighlighter
                                                            style={oneDark as any}
                                                            language={match[1]}
                                                            PreTag="div"
                                                            customStyle={{ borderRadius: "0.75rem", fontSize: "12px", margin: "1rem 0" }}
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