import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

function NotFoundPage() {
    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-400">
                <FileQuestion className="h-10 w-10" />
            </div>
            <h1 className="mb-2 text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                404
            </h1>
            <p className="mb-1 text-lg font-semibold text-slate-700 dark:text-slate-300">
                This page doesn't exist
            </p>
            <p className="mb-8 max-w-md text-sm text-slate-500 dark:text-slate-400">
                The page you're looking for might have been moved, deleted, or never
                existed in the first place.
            </p>
            <div className="flex gap-3">
                <Link to="/">
                    <Button className="bg-indigo-600 text-white hover:bg-indigo-700">
                        Back to Home
                    </Button>
                </Link>
                <Link to="/questions">
                    <Button variant="outline">Browse Questions</Button>
                </Link>
            </div>
        </div>
    );
}

export default NotFoundPage;