import WebSocket from 'ws';
import * as readline from 'readline';
import chalk from 'chalk';

export interface BroadcastMessage {
  type: 'message' | 'join' | 'leave' | 'error';
  username?: string;
  content?: string;
  timestamp: string;
  clientId?: string;
}

export class BroadcastClient {
  private socket: WebSocket | null = null;
  private rl: readline.Interface;
  private serverUrl: string;
  private isConnected: boolean = false;
  private username: string | null = null;

  constructor(serverUrl: string = 'ws://localhost:8080') {
    this.serverUrl = serverUrl;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  public async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(chalk.blue(`Connecting to ${this.serverUrl}...`));
      
      this.socket = new WebSocket(this.serverUrl);

      this.socket.on('open', () => {
        this.isConnected = true;
        console.log(chalk.green('Connected to server!'));
        this.setupMessageHandling();
        resolve();
      });

      this.socket.on('error', (error: Error) => {
        console.error(chalk.red('Connection error:'), error.message);
        reject(error);
      });

      this.socket.on('close', () => {
        this.isConnected = false;
        console.log(chalk.yellow('Disconnected from server'));
        this.cleanup();
      });

      // Set connection timeout
      setTimeout(() => {
        if (!this.isConnected) {
          reject(new Error('Connection timeout'));
        }
      }, 5000);
    });
  }

  private setupMessageHandling(): void {
    if (!this.socket) return;

    this.socket.on('message', (data: Buffer) => {
      try {
        const message: BroadcastMessage = JSON.parse(data.toString());
        this.handleServerMessage(message);
      } catch (error) {
        console.error(chalk.red('Error parsing server message:'), error);
      }
    });

    this.startInputLoop();
  }

  private handleServerMessage(message: BroadcastMessage): void {
    const timestamp = new Date(message.timestamp).toLocaleTimeString();
    
    switch (message.type) {
      case 'message':
        if (message.username) {
          console.log(chalk.cyan(`[${timestamp}] ${message.username}: ${message.content}`));
        } else {
          console.log(chalk.gray(`[${timestamp}] Server: ${message.content}`));
        }
        break;
      
      case 'join':
        console.log(chalk.green(`[${timestamp}] ${message.content}`));
        break;
      
      case 'leave':
        console.log(chalk.yellow(`[${timestamp}] ${message.content}`));
        break;
      
      case 'error':
        console.log(chalk.red(`[${timestamp}] Error: ${message.content}`));
        break;
      
      default:
        console.log(chalk.gray(`[${timestamp}] ${message.content || 'Unknown message'}`));
    }

    // Re-prompt for input
    if (this.username) {
      this.rl.prompt();
    }
  }

  private startInputLoop(): void {
    if (!this.username) {
      this.rl.question(chalk.blue('Enter your username: '), (username) => {
        this.username = username.trim();
        if (this.username) {
          this.sendMessage(this.username);
          console.log(chalk.green(`Welcome ${this.username}! You can now type messages.`));
          this.rl.setPrompt(chalk.magenta(`${this.username}> `));
          this.rl.prompt();
        } else {
          console.log(chalk.red('Username cannot be empty'));
          this.startInputLoop();
        }
      });
    }

    this.rl.on('line', (input) => {
      const message = input.trim();
      
      if (message === '/quit' || message === '/exit') {
        this.disconnect();
        return;
      }
      
      if (message === '/help') {
        this.showHelp();
        this.rl.prompt();
        return;
      }

      if (message && this.username) {
        this.sendMessage(message);
      }
      
      this.rl.prompt();
    });

    this.rl.on('SIGINT', () => {
      console.log(chalk.yellow('\nGoodbye!'));
      this.disconnect();
    });
  }

  private sendMessage(message: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    } else {
      console.log(chalk.red('Not connected to server'));
    }
  }

  private showHelp(): void {
    console.log(chalk.blue('\nAvailable commands:'));
    console.log(chalk.blue('/help - Show this help message'));
    console.log(chalk.blue('/quit or /exit - Disconnect from server'));
    console.log(chalk.blue('Type any message to broadcast to all users\n'));
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
    }
    this.cleanup();
  }

  private cleanup(): void {
    this.isConnected = false;
    this.rl.close();
    process.exit(0);
  }

  public isConnectedToServer(): boolean {
    return this.isConnected;
  }
}
