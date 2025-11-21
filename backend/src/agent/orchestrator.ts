import { GoogleGenerativeAI, SchemaType, Tool } from '@google/generative-ai';
import { googleWorkspaceTools, executeGoogleTool } from '../mcp-servers/google-workspace';
import { mobileMcpTools, executeMobileTool } from '../mcp-servers/mobile-mcp';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Types for human-in-the-loop interactions
export interface HumanInteractionRequired {
    type: 'AUTH_DECISION_REQUIRED' | 'USER_ACTION_REQUIRED' | 'CONFIRMATION_REQUIRED' | 'INFO_REQUIRED';
    title: string;
    message: string;
    context: string;
    options: Array<{
        id: string;
        label: string;
        description?: string;
        style?: 'primary' | 'secondary' | 'danger';
    }>;
    inputFields?: Array<{
        id: string;
        label: string;
        type: 'text' | 'password' | 'email';
        required?: boolean;
    }>;
    canAutomate?: boolean;
    automateAfterSeconds?: number;
    screenshot?: string;
}

export interface WorkflowStatus {
    phase: 'analyzing' | 'executing' | 'waiting_for_user' | 'completed' | 'failed';
    currentAction?: string;
    progress?: number;
    totalSteps?: number;
    completedSteps?: number;
}

// Convert our tool definitions to Gemini function declarations
const geminiTools: Tool[] = [
    {
        functionDeclarations: [
            // Mobile MCP Tools
            {
                name: 'mobile_take_screenshot',
                description: 'Take a screenshot of the device screen to see what is currently displayed',
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {},
                    required: []
                }
            },
            {
                name: 'mobile_list_available_devices',
                description: 'List all available devices (simulators, emulators, real devices)',
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {},
                    required: []
                }
            },
            {
                name: 'mobile_list_apps',
                description: 'List all installed apps on the device',
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {},
                    required: []
                }
            },
            {
                name: 'mobile_launch_app',
                description: 'Launch an app by its package name or app name',
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        packageName: {
                            type: SchemaType.STRING,
                            description: 'The package name or app name to launch (e.g., com.google.android.youtube or YouTube)'
                        }
                    },
                    required: ['packageName']
                }
            },
            {
                name: 'mobile_terminate_app',
                description: 'Close/terminate a running app',
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        packageName: {
                            type: SchemaType.STRING,
                            description: 'The package name of the app to terminate'
                        }
                    },
                    required: ['packageName']
                }
            },
            {
                name: 'mobile_click_on_screen_at_coordinates',
                description: 'Click/tap at specific x,y coordinates on the screen',
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        x: {
                            type: SchemaType.NUMBER,
                            description: 'X coordinate to click'
                        },
                        y: {
                            type: SchemaType.NUMBER,
                            description: 'Y coordinate to click'
                        }
                    },
                    required: ['x', 'y']
                }
            },
            {
                name: 'mobile_type_keys',
                description: 'Type text into the currently focused input field. Use submit=true to press Enter/Search after typing.',
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        text: {
                            type: SchemaType.STRING,
                            description: 'The text to type'
                        },
                        submit: {
                            type: SchemaType.BOOLEAN,
                            description: 'Set to true to press Enter/Search key after typing (useful for search fields)'
                        }
                    },
                    required: ['text']
                }
            },
            {
                name: 'mobile_press_button',
                description: 'Press a device button like home, back, or enter',
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        button: {
                            type: SchemaType.STRING,
                            description: 'Button to press: home, back, enter, volume_up, volume_down'
                        }
                    },
                    required: ['button']
                }
            },
            {
                name: 'mobile_open_url',
                description: 'Open a URL in the device browser',
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        url: {
                            type: SchemaType.STRING,
                            description: 'The URL to open'
                        }
                    },
                    required: ['url']
                }
            },
            {
                name: 'mobile_get_screen_size',
                description: 'Get the screen dimensions of the device',
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {},
                    required: []
                }
            },
            {
                name: 'mobile_list_elements_on_screen',
                description: 'List all UI elements currently visible on screen with their coordinates and properties',
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {},
                    required: []
                }
            },
            {
                name: 'mobile_swipe_on_screen',
                description: 'Swipe on the screen from one point to another or in a direction',
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        direction: {
                            type: SchemaType.STRING,
                            description: 'Direction to swipe: up, down, left, right'
                        },
                        startX: {
                            type: SchemaType.NUMBER,
                            description: 'Starting X coordinate (optional if using direction)'
                        },
                        startY: {
                            type: SchemaType.NUMBER,
                            description: 'Starting Y coordinate (optional if using direction)'
                        },
                        endX: {
                            type: SchemaType.NUMBER,
                            description: 'Ending X coordinate (optional if using direction)'
                        },
                        endY: {
                            type: SchemaType.NUMBER,
                            description: 'Ending Y coordinate (optional if using direction)'
                        }
                    },
                    required: []
                }
            },
            // Google Workspace Tools
            {
                name: 'gmail_send_email',
                description: 'Send an email via Gmail',
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        to: {
                            type: SchemaType.STRING,
                            description: 'Recipient email address'
                        },
                        subject: {
                            type: SchemaType.STRING,
                            description: 'Email subject'
                        },
                        body: {
                            type: SchemaType.STRING,
                            description: 'Email body content'
                        }
                    },
                    required: ['to', 'subject', 'body']
                }
            },
            {
                name: 'drive_search_file',
                description: 'Search for a file in Google Drive',
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        query: {
                            type: SchemaType.STRING,
                            description: 'Search query for the file'
                        }
                    },
                    required: ['query']
                }
            }
        ]
    }
];

