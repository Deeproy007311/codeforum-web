export interface QuestionAuthor {
    _id: string;
    name: string;
    username: string;
    avatar?: string;
}

// Shape returned by GET /api/questions (list)
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

// Shape returned by GET /api/questions/:id (detail) — has extra computed fields
export interface QuestionDetail extends Question {
    score: number;
    myVote: number; // -1, 0, or 1
}

export interface Answer {
    _id: string;
    question: string;
    description: string;
    author: QuestionAuthor;
    upvotes: number;
    downvotes: number;
    score: number;
    myVote: number;
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