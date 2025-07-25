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

export class BroadcastServer extends EventEmitter {
  private server: WebSocket.Server;
  private clients: Map<string, Client> = new Map();
  private port: number;

  constructor(port: number = 8080) {
    super();
    this.port = port;
    this.server = new WebSocket.Server({ port: this.port });
    this.setupServerEvents();
  }

  private setupServerEvents(): void {
    this.server.on('connection', (socket: WebSocket) => {
      const clientId = this.generateClientId();
      const client: Client = {
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

      socket.on('message', (data: Buffer) => {
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

  private handleClientMessage(client: Client, data: Buffer): void {
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
      } else {
        // Regular message broadcast
        const broadcastMessage: BroadcastMessage = {
          type: 'message',
          username: client.username,
          content: message,
          timestamp: new Date().toISOString(),
          clientId: client.id,
        };

        console.log(`Message from ${client.username}: ${message}`);
        this.broadcast(broadcastMessage);
      }
    } catch (error) {
      console.error(`Error handling message from client ${client.id}:`, error);
      this.sendToClient(client, {
        type: 'error',
        content: 'Error processing your message',
        timestamp: new Date().toISOString(),
      });
    }
  }

  private handleClientDisconnect(client: Client): void {
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

  private broadcast(message: BroadcastMessage, excludeClientId?: string): void {
    const messageString = JSON.stringify(message);
    
    for (const [clientId, client] of this.clients) {
      if (excludeClientId && clientId === excludeClientId) {
        continue;
      }

      if (client.socket.readyState === WebSocket.OPEN) {
        try {
          client.socket.send(messageString);
        } catch (error) {
          console.error(`Error sending message to client ${clientId}:`, error);
          this.handleClientDisconnect(client);
        }
      }
    }
  }

  private sendToClient(client: Client, message: BroadcastMessage): void {
    if (client.socket.readyState === WebSocket.OPEN) {
      try {
        client.socket.send(JSON.stringify(message));
      } catch (error) {
        console.error(`Error sending message to client ${client.id}:`, error);
      }
    }
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public getConnectedClientsCount(): number {
    return this.clients.size;
  }

  public getPort(): number {
    return this.port;
  }

  public close(): Promise<void> {
    return new Promise((resolve) => {
      // Close all client connections
      for (const [, client] of this.clients) {
        if (client.socket.readyState === WebSocket.OPEN) {
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
