import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAllQuestions } from "@/api/questions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/authStore";

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

function LandingPage() {
    const navigate = useNavigate();
    const isLoggedIn = useAuthStore((state) => !!state.token);

    const { data, isLoading } = useQuery({
        queryKey: ["questions"],
        queryFn: () => getAllQuestions(),
    });

    const recentQuestions = data?.questions.slice(0, 4) ?? [];

    return (
        <div>
            {/* Hero */}
            <div className="border-b bg-gradient-to-b from-slate-900 to-slate-800 text-white">
                <div className="mx-auto max-w-5xl px-4 py-20 text-center">
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                        Ask. Answer. Ship faster.
                    </h1>
                    <p className="mx-auto mt-4 max-w-xl text-slate-300">
                        A coding Q&A community with AI-assisted answers, code
                        explanations, and a community that actually reviews your code.
                    </p>
                    <div className="mt-8 flex justify-center gap-3">
                        {isLoggedIn ? (
                            <Button size="lg" onClick={() => navigate("/questions")}>
                                Browse Questions
                            </Button>
                        ) : (
                            <>
                                <Button size="lg" onClick={() => navigate("/register")}>
                                    Get Started Free
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-slate-600 bg-transparent text-white hover:bg-slate-800 hover:text-white"
                                    onClick={() => navigate("/login")}
                                >
                                    Log In
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Questions Preview */}
            <div className="mx-auto max-w-5xl px-4 py-16">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Recently Asked
                    </h2>
                    <Link to="/questions">
                        <Button variant="ghost">View all questions →</Button>
                    </Link>
                </div>

                {isLoading && (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-32 w-full rounded-lg" />
                        ))}
                    </div>
                )}

                {!isLoading && recentQuestions.length === 0 && (
                    <div className="rounded-lg border border-dashed p-12 text-center text-gray-500">
                        No questions yet — be the first to ask one.
                    </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                    {recentQuestions.map((q) => (
                        <Link
                            key={q._id}
                            to={isLoggedIn ? `/questions/${q._id}` : "/login"}
                            className="block rounded-lg border bg-white p-5 transition hover:border-gray-300 hover:shadow-sm"
                        >
                            <div className="mb-2 flex items-center gap-2">
                                {q.isSolved && (
                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                        Solved
                                    </Badge>
                                )}
                                <h3 className="line-clamp-1 font-semibold text-gray-900">
                                    {q.title}
                                </h3>
                            </div>
                            <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                                {q.description}
                            </p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <Avatar className="h-5 w-5">
                                        <AvatarFallback className="text-[10px]">
                                            {q.author?.username?.[0]?.toUpperCase() ?? "?"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs text-gray-500">
                                        {q.author?.username ?? "unknown"}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-400">
                                    {timeAgo(q.createdAt)}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Features */}
            <div className="border-t bg-white py-16">
                <div className="mx-auto max-w-5xl px-4">
                    <h2 className="mb-10 text-center text-2xl font-bold text-gray-900">
                        Why developers use CodeForum
                    </h2>
                    <div className="grid gap-8 sm:grid-cols-3">
                        <div className="text-center">
                            <div className="mb-3 text-3xl">🤖</div>
                            <h3 className="mb-2 font-semibold">AI-Assisted Answers</h3>
                            <p className="text-sm text-gray-600">
                                Get instant AI-generated answers and code explanations
                                alongside real community input.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="mb-3 text-3xl">⬆️</div>
                            <h3 className="mb-2 font-semibold">Community Voting</h3>
                            <p className="text-sm text-gray-600">
                                The best answers rise to the top through upvotes from real
                                developers.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="mb-3 text-3xl">✅</div>
                            <h3 className="mb-2 font-semibold">Solved, Tracked</h3>
                            <p className="text-sm text-gray-600">
                                Mark questions solved so others can find working answers
                                fast.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t bg-gray-50 py-8">
                <div className="mx-auto max-w-5xl px-4 text-center text-sm text-gray-500">
                    © {new Date().getFullYear()} CodeForum. Built with React, Node.js,
                    and MongoDB.
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;