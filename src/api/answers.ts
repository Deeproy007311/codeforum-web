import { apiClient } from "./client";
import type { Answer, GetAnswersResponse } from "@/types/question";

export const getAnswersByQuestion = async (
    questionId: string
): Promise<GetAnswersResponse> => {
    const { data } = await apiClient.get<GetAnswersResponse>(
        `/api/questions/${questionId}/answers`
    );
    return data;
};

export const createAnswer = async (
    questionId: string,
    content: string
): Promise<Answer> => {
    const { data } = await apiClient.post<{
        success: boolean;
        message: string;
        answer: Answer;
    }>(`/api/questions/${questionId}/answers`, { content });
    return data.answer;
};

export const editAnswer = async (
    answerId: string,
    content: string
): Promise<Answer> => {
    const { data } = await apiClient.patch<{
        success: boolean;
        message: string;
        answer: Answer;
    }>(`/api/questions/answers/${answerId}`, { content });
    return data.answer;
};

export const acceptAnswer = async (answerId: string): Promise<Answer> => {
    const { data } = await apiClient.patch<{
        success: boolean;
        message: string;
        answer: Answer;
    }>(`/api/questions/answers/${answerId}/accept`);
    return data.answer;
};