import * as fs from 'fs';
import * as path from 'path';

export class AgentOrchestrator {
    private model;
    private chatHistory: Array<{ role: string; parts: Array<{ text: string }> }> = [];
    private readonly STATE_FILE = path.join(process.cwd(), '.agent_state.json');

    constructor() {
        this.model = genAI.getGenerativeModel({
            model: 'gemini-3-pro-preview',
            tools: geminiTools,
            systemInstruction: `You are a helpful mobile device assistant called "Companion". You help users automate tasks on their phone with a seamless human-in-the-loop experience.

## PILOT MODE WORKFLOW

1. ALWAYS start by taking a screenshot (mobile_take_screenshot) to see the current screen
2. Use mobile_list_elements_on_screen to find clickable elements and their coordinates
3. Analyze what you see and determine the next step
4. Execute the action (click, type, swipe, etc.)
5. Take another screenshot to verify the result
6. Continue until the task is FULLY complete OR requires human input

## CRITICAL: WHEN TO PAUSE FOR HUMAN INPUT

You MUST pause and ask for user input in these scenarios:

### 1. USER_ACTION_REQUIRED - User must perform action on device
Pause when:
- App installation screens (Play Store "Install" button) - user must approve
- Payment/purchase confirmations
- Biometric authentication (fingerprint/face)
- Permission dialogs that require user consent
- Any action that cannot be automated due to security restrictions

### 2. AUTH_DECISION_REQUIRED - Login/account needed
Pause when:
- Login screen with no skip option
- Task requires user's personal account (email, social media)
- Two-factor authentication codes needed

### 3. CONFIRMATION_REQUIRED - Need user approval before proceeding
Pause when:
- About to delete data
- About to send messages/emails
- About to make purchases
- About to change account settings
- Any irreversible action

### 4. INFO_REQUIRED - Need information from user
Pause when:
- Need specific search terms, names, or content
- Need to choose between multiple options
- Need clarification on task details

## HUMAN INTERACTION JSON FORMAT

When you need human input, respond with ONLY this JSON (no other text):

{
  "type": "USER_ACTION_REQUIRED" | "AUTH_DECISION_REQUIRED" | "CONFIRMATION_REQUIRED" | "INFO_REQUIRED",
  "title": "<short title like 'Install App' or 'Sign In Required'>",
  "message": "<friendly, clear explanation of what's happening and why you paused>",
  "context": "<what the user sees on screen right now>",
  "options": [
    {
      "id": "<action_id>",
      "label": "<button text>",
      "description": "<optional helper text>",
      "style": "primary" | "secondary" | "danger"
    }
  ],
  "inputFields": [  // Optional, only if you need text input
    {
      "id": "<field_id>",
      "label": "<field label>",
      "type": "text" | "password" | "email",
      "required": true | false
    }
  ],
  "waitingFor": "<what action user should take on device, if any>"
}

## EXAMPLES

### Play Store Install:
{
  "type": "USER_ACTION_REQUIRED",
  "title": "Install WhatsApp",
  "message": "I've found WhatsApp in the Play Store. For security, app installations require your approval. Please tap the Install button on your device, then come back here.",
  "context": "Play Store showing WhatsApp app page with Install button",
  "options": [
    {"id": "done", "label": "I've installed it", "description": "Continue with the task", "style": "primary"},
    {"id": "cancel", "label": "Cancel", "description": "Stop this task", "style": "secondary"}
  ],
  "waitingFor": "Tap 'Install' button in Play Store"
}

### Google Sign-in:
{
  "type": "AUTH_DECISION_REQUIRED",
  "title": "Sign In Required",
  "message": "Google Play requires you to sign in to install apps. Would you like to sign in or skip this task?",
  "context": "Google Play sign-in screen",
  "options": [
    {"id": "signin", "label": "I'll sign in", "description": "Sign in on device", "style": "primary"},
    {"id": "cancel", "label": "Cancel task", "style": "secondary"}
  ],
  "waitingFor": "Complete Google sign-in on device"
}

### Send Message Confirmation:
{
  "type": "CONFIRMATION_REQUIRED",
  "title": "Send Message?",
  "message": "I'm ready to send this message to John. Should I proceed?",
  "context": "WhatsApp chat with message typed: 'Hey, are we still meeting tomorrow?'",
  "options": [
    {"id": "send", "label": "Send it", "style": "primary"},
    {"id": "edit", "label": "Let me edit", "style": "secondary"},
    {"id": "cancel", "label": "Cancel", "style": "danger"}
  ]
}

## AUTONOMOUS ACTIONS (No pause needed)

DO NOT pause for:
- Clicking "Skip", "Maybe later", "Not now" buttons
- Dismissing promotional dialogs
- Navigating between screens
- Scrolling to find elements
- Clicking search bars and typing
- Opening/closing apps
- Any action that doesn't involve user data, payment, or irreversible changes

## OTHER BEHAVIORS

- If you see a skip button for non-essential screens, click it automatically
- If you see a search bar, click on it first, then type with submit=true to execute the search
- When typing in a search field, ALWAYS use mobile_type_keys with submit=true to trigger the search
- Alternatively, after typing you can click on a search suggestion from the list
- Use mobile_open_url for URLs instead of typing in address bar
- Always verify each step with a screenshot
- Give clear, friendly status updates
- Be proactive but respect user control for sensitive actions
- DO NOT use mobile_press_button with "enter" - it's not supported. Use submit=true on mobile_type_keys instead

In CONCIERGE mode, you use cloud APIs (Gmail, Drive) to perform tasks in the background.

Be concise but friendly. Guide the user through the process like a helpful assistant.`
        });

        // Try to load state on startup
        this.loadState();
    }

