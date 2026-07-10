import { apiClient } from "./client";
import type { AIUsage, GenerateAnswerResponse } from "@/types/ai";

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