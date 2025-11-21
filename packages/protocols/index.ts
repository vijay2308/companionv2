export interface McpRequest {
    jsonrpc: '2.0';
    method: string;
    params?: any;
    id: string | number;
}

export interface McpResponse {
    jsonrpc: '2.0';
    result?: any;
    error?: {
        code: number;
        message: string;
        data?: any;
    };
    id: string | number;
}

export interface McpTool {
    name: string;
    description: string;
    parameters: {
        type: 'object';
        properties: Record<string, any>;
        required?: string[];
    };
}