    private pendingDecision: any = null;
    private pausedContext: any = null;

    private saveState() {
        try {
            if (this.pendingDecision && this.pausedContext) {
                const state = {
                    pendingDecision: this.pendingDecision,
                    pausedContext: {
                        ...this.pausedContext,
                        chat: undefined // Cannot serialize chat object
                    },
                    chatHistory: this.chatHistory
                };
                fs.writeFileSync(this.STATE_FILE, JSON.stringify(state, null, 2));
                console.log('[Orchestrator] State saved to', this.STATE_FILE);
            } else {
                if (fs.existsSync(this.STATE_FILE)) {
                    fs.unlinkSync(this.STATE_FILE);
                    console.log('[Orchestrator] State cleared');
                }
            }
        } catch (error) {
            console.error('[Orchestrator] Failed to save state:', error);
        }
    }

    private loadState() {
        try {
            if (fs.existsSync(this.STATE_FILE)) {
                const data = fs.readFileSync(this.STATE_FILE, 'utf8');
                const state = JSON.parse(data);
                this.pendingDecision = state.pendingDecision;
                this.chatHistory = state.chatHistory || [];

                // Reconstruct paused context (chat object needs to be recreated)
                if (state.pausedContext) {
                    this.pausedContext = {
                        ...state.pausedContext,
                        chat: this.model.startChat({
                            history: this.chatHistory
                        })
                    };
                    console.log('[Orchestrator] State loaded from', this.STATE_FILE);
                }
            }
        } catch (error) {
            console.error('[Orchestrator] Failed to load state:', error);
        }
    }

