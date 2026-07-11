import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
    Sparkles,
    Bold,
    Italic,
    Code,
    Link2,
    Eye,
    BookOpen,
    Send,
    X,
    CheckCircle2,
    Heading,
    List,
    Terminal
} from "lucide-react";
import { createQuestion } from "@/api/questions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { improveQuestion } from "@/api/ai";
import type { ImproveQuestionData } from "@/types/ai";
import { Wand2, Loader2, Lightbulb } from "lucide-react";

function AskQuestionPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [activeField, setActiveField] = useState<'title' | 'description' | 'tags' | null>(null);
    const [activeTab, setActiveTab] = useState<'preview' | 'guide'>('preview');
    const [showImproveModal, setShowImproveModal] = useState(false);
    const [improvedData, setImprovedData] = useState<ImproveQuestionData | null>(null);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const mutation = useMutation({
        mutationFn: createQuestion,
        onSuccess: (question) => {
            toast.success("Question posted successfully!");
            queryClient.invalidateQueries({ queryKey: ["questions"] });
            navigate(`/questions/${question._id}`);
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to post question");
        },
    });

    const improveMutation = useMutation({
        mutationFn: () => improveQuestion({ title, description }),
        onSuccess: (res) => {
            setImprovedData(res.data);
            setShowImproveModal(true);
        },
        onError: (error: any) => {
            const status = error?.response?.status;
            const message = error?.response?.data?.message;
            if (status === 429) {
                toast.error(message || "AI limit reached. Please wait or try again later.");
            } else {
                toast.error(message || "Failed to improve question");
            }
        },
    });

    const applyImprovedVersion = () => {
        if (!improvedData) return;
        if (improvedData.title) setTitle(improvedData.title);
        setDescription(improvedData.description);
        setShowImproveModal(false);
        toast.success("Applied AI suggestions to your draft");
    };

    const addTag = () => {
        const clean = tagInput.trim().toLowerCase();
        if (!clean) return;
        if (tags.includes(clean)) {
            toast.error("Tag already added");
            return;
        }
        if (tags.length >= 5) {
            toast.error("Maximum 5 tags allowed");
            return;
        }
        if (clean.length < 2 || clean.length > 30) {
            toast.error("Tag must be 2-30 characters");
            return;
        }
        setTags([...tags, clean]);
        setTagInput("");
    };

    const removeTag = (tag: string) => {
        setTags(tags.filter((t) => t !== tag));
    };

    const handleTagKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag();
        }
    };

    const insertMarkdown = (syntax: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selected = text.substring(start, end);

        let replacement = "";
        let selectionOffset = 0;

        if (syntax === "bold") {
            replacement = `**${selected || "bold text"}**`;
            selectionOffset = selected ? 0 : 2;
        } else if (syntax === "italic") {
            replacement = `*${selected || "italic text"}*`;
            selectionOffset = selected ? 0 : 1;
        } else if (syntax === "code") {
            replacement = `\`\`\`javascript\n${selected || "// code goes here"}\n\`\`\``;
            selectionOffset = selected ? 0 : 17;
        } else if (syntax === "link") {
            replacement = `[${selected || "link text"}](https://example.com)`;
            selectionOffset = selected ? 0 : 12;
        } else if (syntax === "heading") {
            replacement = `### ${selected || "Heading"}`;
            selectionOffset = selected ? 0 : 0;
        } else if (syntax === "list") {
            replacement = `\n- ${selected || "List item"}`;
            selectionOffset = selected ? 0 : 0;
        }

        const newValue = text.substring(0, start) + replacement + text.substring(end);
        setDescription(newValue);

        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + replacement.length - selectionOffset;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (title.trim().length < 10) {
            toast.error("Title must be at least 10 characters");
            return;
        }
        if (description.trim().length < 20) {
            toast.error("Description must be at least 20 characters");
            return;
        }
        if (tags.length < 1) {
            toast.error("Add at least 1 tag");
            return;
        }

        mutation.mutate({ title, description, tags });
    };

    const titleProgress = Math.min((title.length / 150) * 100, 100);
    const titleSatisfied = title.trim().length >= 10;
    const titleNearLimit = title.length > 120;

    const getProgressBarColor = () => {
        if (title.length === 0) return "bg-slate-200 dark:bg-slate-800";
        if (!titleSatisfied) return "bg-rose-500";
        if (titleNearLimit) return "bg-amber-500 animate-pulse";
        return "bg-indigo-600 dark:bg-indigo-500";
    };

    const descriptionSatisfied = description.trim().length >= 20;

    return (
        <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
            {/* Header Section */}
            <div className="relative mb-10 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-50/50 via-purple-50/30 to-transparent p-6 md:p-8 dark:from-indigo-950/20 dark:via-purple-950/10">
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
                <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />

                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400">
                                <Sparkles className="h-4 w-4" />
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Create a Post</span>
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text">
                            Ask a Question
                        </h1>
                        <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm max-w-xl">
                            Join the community! Ask your question, format code blocks with markdown, and connect with developers who can help.
                        </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-3">
                        <div className="rounded-xl border border-slate-200 bg-white/60 p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 backdrop-blur-md">
                            <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">Form Progress</div>
                            <div className="mt-1 flex items-center gap-2">
                                <div className="flex -space-x-1.5">
                                    <div className={`h-2.5 w-2.5 rounded-full border border-white dark:border-slate-950 ${titleSatisfied ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"}`} />
                                    <div className={`h-2.5 w-2.5 rounded-full border border-white dark:border-slate-950 ${descriptionSatisfied ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"}`} />
                                    <div className={`h-2.5 w-2.5 rounded-full border border-white dark:border-slate-950 ${tags.length > 0 ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"}`} />
                                </div>
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    {((titleSatisfied ? 1 : 0) + (descriptionSatisfied ? 1 : 0) + (tags.length > 0 ? 1 : 0)) === 3
                                        ? "Ready to Post"
                                        : `${((titleSatisfied ? 1 : 0) + (descriptionSatisfied ? 1 : 0) + (tags.length > 0 ? 1 : 0))} of 3 complete`
                                    }
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Form Column */}
                <div className="lg:col-span-7">
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 shadow-xl shadow-slate-100/50 dark:shadow-none backdrop-blur-sm rounded-2xl p-6 md:p-8 space-y-6 relative overflow-hidden">

                        {/* Title Section */}
                        <div className="space-y-2.5">
                            <Label htmlFor="title" className="text-slate-805 dark:text-slate-200 font-semibold text-sm flex items-center justify-between">
                                <span>Question Title</span>
                                {titleSatisfied && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                            </Label>
                            <Input
                                id="title"
                                placeholder="e.g. Why does useEffect run twice in React 18?"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                onFocus={() => setActiveField("title")}
                                onBlur={() => setActiveField(null)}
                                className={`w-full px-4 h-11 rounded-xl transition-all duration-200 bg-slate-50/50 focus:bg-white dark:bg-slate-950/40 dark:focus:bg-slate-950 border-slate-200 focus:border-indigo-500/85 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:focus:border-indigo-500/50 placeholder:text-slate-400 dark:placeholder:text-slate-600 ${title.length > 0 && !titleSatisfied ? "border-rose-300 dark:border-rose-900/50" : ""
                                    }`}
                            />

                            <div className="space-y-1">
                                <div className="h-1 w-full rounded-full bg-slate-100 dark:bg-slate-850 overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${getProgressBarColor()}`}
                                        style={{ width: `${titleProgress}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between text-xs font-medium">
                                    <span className={titleSatisfied ? "text-emerald-500 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}>
                                        {titleSatisfied ? "Minimum length reached" : "Minimum 10 characters required"}
                                    </span>
                                    <span className={titleNearLimit ? "text-amber-500 font-bold" : "text-slate-400 dark:text-slate-500"}>
                                        {title.length}/150
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Description Section */}
                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="description" className="text-slate-805 dark:text-slate-200 font-semibold text-sm flex items-center gap-1.5">
                                    <span>Details & Code description</span>
                                    {descriptionSatisfied && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                                </Label>
                                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Supports Markdown</span>
                            </div>

                            {/* Markdown Toolbar */}
                            <div className="flex flex-wrap items-center gap-1 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 rounded-t-xl px-2 py-1.5 border-b-0">
                                <button
                                    type="button"
                                    onClick={() => insertMarkdown("bold")}
                                    className="p-1.5 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                    title="Bold"
                                >
                                    <Bold className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => insertMarkdown("italic")}
                                    className="p-1.5 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                    title="Italic"
                                >
                                    <Italic className="h-4 w-4" />
                                </button>
                                <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1" />
                                <button
                                    type="button"
                                    onClick={() => insertMarkdown("heading")}
                                    className="p-1.5 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                    title="Heading"
                                >
                                    <Heading className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => insertMarkdown("code")}
                                    className="p-1.5 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                    title="Code Block"
                                >
                                    <Code className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => insertMarkdown("list")}
                                    className="p-1.5 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                    title="List"
                                >
                                    <List className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => insertMarkdown("link")}
                                    className="p-1.5 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                    title="Link"
                                >
                                    <Link2 className="h-4 w-4" />
                                </button>
                            </div>

                            <Textarea
                                ref={textareaRef}
                                id="description"
                                placeholder="Describe your problem in detail. Include what you've tried, error messages, and relevant code. Use the toolbar above or markdown syntax for code blocks."
                                rows={10}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                onFocus={() => setActiveField("description")}
                                onBlur={() => setActiveField(null)}
                                className={`w-full px-4 py-3 rounded-b-xl border-slate-200 focus:border-indigo-500/80 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:focus:border-indigo-500/50 bg-slate-50/50 focus:bg-white dark:bg-slate-950/40 dark:focus:bg-slate-950 placeholder:text-slate-400 dark:placeholder:text-slate-600 min-h-[220px] rounded-t-none border-t-0 shadow-xs focus-visible:ring-0 focus-visible:border-indigo-500/80 focus:outline-none transition-all duration-200 ${description.length > 0 && !descriptionSatisfied ? "border-rose-300 dark:border-rose-900/50" : ""
                                    }`}
                            />

                            <div className="flex items-center justify-between text-xs font-medium">
                                <span className={descriptionSatisfied ? "text-emerald-500 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}>
                                    {descriptionSatisfied ? "Minimum length reached" : "Minimum 20 characters required"}
                                </span>
                                <span className="text-slate-400 dark:text-slate-500">
                                    {description.length} characters
                                </span>
                            </div>
                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => improveMutation.mutate()}
                                    disabled={!descriptionSatisfied || improveMutation.isPending}
                                    className="border-indigo-200 bg-indigo-50/50 text-indigo-600 hover:bg-indigo-100/60 dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:text-indigo-400 dark:hover:bg-indigo-950/50 font-medium gap-1.5"
                                >
                                    {improveMutation.isPending ? (
                                        <>
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            Improving...
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 className="h-3.5 w-3.5" />
                                            Improve with AI
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Tags Section */}
                        <div className="space-y-2.5">
                            <Label htmlFor="tags" className="text-slate-805 dark:text-slate-200 font-semibold text-sm flex items-center justify-between">
                                <span>Categorization Tags</span>
                                {tags.length > 0 && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                            </Label>

                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        id="tags"
                                        placeholder="e.g. react, typescript (press Enter or comma to add)"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={handleTagKeyDown}
                                        onFocus={() => setActiveField("tags")}
                                        onBlur={() => setActiveField(null)}
                                        className="w-full px-4 h-11 rounded-xl transition-all duration-200 bg-slate-50/50 focus:bg-white dark:bg-slate-950/40 dark:focus:bg-slate-950 border-slate-200 focus:border-indigo-500/80 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:focus:border-indigo-500/50 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    onClick={addTag}
                                    className="h-11 px-5 rounded-xl border border-indigo-200 hover:border-indigo-300 dark:border-indigo-900/50 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100/60 dark:hover:bg-indigo-950/50 font-semibold transition-all shadow-xs cursor-pointer"
                                >
                                    Add
                                </Button>
                            </div>

                            <div className="min-h-[30px] pt-1">
                                <div className="flex flex-wrap gap-2">
                                    <AnimatePresence>
                                        {tags.map((tag) => (
                                            <motion.div
                                                key={tag}
                                                initial={{ opacity: 0, scale: 0.85, y: 5 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.85, y: -5 }}
                                                transition={{ duration: 0.15 }}
                                            >
                                                <Badge
                                                    variant="secondary"
                                                    className="group cursor-pointer font-semibold bg-indigo-50/50 hover:bg-indigo-100/85 text-indigo-700 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50 transition-all px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5"
                                                    onClick={() => removeTag(tag)}
                                                    title="Click to remove tag"
                                                >
                                                    <span>#{tag}</span>
                                                    <X className="h-3 w-3 text-indigo-400 dark:text-indigo-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors shrink-0" />
                                                </Badge>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>

                            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                Add between 1 to 5 tags, click a tag or its '✕' to remove it.
                            </p>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <Button
                                type="submit"
                                disabled={mutation.isPending}
                                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 dark:from-indigo-500 dark:to-violet-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-indigo-500/25 dark:shadow-none hover:shadow-indigo-500/35 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                            >
                                {mutation.isPending ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        <span>Publishing Question...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" />
                                        <span>Post Your Question</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Sidebar Column */}
                <div className="lg:col-span-5 space-y-6">

                    {/* Tab Navigation Card */}
                    <div className="bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-md shadow-slate-100/30 dark:shadow-none backdrop-blur-sm">
                        {/* Tabs Header */}
                        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 p-1">
                            <button
                                type="button"
                                onClick={() => setActiveTab("preview")}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${activeTab === "preview"
                                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                                    : "text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-200"
                                    }`}
                            >
                                <Eye className="h-3.5 w-3.5" />
                                Live Preview
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("guide")}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${activeTab === "guide"
                                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                                    : "text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-200"
                                    }`}
                            >
                                <BookOpen className="h-3.5 w-3.5" />
                                Smart Guidelines
                            </button>
                        </div>

                        {/* Tabs Content */}
                        <div className="p-6 min-h-[380px]">

                            {/* Live Draft Preview Content */}
                            {activeTab === "preview" && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-1.5">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                            </span>
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Real-time Draft Preview</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-1">
                                        {/* Title Preview */}
                                        {title.trim() ? (
                                            <h2 className="text-xl font-extrabold text-slate-850 dark:text-slate-100 leading-snug break-words">
                                                {title}
                                            </h2>
                                        ) : (
                                            <h2 className="text-xl font-extrabold text-slate-300 dark:text-slate-700 italic">
                                                Your question title will appear here...
                                            </h2>
                                        )}

                                        {/* Tags Preview */}
                                        {tags.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {tags.map((tag) => (
                                                    <span key={tag} className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300 px-2.5 py-0.5 rounded font-medium">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-xs text-slate-300 dark:text-slate-700 italic">
                                                No tags selected yet.
                                            </div>
                                        )}

                                        <div className="h-[1px] bg-slate-100 dark:bg-slate-850 w-full my-2" />

                                        {/* Description Markdown Preview */}
                                        <div className="prose dark:prose-invert max-w-none text-[14px] leading-relaxed break-words">
                                            {description.trim() ? (
                                                <ReactMarkdown
                                                    components={{
                                                        code({ inline, className, children, ...props }: any) {
                                                            return (
                                                                <code className="bg-slate-100 dark:bg-slate-850 text-indigo-650 dark:text-indigo-400 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                                                                    {children}
                                                                </code>
                                                            );
                                                        },
                                                        pre({ children, ...props }: any) {
                                                            return (
                                                                <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto my-3 border border-slate-800" {...props}>
                                                                    {children}
                                                                </pre>
                                                            );
                                                        },
                                                        p({ children }) {
                                                            return <p className="mb-3 text-slate-750 dark:text-slate-350">{children}</p>;
                                                        },
                                                        a({ children, href }) {
                                                            return <a href={href} target="_blank" rel="noreferrer" className="text-indigo-500 dark:text-indigo-400 underline hover:text-indigo-650 font-medium">{children}</a>;
                                                        },
                                                        ul({ children }) {
                                                            return <ul className="list-disc pl-5 mb-3 text-slate-750 dark:text-slate-350 space-y-1">{children}</ul>;
                                                        },
                                                        ol({ children }) {
                                                            return <ol className="list-decimal pl-5 mb-3 text-slate-750 dark:text-slate-350 space-y-1">{children}</ol>;
                                                        },
                                                        li({ children }) {
                                                            return <li>{children}</li>;
                                                        },
                                                        h1({ children }) { return <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100 mt-4 mb-2">{children}</h3>; },
                                                        h2({ children }) { return <h3 className="text-base font-bold text-slate-850 dark:text-slate-100 mt-4 mb-2">{children}</h3>; },
                                                        h3({ children }) { return <h4 className="text-sm font-bold text-slate-850 dark:text-slate-100 mt-4.5 mb-1.5">{children}</h4>; },
                                                    }}
                                                >
                                                    {description}
                                                </ReactMarkdown>
                                            ) : (
                                                <p className="text-slate-300 dark:text-slate-750 italic">
                                                    Start typing your question details and code snippets in the description editor to see a formatted preview...
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Smart Guidelines Content */}
                            {activeTab === "guide" && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-1.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                                        <BookOpen className="h-4 w-4 text-indigo-500" />
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Writing a Great Question</span>
                                    </div>

                                    <div className="space-y-3.5">

                                        {/* Title Guideline Card */}
                                        <div className={`p-3.5 rounded-xl border transition-all duration-355 ${activeField === "title"
                                            ? "border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10 shadow-xs scale-[1.01]"
                                            : "border-slate-100 dark:border-slate-850 bg-slate-50/20 dark:bg-slate-900/10 opacity-75"
                                            }`}>
                                            <div className="flex items-start gap-2.5">
                                                <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${activeField === "title"
                                                    ? "bg-indigo-500 text-white"
                                                    : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                                    }`}>
                                                    1
                                                </div>
                                                <div>
                                                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">Writing a clear Title</h3>
                                                    <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                                                        Summarize your problem in one sentence. Keep it concise, mention the core framework/language, and explain the error or specific goal.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Description Guideline Card */}
                                        <div className={`p-3.5 rounded-xl border transition-all duration-355 ${activeField === "description"
                                            ? "border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10 shadow-xs scale-[1.01]"
                                            : "border-slate-100 dark:border-slate-850 bg-slate-50/20 dark:bg-slate-900/10 opacity-75"
                                            }`}>
                                            <div className="flex items-start gap-2.5">
                                                <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${activeField === "description"
                                                    ? "bg-indigo-500 text-white"
                                                    : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                                    }`}>
                                                    2
                                                </div>
                                                <div>
                                                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">Adding Details & Code</h3>
                                                    <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                                                        Use the toolbar to format code blocks with syntax highlighting. Mention what you've tried, expected outcomes, and paste error messages directly.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tags Guideline Card */}
                                        <div className={`p-3.5 rounded-xl border transition-all duration-355 ${activeField === "tags"
                                            ? "border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10 shadow-xs scale-[1.01]"
                                            : "border-slate-100 dark:border-slate-850 bg-slate-50/20 dark:bg-slate-900/10 opacity-75"
                                            }`}>
                                            <div className="flex items-start gap-2.5">
                                                <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${activeField === "tags"
                                                    ? "bg-indigo-500 text-white"
                                                    : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                                    }`}>
                                                    3
                                                </div>
                                                <div>
                                                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">Selecting Relevant Tags</h3>
                                                    <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                                                        Add tags like <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-500">react</span>, <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-500">javascript</span>, or <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-500">node</span>. Good tags help domain experts find and answer your query quickly.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Checklist Footer Sidebar */}
                    <div className="bg-slate-50 dark:bg-[#0c0f1d] border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 space-y-3">
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider flex items-center gap-1.5">
                            <Terminal className="h-4 w-4 text-indigo-500 shrink-0" />
                            Before you post checklist
                        </h4>
                        <ul className="space-y-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            <li className="flex items-center gap-2">
                                <div className={`h-1.5 w-1.5 rounded-full ${titleSatisfied ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"}`} />
                                Title summarizes problem clearly &gt;= 10 chars
                            </li>
                            <li className="flex items-center gap-2">
                                <div className={`h-1.5 w-1.5 rounded-full ${descriptionSatisfied ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"}`} />
                                Description details error & code &gt;= 20 chars
                            </li>
                            <li className="flex items-center gap-2">
                                <div className={`h-1.5 w-1.5 rounded-full ${tags.length > 0 ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"}`} />
                                Added at least 1 relevant tag
                            </li>
                        </ul>
                    </div>
                </div>

            </div>

            <Dialog open={showImproveModal} onOpenChange={setShowImproveModal}>
                <DialogContent className="max-w-lg rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                            <Sparkles className="h-4.5 w-4.5 text-indigo-500" />
                            AI-Improved Question
                        </DialogTitle>
                    </DialogHeader>

                    {improvedData && (
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                            <div>
                                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                                    Improved Title
                                </p>
                                <p className="rounded-lg border border-indigo-100 bg-indigo-50/40 p-3 text-sm font-medium text-slate-800 dark:border-indigo-900/40 dark:bg-indigo-950/20 dark:text-slate-100">
                                    {improvedData.title || title}
                                </p>
                            </div>

                            <div>
                                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                                    Improved Description
                                </p>
                                <p className="whitespace-pre-wrap rounded-lg border border-indigo-100 bg-indigo-50/40 p-3 text-sm text-slate-700 dark:border-indigo-900/40 dark:bg-indigo-950/20 dark:text-slate-200">
                                    {improvedData.description}
                                </p>
                            </div>

                            {improvedData.suggestions?.length > 0 && (
                                <div>
                                    <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                                        <Lightbulb className="h-3.5 w-3.5" />
                                        Suggestions to make it even better
                                    </p>
                                    <ul className="space-y-1.5">
                                        {improvedData.suggestions.map((s, i) => (
                                            <li
                                                key={i}
                                                className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300"
                                            >
                                                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-indigo-400" />
                                                {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowImproveModal(false)}
                        >
                            Dismiss
                        </Button>
                        <Button
                            onClick={applyImprovedVersion}
                            className="bg-indigo-600 text-white hover:bg-indigo-700"
                        >
                            Apply to Draft
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}

export default AskQuestionPage;