import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeMcpClient, getMcpClient } from './mcp-client';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    const mcpClient = getMcpClient();
    res.json({
        status: 'ok',
        mcpConnected: mcpClient.isClientConnected()
    });
});

import { AgentOrchestrator } from './agent/orchestrator';

const orchestrator = new AgentOrchestrator();

// Initialize MCP client on startup
async function initializeServices() {
    console.log('[Server] Initializing services...');

    try {
        console.log('[Server] Connecting to mobile-mcp server...');
        await initializeMcpClient();
        console.log('[Server] Mobile MCP client connected successfully!');
    } catch (error) {
        console.warn('[Server] Mobile MCP client failed to connect. Device control will not be available.');
        console.warn('[Server] Make sure you have an emulator/simulator running.');
    }
}

// Agent Endpoint
app.post('/api/agent/chat', async (req, res) => {
    const { message, mode } = req.body;

    try {
        const result = await orchestrator.processRequest(message, mode || 'concierge');
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Clear chat history
app.post('/api/agent/clear', (req, res) => {
    orchestrator.clearHistory();
    res.json({ status: 'ok' });
});

// Resume with user decision (for human-in-the-loop interactions)
app.post('/api/agent/decision', async (req, res) => {
    const { decision, credentials, inputData } = req.body;

    try {
        if (!orchestrator.hasPendingDecision()) {
            return res.status(400).json({ error: 'No pending decision' });
        }

        const result = await orchestrator.resumeWithDecision(decision, credentials, inputData);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Check if there's a pending decision
app.get('/api/agent/decision', (req, res) => {
    res.json({
        hasPendingDecision: orchestrator.hasPendingDecision(),
        decision: orchestrator.getPendingDecision()
    });
});

// Set device for mobile-mcp
app.post('/api/device/set', (req, res) => {
    const { deviceId } = req.body;
    const mcpClient = getMcpClient();
    mcpClient.setDevice(deviceId);
    res.json({ status: 'ok', device: deviceId });
});

// Get current device
app.get('/api/device', (req, res) => {
    const mcpClient = getMcpClient();
    res.json({ device: mcpClient.getCurrentDevice() });
});

// Start server and initialize services
const server = app.listen(PORT, async () => {
    console.log(`Backend server running on port ${PORT}`);
    console.log(`Gemini API Key: ${process.env.GEMINI_API_KEY ? 'Set' : 'NOT SET - please set GEMINI_API_KEY in .env'}`);

    // Initialize MCP client after server starts
    await initializeServices();
});

// Graceful shutdown
const gracefulShutdown = () => {
    console.log('[Server] Received kill signal, shutting down gracefully');
    server.close(() => {
        console.log('[Server] Closed out remaining connections');
        process.exit(0);
    });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
