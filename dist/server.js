"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BroadcastServer = void 0;
const ws_1 = __importDefault(require("ws"));
const events_1 = require("events");
class BroadcastServer extends events_1.EventEmitter {
    constructor(port = 8080) {
        super();
        this.clients = new Map();
        this.port = port;
        this.server = new ws_1.default.Server({ port: this.port });
        this.setupServerEvents();
    }
    setupServerEvents() {
        this.server.on('connection', (socket) => {
            const clientId = this.generateClientId();
            const client = {
                id: clientId,
                socket,
            };
            this.clients.set(clientId, client);
            console.log(`Client ${clientId} connected. Total clients: ${this.clients.size}`);
            // Send welcome message to the new client
            this.sendToClient(client, {
                type: 'message',
                content: 'Welcome to the broadcast server! Type your username to get started.',
                timestamp: new Date().toISOString(),
            });
            socket.on('message', (data) => {
                this.handleClientMessage(client, data);
            });
            socket.on('close', () => {
                this.handleClientDisconnect(client);
            });
            socket.on('error', (error) => {
                console.error(`Client ${clientId} error:`, error);
                this.handleClientDisconnect(client);
            });
        });
        this.server.on('error', (error) => {
            console.error('Server error:', error);
            this.emit('error', error);
        });
    }
    handleClientMessage(client, data) {
        try {
            const message = data.toString().trim();
            if (!client.username) {
                // First message is treated as username
                client.username = message;
                console.log(`Client ${client.id} set username: ${client.username}`);
                // Notify all clients about the new user
                this.broadcast({
                    type: 'join',
                    username: client.username,
                    content: `${client.username} joined the chat`,
                    timestamp: new Date().toISOString(),
                    clientId: client.id,
                }, client.id);
                // Send confirmation to the client
                this.sendToClient(client, {
                    type: 'message',
                    content: `Welcome ${client.username}! You can now send messages.`,
                    timestamp: new Date().toISOString(),
                });
            }
            else {
                // Regular message broadcast
                const broadcastMessage = {
                    type: 'message',
                    username: client.username,
                    content: message,
                    timestamp: new Date().toISOString(),
                    clientId: client.id,
                };
                console.log(`Message from ${client.username}: ${message}`);
                this.broadcast(broadcastMessage);
            }
        }
        catch (error) {
            console.error(`Error handling message from client ${client.id}:`, error);
            this.sendToClient(client, {
                type: 'error',
                content: 'Error processing your message',
                timestamp: new Date().toISOString(),
            });
        }
    }
    handleClientDisconnect(client) {
        if (this.clients.has(client.id)) {
            console.log(`Client ${client.id} (${client.username || 'unknown'}) disconnected`);
            if (client.username) {
                // Notify other clients about the disconnection
                this.broadcast({
                    type: 'leave',
                    username: client.username,
                    content: `${client.username} left the chat`,
                    timestamp: new Date().toISOString(),
                    clientId: client.id,
                }, client.id);
            }
            this.clients.delete(client.id);
            console.log(`Total clients: ${this.clients.size}`);
        }
    }
    broadcast(message, excludeClientId) {
        const messageString = JSON.stringify(message);
        for (const [clientId, client] of this.clients) {
            if (excludeClientId && clientId === excludeClientId) {
                continue;
            }
            if (client.socket.readyState === ws_1.default.OPEN) {
                try {
                    client.socket.send(messageString);
                }
                catch (error) {
                    console.error(`Error sending message to client ${clientId}:`, error);
                    this.handleClientDisconnect(client);
                }
            }
        }
    }
    sendToClient(client, message) {
        if (client.socket.readyState === ws_1.default.OPEN) {
            try {
                client.socket.send(JSON.stringify(message));
            }
            catch (error) {
                console.error(`Error sending message to client ${client.id}:`, error);
            }
        }
    }
    generateClientId() {
        return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    getConnectedClientsCount() {
        return this.clients.size;
    }
    getPort() {
        return this.port;
    }
    close() {
        return new Promise((resolve) => {
            // Close all client connections
            for (const [, client] of this.clients) {
                if (client.socket.readyState === ws_1.default.OPEN) {
                    client.socket.close();
                }
            }
            this.clients.clear();
            // Close the server
            this.server.close(() => {
                console.log('Server closed');
                resolve();
            });
        });
    }
}
exports.BroadcastServer = BroadcastServer;
//# sourceMappingURL=server.js.map