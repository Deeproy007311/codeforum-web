import { apiClient } from "./client";

interface VoteResponse {
    success: boolean;
    message: string;
}

export const upvoteQuestion = async (
    questionId: string
): Promise<VoteResponse> => {
    const { data } = await apiClient.post<VoteResponse>(
        `/api/votes/questions/${questionId}/upvote`
    );
    return data;
};

export const downvoteQuestion = async (
    questionId: string
): Promise<VoteResponse> => {
    const { data } = await apiClient.post<VoteResponse>(
        `/api/votes/questions/${questionId}/downvote`
    );
    return data;
};

export const upvoteAnswer = async (
    answerId: string
): Promise<VoteResponse> => {
    const { data } = await apiClient.post<VoteResponse>(
        `/api/votes/answers/${answerId}/upvote`
    );
    return data;
};

export const downvoteAnswer = async (
    answerId: string
): Promise<VoteResponse> => {
    const { data } = await apiClient.post<VoteResponse>(
        `/api/votes/answers/${answerId}/downvote`
    );
    return data;
};