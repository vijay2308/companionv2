const API_BASE_URL = 'http://10.0.2.2:3000'; // Android emulator localhost
// For iOS simulator use: 'http://localhost:3000'
// For physical device, use your computer's IP address

export interface ChatResponse {
    response: string;
    actions: Array<{
        tool: string;
        args: any;
    }>;
    results?: Array<{
        name: string;
        result: any;
    }>;
}

export async function sendMessage(message: string, mode: 'concierge' | 'pilot'): Promise<ChatResponse> {
    const response = await fetch(`${API_BASE_URL}/api/agent/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, mode }),
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return response.json();
}

export async function clearChatHistory(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/agent/clear`, {
        method: 'POST',
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }
}

export async function checkHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        return response.ok;
    } catch {
        return false;
    }
}