    async processRequest(message: string, mode: 'concierge' | 'pilot', options?: { maxIterations?: number }) {
        console.log(`[Orchestrator] Processing: "${message}" in ${mode} mode`);

        const maxIterations = options?.maxIterations || 30;

        // Add mode context to the message
        const contextualMessage = `[Mode: ${mode.toUpperCase()}] ${message}

Remember: You must complete the ENTIRE task. After each action, take a screenshot to see the result and continue with the next step. Don't stop until the goal is fully achieved. If you encounter a login/auth screen, pause and ask for user guidance using the AUTH_DECISION_REQUIRED format.`;

        try {
            // Start a chat with the model
            const chat = this.model.startChat({
                history: this.chatHistory
            });

            const allActions: any[] = [];
            const allResults: any[] = [];
            let finalResponse = '';
            let iterations = 0;

            // Send the initial message
            let result = await chat.sendMessage(contextualMessage);
            let response = result.response;

            // Agentic loop - continue until no more function calls or max iterations
            while (iterations < maxIterations) {
                const functionCalls = response.functionCalls();

                if (!functionCalls || functionCalls.length === 0) {
                    // No more function calls - check if it's a human interaction request
                    const responseText = response.text();

                    // Try to parse as JSON to check for any human interaction type
                    try {
                        // Improved regex to find JSON object even with markdown code blocks
                        const jsonMatch = responseText.match(/\{[\s\S]*"type"\s*:\s*"(AUTH_DECISION_REQUIRED|USER_ACTION_REQUIRED|CONFIRMATION_REQUIRED|INFO_REQUIRED)"[\s\S]*\}/);
                        if (jsonMatch) {
                            // Clean up any potential markdown code block syntax
                            let jsonStr = jsonMatch[0];

                            const interaction = JSON.parse(jsonStr);
                            console.log(`[Orchestrator] Human interaction required (${interaction.type}):`, interaction.title);

                            // Store context for resumption
                            this.pendingDecision = interaction;
                            this.pausedContext = {
                                chat, // This will be lost on restart, but recreated in loadState
                                allActions,
                                allResults,
                                iterations,
                                originalMessage: message,
                                mode,
                                maxIterations
                            };

                            // Save state to file
                            this.saveState();

                            // Return with interaction required flag
                            return {
                                response: interaction.message,
                                actions: allActions,
                                results: allResults.map(r => ({
                                    tool: r.name,
                                    output: r.result?.data || r.result
                                })),
                                toolOutput: allResults.map(r => r.result?.data || r.result).filter(Boolean),
                                iterations: iterations,
                                decisionRequired: true,
                                decision: interaction,
                                workflowStatus: {
                                    phase: 'waiting_for_user',
                                    currentAction: interaction.waitingFor || interaction.title,
                                    completedSteps: iterations
                                }
                            };
                        }
                    } catch (e) {
                        console.log('[Orchestrator] Failed to parse potential JSON interaction:', e);
                        // Not JSON, continue normally
                    }

                    finalResponse = responseText;
                    break;
                }

                iterations++;
                console.log(`[Orchestrator] Iteration ${iterations}/${maxIterations}`);

                // Execute the function calls
                const iterationResults = [];

                for (const call of functionCalls) {
                    console.log(`[Orchestrator] Executing tool: ${call.name}`, call.args);
                    allActions.push({
                        tool: call.name,
                        args: call.args
                    });

                    // Execute the tool
                    const toolResult = await this.executeAction(call.name, call.args);
                    iterationResults.push({
                        name: call.name,
                        result: toolResult
                    });
                    allResults.push({
                        name: call.name,
                        result: toolResult
                    });
                }

                // Send the results back to Gemini
                const functionResponses = iterationResults.map(r => ({
                    functionResponse: {
                        name: r.name,
                        response: r.result
                    }
                }));

                // Get the next response (may contain more function calls)
                result = await chat.sendMessage(functionResponses);
                response = result.response;
            }

            if (iterations >= maxIterations) {
                finalResponse = `Task stopped after ${maxIterations} iterations. ${response.text() || 'Please try a simpler task or break it into smaller steps.'}`;
            }

            // Update chat history
            this.chatHistory.push(
                { role: 'user', parts: [{ text: contextualMessage }] },
                { role: 'model', parts: [{ text: finalResponse }] }
            );

            // Clear state if task completed
            this.pendingDecision = null;
            this.pausedContext = null;
            this.saveState();

            // Format results for better display
            const formattedResults = allResults.map(r => {
                if (r.result && r.result.data) {
                    return {
                        tool: r.name,
                        output: r.result.data
                    };
                }
                return {
                    tool: r.name,
                    output: r.result
                };
            });

            console.log(`[Orchestrator] Completed in ${iterations} iterations, ${allActions.length} actions`);

            return {
                response: finalResponse,
                actions: allActions,
                results: formattedResults,
                // Include raw tool output for display
                toolOutput: allResults.map(r => r.result?.data || r.result).filter(Boolean),
                iterations: iterations
            };
        } catch (error) {
            console.error('[Orchestrator] Error:', error);
            throw error;
        }
    }

