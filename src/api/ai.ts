import { apiClient } from "./client";
import type { AIUsage, GenerateAnswerResponse, ImproveQuestionResponse, ExplainCodeResponse, AIHistoryResponse } from "@/types/ai";


export const generateAIAnswer = async (payload: {
    title: string;
    description: string;
    tags: string[];
}): Promise<GenerateAnswerResponse> => {
    const { data } = await apiClient.post<GenerateAnswerResponse>(
        "/api/ai/answer",
        payload
    );
    return data;
};

export const getAIUsage = async (): Promise<AIUsage> => {
    const { data } = await apiClient.get<{ success: boolean; usage: AIUsage }>(
        "/api/ai/usage"
    );
    return data.usage;
};

export const improveQuestion = async (payload: {
    title: string;
    description: string;
}): Promise<ImproveQuestionResponse> => {
    const { data } = await apiClient.post<ImproveQuestionResponse>(
        "/api/ai/improve-question",
        payload
    );
    return data;
};

export const explainCode = async (code: string): Promise<ExplainCodeResponse> => {
    const { data } = await apiClient.post<ExplainCodeResponse>(
        "/api/ai/explain-code",
        { code }
    );
    return data;
};

export const getAIHistory = async (page = 1, limit = 20): Promise<AIHistoryResponse> => {
    const { data } = await apiClient.get<AIHistoryResponse>("/api/ai/history", {
        params: { page, limit },
    });
    return data;
};