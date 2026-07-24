import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getSingleQuestion, editQuestion } from "@/api/questions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import { motion } from "framer-motion";
import { PenLine, Tag as TagIcon, Loader2, X } from "lucide-react";

function EditQuestionPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user);

    const { data, isLoading } = useQuery({
        queryKey: ["question", id],
        queryFn: () => getSingleQuestion(id as string),
        enabled: !!id,
    });

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>([]);

    useEffect(() => {
        if (data) {
            setTitle(data.question.title);
            setDescription(data.question.description);
            setTags(data.question.tags);
        }
    }, [data]);

    const mutation = useMutation({
        mutationFn: () =>
            editQuestion(id as string, { title, description, tags }),
        onSuccess: (question) => {
            toast.success("Question updated");
            queryClient.invalidateQueries({ queryKey: ["question", id] });
            queryClient.invalidateQueries({ queryKey: ["questions"] });
            navigate(`/questions/${question._id}`);
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to update question");
        },
    });

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
        mutation.mutate();
    };

    if (isLoading) {
        return <div className="mx-auto max-w-2xl px-4 py-8">Loading...</div>;
    }

    if (data && user?._id !== data.question.author?._id) {
        return (
            <div className="mx-auto max-w-2xl px-4 py-8">
                <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-600">
                    You don't have permission to edit this question.
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mx-auto max-w-2xl px-4 py-8"
        >
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/40">
                <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5 dark:border-slate-800/40">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                        <PenLine className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Edit Question</h1>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Update your title, description, or tags for this question.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-xs font-bold text-slate-700 dark:text-slate-300">Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="focus-visible:ring-indigo-500 rounded-lg border-slate-200 dark:border-slate-800 dark:bg-slate-900/60"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-xs font-bold text-slate-700 dark:text-slate-300">Description</Label>
                        <Textarea
                            id="description"
                            rows={8}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="focus-visible:ring-indigo-500 rounded-lg border-slate-200 dark:border-slate-800 dark:bg-slate-900/60 min-h-[160px]"
                        />
                    </div>

                    <div className="space-y-2.5">
                        <Label htmlFor="tags" className="text-xs font-bold text-slate-700 dark:text-slate-300">Tags</Label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Input
                                    id="tags"
                                    placeholder="Press Enter to add tags"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleTagKeyDown}
                                    className="focus-visible:ring-indigo-500 rounded-lg border-slate-200 dark:border-slate-800 dark:bg-slate-900/60 pr-10"
                                />
                                <div className="absolute right-3 top-2.5 text-slate-300 dark:text-slate-600">
                                    <TagIcon className="h-4 w-4" />
                                </div>
                            </div>
                            <Button type="button" variant="outline" onClick={addTag} className="rounded-lg border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 h-9 font-medium text-slate-600 dark:text-slate-300">
                                Add
                            </Button>
                        </div>
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-slate-50 dark:border-slate-800/20">
                                {tags.map((tag) => (
                                    <Badge
                                        key={tag}
                                        variant="secondary"
                                        className="bg-indigo-50/50 hover:bg-indigo-100/80 text-indigo-600 hover:text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 dark:hover:bg-indigo-950/30 text-[11px] font-semibold py-1 px-2.5 rounded-md transition-all duration-150 flex items-center gap-1.5 cursor-pointer border border-indigo-100/50 dark:border-indigo-900/50"
                                        onClick={() => removeTag(tag)}
                                    >
                                        #{tag}
                                        <X className="h-3 w-3 text-indigo-400 group-hover:text-indigo-600" />
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-slate-50 dark:border-slate-800/20">
                        <Button type="submit" disabled={mutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs h-9 flex items-center gap-1.5 px-4">
                            {mutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate(`/questions/${id}`)}
                            className="rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 h-9 font-medium"
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
}

export default EditQuestionPage;