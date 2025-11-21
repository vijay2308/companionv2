export type AppMode = 'concierge' | 'pilot';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

export interface Action {
    id: string;
    type: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed' | 'failed';
    description: string;
    toolName: string;
    parameters: Record<string, any>;
    createdAt: number;
}

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
}
