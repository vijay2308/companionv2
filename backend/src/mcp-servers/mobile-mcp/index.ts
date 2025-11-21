// Integration with mobile-mcp (https://github.com/mobile-next/mobile-mcp)
// This module acts as a bridge/client to the mobile-mcp server running via MCP protocol.

import { getMcpClient } from '../../mcp-client';

export const mobileMcpTools = [
    {
        name: 'mobile_take_screenshot',
        description: 'Take a screenshot of the device screen',
        parameters: {}
    },
    {
        name: 'mobile_list_available_devices',
        description: 'List all available devices (simulators/emulators/real devices)',
        parameters: {}
    },
    {
        name: 'mobile_list_apps',
        description: 'List all installed apps on the device',
        parameters: {}
    },
    {
        name: 'mobile_launch_app',
        description: 'Launch an app by package name',
        parameters: {
            type: 'object',
            properties: {
                packageName: { type: 'string' }
            },
            required: ['packageName']
        }
    },
    {
        name: 'mobile_terminate_app',
        description: 'Terminate/close a running app',
        parameters: {
            type: 'object',
            properties: {
                packageName: { type: 'string' }
            },
            required: ['packageName']
        }
    },
    {
        name: 'mobile_get_screen_size',
        description: 'Get the screen dimensions of the device',
        parameters: {}
    },
    {
        name: 'mobile_click_on_screen_at_coordinates',
        description: 'Click/tap at specific x,y coordinates',
        parameters: {
            type: 'object',
            properties: {
                x: { type: 'number' },
                y: { type: 'number' }
            },
            required: ['x', 'y']
        }
    },
    {
        name: 'mobile_type_keys',
        description: 'Type text into focused element',
        parameters: {
            type: 'object',
            properties: {
                text: { type: 'string' },
                submit: { type: 'boolean' }
            },
            required: ['text']
        }
    },
    {
        name: 'mobile_press_button',
        description: 'Press a device button (home, back, enter, etc)',
        parameters: {
            type: 'object',
            properties: {
                button: { type: 'string' }
            },
            required: ['button']
        }
    },
    {
        name: 'mobile_swipe_on_screen',
        description: 'Swipe on the screen in a direction',
        parameters: {
            type: 'object',
            properties: {
                direction: { type: 'string' },
                startX: { type: 'number' },
                startY: { type: 'number' },
                endX: { type: 'number' },
                endY: { type: 'number' }
            }
        }
    },
    {
        name: 'mobile_open_url',
        description: 'Open a URL in the device browser',
        parameters: {
            type: 'object',
            properties: {
                url: { type: 'string' }
            },
            required: ['url']
        }
    },
    {
        name: 'mobile_list_elements_on_screen',
        description: 'List all UI elements currently visible on screen with their coordinates',
        parameters: {}
    },
    {
        name: 'mobile_get_orientation',
        description: 'Get current screen orientation',
        parameters: {}
    },
    {
        name: 'mobile_set_orientation',
        description: 'Set screen orientation (portrait/landscape)',
        parameters: {
            type: 'object',
            properties: {
                orientation: { type: 'string' }
            },
            required: ['orientation']
        }
    }
];

export async function executeMobileTool(toolName: string, args: any): Promise<any> {
    console.log(`[Mobile MCP] Executing: ${toolName}`, args);

    const mcpClient = getMcpClient();

    // Check if client is connected
    if (!mcpClient.isClientConnected()) {
        console.log('[Mobile MCP] Client not connected, attempting to connect...');
        try {
            await mcpClient.connect();
        } catch (error) {
            console.error('[Mobile MCP] Failed to connect to mobile-mcp server:', error);
            return {
                status: 'error',
                error: 'Mobile MCP server not available. Make sure the emulator/simulator is running.',
                data: null
            };
        }
    }

    try {
        // Prepare arguments with device if needed
        let toolArgs = args || {};

        // Get current device and inject it into args if not provided
        const currentDevice = mcpClient.getCurrentDevice();
        if (currentDevice && !toolArgs.device) {
            toolArgs = { ...toolArgs, device: currentDevice };
        }

        // Fix for mobile_type_keys - submit is required
        if (toolName === 'mobile_type_keys' && toolArgs.submit === undefined) {
            toolArgs.submit = false;
        }

        // Fix for mobile_open_url - must have proper URL format
        if (toolName === 'mobile_open_url' && toolArgs.url) {
            if (!toolArgs.url.startsWith('http://') && !toolArgs.url.startsWith('https://')) {
                toolArgs.url = 'https://' + toolArgs.url;
            }
        }

        console.log(`[Mobile MCP] Calling with args:`, toolArgs);

        const result = await mcpClient.callTool(toolName, toolArgs);

        // Process the result
        if (result.content && Array.isArray(result.content)) {
            // Extract text content from MCP response
            const textContent = result.content
                .filter((c: any) => c.type === 'text')
                .map((c: any) => c.text)
                .join('\n');

            // Check for image content (screenshots)
            const imageContent = result.content.find((c: any) => c.type === 'image');

            if (imageContent) {
                return {
                    status: 'success',
                    data: textContent || 'Screenshot captured',
                    image: imageContent.data, // base64 encoded image
                    mimeType: imageContent.mimeType
                };
            }

            return {
                status: 'success',
                data: textContent || JSON.stringify(result)
            };
        }

        return {
            status: 'success',
            data: result
        };
    } catch (error: any) {
        console.error(`[Mobile MCP] Tool execution failed:`, error);
        return {
            status: 'error',
            error: error.message || 'Tool execution failed',
            data: null
        };
    }
}
