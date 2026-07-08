import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface VoteButtonsProps {
    upvotes: number;
    downvotes: number;
    myVote?: number;
    onUpvote: () => void;
    onDownvote: () => void;
    disabled?: boolean;
    isPending?: boolean;
}

function VoteButtons({
    upvotes,
    downvotes,
    myVote = 0,
    onUpvote,
    onDownvote,
    disabled,
    isPending = false,
}: VoteButtonsProps) {
    const score = upvotes - downvotes;

    return (
        <div className="flex flex-col items-center gap-1.5 p-1 rounded-xl bg-slate-50/50 border border-slate-100/80 dark:bg-slate-900/60 dark:border-slate-800/60 min-w-[40px] h-fit">
            {/* Upvote Button */}
            <motion.div whileTap={(!disabled && !isPending) ? { scale: 0.85 } : {}}>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "h-8 w-8 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors",
                        myVote === 1 && "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15 hover:text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/25 dark:hover:text-emerald-400",
                        disabled && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={onUpvote}
                    disabled={disabled || isPending}
                >
                    <ChevronUp className="h-5 w-5" />
                </Button>
            </motion.div>

            {/* Score / Loader */}
            <div className="h-5 flex items-center justify-center">
                {isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />
                ) : (
                    <span className={cn(
                        "text-sm font-extrabold tracking-tight",
                        score > 0 && "text-emerald-600 dark:text-emerald-400",
                        score < 0 && "text-rose-600 dark:text-rose-400",
                        score === 0 && "text-slate-600 dark:text-slate-400"
                    )}>
                        {score}
                    </span>
                )}
            </div>

            {/* Downvote Button */}
            <motion.div whileTap={(!disabled && !isPending) ? { scale: 0.85 } : {}}>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "h-8 w-8 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors",
                        myVote === -1 && "bg-rose-500/10 text-rose-600 hover:bg-rose-500/15 hover:text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 dark:hover:bg-rose-500/25 dark:hover:text-rose-400",
                        disabled && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={onDownvote}
                    disabled={disabled || isPending}
                >
                    <ChevronDown className="h-5 w-5" />
                </Button>
            </motion.div>
        </div>
    );
}

export default VoteButtons;