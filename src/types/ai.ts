export interface AIUsage {
    month: string;
    limit: number;
    used: number;
    remaining: number;
    canUseAI: boolean;
}

export interface GenerateAnswerResponse {
    success: boolean;
    answer: string;
    fromCache: boolean;
    usage: AIUsage;
    generatedBy: string;
    model: string;
}

export interface ImproveQuestionData {
    title: string;
    description: string;
    suggestions: string[];
}

export interface ImproveQuestionResponse {
    success: boolean;
    data: ImproveQuestionData;
    fromCache: boolean;
    usage: AIUsage;
}
export interface ExplainCodeResponse {
    success: boolean;
    explanation: string;
    fromCache: boolean;
    usage: AIUsage;
    generatedBy: string;
    model: string;
}

export interface AIHistoryEntry {
    _id: string;
    feature: "answer" | "improve-question" | "explain-code";
    inputPreview: string;
    fromCache: boolean;
    createdAt: string;
}

export interface AIHistoryResponse {
    success: boolean;
    history: AIHistoryEntry[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}