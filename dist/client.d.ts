export interface BroadcastMessage {
    type: 'message' | 'join' | 'leave' | 'error';
    username?: string;
    content?: string;
    timestamp: string;
    clientId?: string;
}
export declare class BroadcastClient {
    private socket;
    private rl;
    private serverUrl;
    private isConnected;
    private username;
    constructor(serverUrl?: string);
    connect(): Promise<void>;
    private setupMessageHandling;
    private handleServerMessage;
    private startInputLoop;
    private sendMessage;
    private showHelp;
    disconnect(): void;
    private cleanup;
    isConnectedToServer(): boolean;
}
//# sourceMappingURL=client.d.ts.map