    async executeAction(toolName: string, args: any) {
        // Route execution to the correct server/module
        if (toolName.startsWith('mobile_')) {
            return await executeMobileTool(toolName, args);
        } else {
            return await executeGoogleTool(toolName, args);
        }
    }

    async resumeWithDecision(decision: string, credentials?: { email?: string; password?: string }, inputData?: Record<string, string>) {
        if (!this.pausedContext || !this.pendingDecision) {
            // Try to load from file if not in memory
            this.loadState();
            if (!this.pausedContext || !this.pendingDecision) {
                throw new Error('No pending decision to resume');
            }
        }

        console.log(`[Orchestrator] Resuming with decision: ${decision}`);

        const { chat, allActions, allResults, iterations, originalMessage, mode, maxIterations: storedMax } = this.pausedContext;
        const maxIterations = storedMax || 30;
        const interactionType = this.pendingDecision.type;
        let resumeMessage = '';

        // Handle based on decision ID and interaction type
        switch (decision) {
            case 'done':
            case 'continue':
            case 'completed':
                // User completed the action on device
                resumeMessage = `The user has completed the required action on the device. Take a screenshot to see the current state and continue with the task: ${originalMessage}`;
                break;

            case 'signin':
            case 'login':
                if (credentials?.email && credentials?.password) {
                    resumeMessage = `The user provided credentials. Enter the email "${credentials.email}" and password "${credentials.password}" to sign in. Then continue with the original task: ${originalMessage}`;
                } else if (credentials?.email) {
                    resumeMessage = `The user provided email "${credentials.email}". Enter this email and proceed. If a password is needed, ask the user. Then continue with the original task: ${originalMessage}`;
                } else {
                    // User will sign in on device
                    resumeMessage = `The user is signing in on the device. Wait a moment, then take a screenshot to see if sign-in is complete. Continue with the task: ${originalMessage}`;
                }
                break;

            case 'skip':
                const skipLabel = this.pendingDecision.options?.find((o: any) => o.id === 'skip')?.label || 'Skip';
                resumeMessage = `The user chose to skip. Click on the button that says "${skipLabel}" or similar (like "Use without account", "Skip", "Maybe later", "Continue as guest"). Then continue with the original task: ${originalMessage}`;
                break;

            case 'send':
            case 'confirm':
            case 'approve':
                resumeMessage = `The user approved the action. Proceed to execute it and continue with the task: ${originalMessage}`;
                break;

            case 'edit':
                if (inputData) {
                    const editInfo = Object.entries(inputData).map(([k, v]) => `${k}: ${v}`).join(', ');
                    resumeMessage = `The user wants to edit. Updated information: ${editInfo}. Apply these changes and continue with the task: ${originalMessage}`;
                } else {
                    resumeMessage = `The user wants to edit. Take a screenshot and wait for further input.`;
                }
                break;

            case 'cancel':
                this.pendingDecision = null;
                this.pausedContext = null;
                this.saveState(); // Clear state file
                return {
                    response: 'Task cancelled. Let me know if you need anything else!',
                    actions: allActions,
                    results: allResults.map((r: any) => ({
                        tool: r.name,
                        output: r.result?.data || r.result
                    })),
                    toolOutput: allResults.map((r: any) => r.result?.data || r.result).filter(Boolean),
                    iterations: iterations,
                    workflowStatus: {
                        phase: 'completed',
                        completedSteps: iterations
                    }
                };

            default:
                // Handle custom input or unknown decisions
                if (inputData && Object.keys(inputData).length > 0) {
                    const inputInfo = Object.entries(inputData).map(([k, v]) => `${k}: ${v}`).join(', ');
                    resumeMessage = `The user provided this information: ${inputInfo}. Use this to continue with the task: ${originalMessage}`;
                } else {
                    resumeMessage = `The user responded with: "${decision}". Handle this appropriately and continue with the task: ${originalMessage}`;
                }
        }

        // Clear the pending decision
        this.pendingDecision = null;
        this.pausedContext = null;
        this.saveState(); // Clear state file

        // Continue the chat with the user's decision
        let result = await chat.sendMessage(resumeMessage);
        let response = result.response;
        let currentIterations = iterations;

        // Continue the agentic loop
        while (currentIterations < maxIterations) {
            const functionCalls = response.functionCalls();

            if (!functionCalls || functionCalls.length === 0) {
                const responseText = response.text();

                // Check for another auth decision
                try {
                    const jsonMatch = responseText.match(/\{[\s\S]*"type"\s*:\s*"(AUTH_DECISION_REQUIRED|USER_ACTION_REQUIRED|CONFIRMATION_REQUIRED|INFO_REQUIRED)"[\s\S]*\}/);
                    if (jsonMatch) {
                        const authDecision = JSON.parse(jsonMatch[0]);
                        console.log('[Orchestrator] Another auth decision required:', authDecision);

                        this.pendingDecision = authDecision;
                        this.pausedContext = {
                            chat,
                            allActions,
                            allResults,
                            iterations: currentIterations,
                            originalMessage,
                            mode,
                            maxIterations
                        };

                        this.saveState();

                        return {
                            response: `${authDecision.app} is asking for authentication.`,
                            actions: allActions,
                            results: allResults.map((r: any) => ({
                                tool: r.name,
                                output: r.result?.data || r.result
                            })),
                            toolOutput: allResults.map((r: any) => r.result?.data || r.result).filter(Boolean),
                            iterations: currentIterations,
                            decisionRequired: true,
                            decision: authDecision
                        };
                    }
                } catch (e) {
                    // Not JSON
                }

                // Update chat history
                this.chatHistory.push(
                    { role: 'user', parts: [{ text: resumeMessage }] },
                    { role: 'model', parts: [{ text: responseText }] }
                );

                return {
                    response: responseText,
                    actions: allActions,
                    results: allResults.map((r: any) => ({
                        tool: r.name,
                        output: r.result?.data || r.result
                    })),
                    toolOutput: allResults.map((r: any) => r.result?.data || r.result).filter(Boolean),
                    iterations: currentIterations
                };
            }

            currentIterations++;
            console.log(`[Orchestrator] Resume iteration ${currentIterations}/${maxIterations}`);

            // Execute function calls
            const iterationResults = [];
            for (const call of functionCalls) {
                console.log(`[Orchestrator] Executing tool: ${call.name}`, call.args);
                allActions.push({
                    tool: call.name,
                    args: call.args
                });

                const toolResult = await this.executeAction(call.name, call.args);
                iterationResults.push({
                    name: call.name,
                    result: toolResult
                });
                allResults.push({
                    name: call.name,
                    result: toolResult
                });
            }

            // Send results back
            const functionResponses = iterationResults.map(r => ({
                functionResponse: {
                    name: r.name,
                    response: r.result
                }
            }));

            result = await chat.sendMessage(functionResponses);
            response = result.response;

            await new Promise(resolve => setTimeout(resolve, 500));
        }

        return {
            response: `Task completed after ${currentIterations} iterations.`,
            actions: allActions,
            results: allResults.map((r: any) => ({
                tool: r.name,
                output: r.result?.data || r.result
            })),
            toolOutput: allResults.map((r: any) => r.result?.data || r.result).filter(Boolean),
            iterations: currentIterations
        };
    }

    hasPendingDecision(): boolean {
        return this.pendingDecision !== null;
    }

    getPendingDecision(): any {
        return this.pendingDecision;
    }

    clearHistory() {
        this.chatHistory = [];
        this.pendingDecision = null;
        this.pausedContext = null;
        if (fs.existsSync(this.STATE_FILE)) {
            fs.unlinkSync(this.STATE_FILE);
        }
    }
}
