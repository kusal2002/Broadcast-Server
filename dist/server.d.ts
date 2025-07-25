import WebSocket from 'ws';
import { EventEmitter } from 'events';
export interface Client {
    id: string;
    socket: WebSocket;
    username?: string;
}
export interface BroadcastMessage {
    type: 'message' | 'join' | 'leave' | 'error';
    username?: string;
    content?: string;
    timestamp: string;
    clientId?: string;
}
export declare class BroadcastServer extends EventEmitter {
    private server;
    private clients;
    private port;
    constructor(port?: number);
    private setupServerEvents;
    private handleClientMessage;
    private handleClientDisconnect;
    private broadcast;
    private sendToClient;
    private generateClientId;
    getConnectedClientsCount(): number;
    getPort(): number;
    close(): Promise<void>;
}
//# sourceMappingURL=server.d.ts.map