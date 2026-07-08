import { Badge } from "@/components/ui/badge";
import type { Question } from "@/types/question";

function TagsSidebar({ questions }: { questions: Question[] }) {
    const tagCounts = new Map<string, number>();

    questions.forEach((q) => {
        q.tags.forEach((tag) => {
            tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
        });
    });

    const topTags = [...tagCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    return (
        <div className="rounded-lg border bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
                Popular Tags
            </h3>
            {topTags.length === 0 ? (
                <p className="text-sm text-gray-400">
                    Tags will appear here once questions are asked.
                </p>
            ) : (
                <div className="flex flex-wrap gap-1.5">
                    {topTags.map(([tag, count]) => (
                        <Badge
                            key={tag}
                            variant="secondary"
                            className="font-normal text-gray-700"
                        >
                            {tag}
                            <span className="ml-1 text-gray-400">{count}</span>
                        </Badge>
                    ))}
                </div>
            )}

            <div className="mt-6 border-t pt-4">
                <h3 className="mb-2 text-sm font-semibold text-gray-900">
                    How CodeForum works
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                    <li>💬 Ask a coding question, get real answers</li>
                    <li>🤖 Get AI-assisted answers instantly</li>
                    <li>⬆️ Vote to surface the best solutions</li>
                    <li>✅ Mark your question solved</li>
                </ul>
            </div>
        </div>
    );
}

export default TagsSidebar;