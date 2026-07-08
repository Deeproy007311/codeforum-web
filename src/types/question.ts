export interface QuestionAuthor {
    _id: string;
    name: string;
    username: string;
    avatar?: string;
}

export interface Question {
    _id: string;
    title: string;
    description: string;
    tags: string[];
    author: QuestionAuthor;
    isSolved: boolean;
    upvotes: number;
    downvotes: number;
    createdAt: string;
    updatedAt: string;
}

export interface QuestionDetail extends Question {
    score: number;
    myVote: number;
}

export interface Answer {
    _id: string;
    content: string;
    author: QuestionAuthor;
    question: string;
    isAccepted: boolean;
    upvotes: number;
    downvotes: number;
    score?: number;
    myVote?: number;
    createdAt: string;
    updatedAt: string;
}

export interface GetAllQuestionsResponse {
    success: boolean;
    count: number;
    questions: Question[];
}

export interface GetSingleQuestionResponse {
    success: boolean;
    question: QuestionDetail;
    answers: Answer[];
}

export interface CreateQuestionPayload {
    title: string;
    description: string;
    tags: string[];
}

export interface GetAnswersResponse {
    success: boolean;
    count: number;
    answers: Answer[];
}