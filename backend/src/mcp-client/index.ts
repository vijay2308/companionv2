import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

export class MobileMcpClient {
    private client: Client | null = null;
    private transport: StdioClientTransport | null = null;
    private isConnected: boolean = false;
    private availableTools: Map<string, any> = new Map();
    private currentDevice: string | null = null;

    async connect(): Promise<void> {
        if (this.isConnected) {
            console.log('[MCP Client] Already connected');
            return;
        }

        console.log('[MCP Client] Connecting to mobile-mcp server...');

        try {
            // Create transport using npx to run mobile-mcp
            this.transport = new StdioClientTransport({
                command: 'npx',
                args: ['-y', '@mobilenext/mobile-mcp@latest'],
            });

            // Create MCP client
            this.client = new Client(
                {
                    name: 'companion-backend',
                    version: '1.0.0',
                },
                {
                    capabilities: {
                        tools: {},
                    },
                }
            );

            // Connect to the server
            await this.client.connect(this.transport);
            this.isConnected = true;

            // List available tools
            const toolsResponse = await this.client.listTools();
            console.log('[MCP Client] Connected! Available tools:');

            for (const tool of toolsResponse.tools) {
                this.availableTools.set(tool.name, tool);
                console.log(`  - ${tool.name}: ${tool.description}`);
            }

            console.log(`[MCP Client] Total tools available: ${this.availableTools.size}`);

            // Set default device - you can change this or make it configurable
            // For Android emulator, it's typically "emulator-5554"
            this.currentDevice = process.env.MOBILE_DEVICE || 'emulator-5554';
            console.log(`[MCP Client] Using device: ${this.currentDevice}`);
        } catch (error) {
            console.error('[MCP Client] Connection failed:', error);
            this.isConnected = false;
            throw error;
        }
    }

    getCurrentDevice(): string | null {
        return this.currentDevice;
    }

    setDevice(deviceId: string): void {
        this.currentDevice = deviceId;
        console.log(`[MCP Client] Device set to: ${deviceId}`);
    }

    async disconnect(): Promise<void> {
        if (!this.isConnected || !this.client) {
            return;
        }

        console.log('[MCP Client] Disconnecting...');
        await this.client.close();
        this.client = null;
        this.transport = null;
        this.isConnected = false;
        console.log('[MCP Client] Disconnected');
    }

    async callTool(toolName: string, args: any): Promise<any> {
        if (!this.isConnected || !this.client) {
            throw new Error('MCP Client not connected. Call connect() first.');
        }

        console.log(`[MCP Client] Calling tool: ${toolName}`, args);

        try {
            const result = await this.client.callTool({
                name: toolName,
                arguments: args,
            });

            console.log(`[MCP Client] Tool result:`, result);
            return result;
        } catch (error) {
            console.error(`[MCP Client] Tool call failed:`, error);
            throw error;
        }
    }

    getAvailableTools(): string[] {
        return Array.from(this.availableTools.keys());
    }

    getToolInfo(toolName: string): any {
        return this.availableTools.get(toolName);
    }

    isClientConnected(): boolean {
        return this.isConnected;
    }
}

// Singleton instance
let mcpClientInstance: MobileMcpClient | null = null;

export function getMcpClient(): MobileMcpClient {
    if (!mcpClientInstance) {
        mcpClientInstance = new MobileMcpClient();
    }
    return mcpClientInstance;
}

export async function initializeMcpClient(): Promise<MobileMcpClient> {
    const client = getMcpClient();
    if (!client.isClientConnected()) {
        await client.connect();
    }
    return client;
}
