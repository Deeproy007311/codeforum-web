import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAllQuestions } from "@/api/questions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/authStore";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import TagsSidebar from "./TagsSidebar";
import SearchBar from "./SearchBar";

function timeAgo(dateString: string) {
    const date = new Date(dateString);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    const intervals: [number, string][] = [
        [31536000, "y"],
        [2592000, "mo"],
        [86400, "d"],
        [3600, "h"],
        [60, "m"],
    ];

    for (const [secs, label] of intervals) {
        const count = Math.floor(seconds / secs);
        if (count >= 1) return `${count}${label} ago`;
    }
    return "just now";
}

function QuestionsListPage() {
    const navigate = useNavigate();
    const isLoggedIn = useAuthStore((state) => !!state.token);
    const { requireAuth } = useRequireAuth();
    const [search, setSearch] = useState("");

    const { data, isLoading, isError } = useQuery({
        queryKey: ["questions"],
        queryFn: () => getAllQuestions(),
    });

    const handleAskQuestion = () => {
        requireAuth(() => navigate("/ask"));
    };

    const filteredQuestions = data?.questions.filter((q) =>
        q.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 py-8 md:grid-cols-[1fr_280px]">
            <div>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            All Questions
                        </h1>
                        <p className="text-sm text-gray-500">
                            {data ? `${data.count} questions` : "Loading questions..."}
                        </p>
                    </div>
                    <Button onClick={handleAskQuestion}>Ask Question</Button>
                </div>

                <div className="mb-4">
                    <SearchBar onSearch={setSearch} />
                </div>

                {isLoading && (
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-28 w-full rounded-lg" />
                        ))}
                    </div>
                )}

                {isError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-600">
                        Failed to load questions. Please try again later.
                    </div>
                )}

                {data && filteredQuestions?.length === 0 && (
                    <div className="rounded-lg border border-dashed p-12 text-center">
                        <p className="text-gray-500">
                            {search ? "No questions match your search." : "No questions yet."}
                        </p>
                        {!search && (
                            <Button className="mt-4" onClick={handleAskQuestion}>
                                Ask the first question
                            </Button>
                        )}
                    </div>
                )}

                <div className="space-y-3">
                    {filteredQuestions?.map((question) => (
                        <Link
                            key={question._id}
                            to={isLoggedIn ? `/questions/${question._id}` : "#"}
                            onClick={(e) => {
                                if (!isLoggedIn) {
                                    e.preventDefault();
                                    requireAuth(() => { });
                                }
                            }}
                            className="block rounded-lg border bg-white p-5 transition hover:border-gray-300 hover:shadow-sm"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="mb-2 flex items-center gap-2">
                                        {question.isSolved && (
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                                Solved
                                            </Badge>
                                        )}
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            {question.title}
                                        </h2>
                                    </div>
                                    <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                                        {question.description}
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {question.tags.map((tag) => (
                                            <Badge
                                                key={tag}
                                                variant="secondary"
                                                className="text-xs font-normal"
                                            >
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex shrink-0 flex-col items-end gap-2">
                                    <div className="flex gap-3 text-sm text-gray-500">
                                        <span>▲ {question.upvotes}</span>
                                        <span>▼ {question.downvotes}</span>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        {timeAgo(question.createdAt)}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <Avatar className="h-5 w-5">
                                            <AvatarFallback className="text-[10px]">
                                                {question.author?.username?.[0]?.toUpperCase() ?? "?"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs font-medium text-gray-700">
                                            {question.author?.username ?? "unknown"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="hidden md:block">
                <TagsSidebar questions={data?.questions ?? []} />
            </div>
        </div>
    );
}

export default QuestionsListPage;