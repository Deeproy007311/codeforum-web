import { apiClient } from "./client";
import type {
    GetAllQuestionsResponse,
    GetSingleQuestionResponse,
    CreateQuestionPayload,
    Question,
} from "@/types/question";

export const getAllQuestions = async (params?: {
    tag?: string;
    search?: string;
}): Promise<GetAllQuestionsResponse> => {
    const { data } = await apiClient.get<GetAllQuestionsResponse>(
        "/api/questions",
        { params }
    );
    return data;
};

export const getSingleQuestion = async (
    id: string
): Promise<GetSingleQuestionResponse> => {
    const { data } = await apiClient.get<GetSingleQuestionResponse>(
        `/api/questions/${id}`
    );
    return data;
};

export const createQuestion = async (
    payload: CreateQuestionPayload
): Promise<Question> => {
    const { data } = await apiClient.post<{
        success: boolean;
        message: string;
        question: Question;
    }>("/api/questions", payload);
    return data.question;
};

export const editQuestion = async (
    questionId: string,
    payload: CreateQuestionPayload
): Promise<Question> => {
    const { data } = await apiClient.patch<{
        success: boolean;
        message: string;
        question: Question;
    }>(`/api/questions/${questionId}`, payload);
    return data.question;
};

export const deleteQuestion = async (questionId: string): Promise<void> => {
    await apiClient.delete(`/api/questions/${questionId}`);
};