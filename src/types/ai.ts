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