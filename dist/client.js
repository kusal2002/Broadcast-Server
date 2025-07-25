"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BroadcastClient = void 0;
const ws_1 = __importDefault(require("ws"));
const readline = __importStar(require("readline"));
const chalk_1 = __importDefault(require("chalk"));
class BroadcastClient {
    constructor(serverUrl = 'ws://localhost:8080') {
        this.socket = null;
        this.isConnected = false;
        this.username = null;
        this.serverUrl = serverUrl;
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
    }
    async connect() {
        return new Promise((resolve, reject) => {
            console.log(chalk_1.default.blue(`Connecting to ${this.serverUrl}...`));
            this.socket = new ws_1.default(this.serverUrl);
            this.socket.on('open', () => {
                this.isConnected = true;
                console.log(chalk_1.default.green('Connected to server!'));
                this.setupMessageHandling();
                resolve();
            });
            this.socket.on('error', (error) => {
                console.error(chalk_1.default.red('Connection error:'), error.message);
                reject(error);
            });
            this.socket.on('close', () => {
                this.isConnected = false;
                console.log(chalk_1.default.yellow('Disconnected from server'));
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
    setupMessageHandling() {
        if (!this.socket)
            return;
        this.socket.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                this.handleServerMessage(message);
            }
            catch (error) {
                console.error(chalk_1.default.red('Error parsing server message:'), error);
            }
        });
        this.startInputLoop();
    }
    handleServerMessage(message) {
        const timestamp = new Date(message.timestamp).toLocaleTimeString();
        switch (message.type) {
            case 'message':
                if (message.username) {
                    console.log(chalk_1.default.cyan(`[${timestamp}] ${message.username}: ${message.content}`));
                }
                else {
                    console.log(chalk_1.default.gray(`[${timestamp}] Server: ${message.content}`));
                }
                break;
            case 'join':
                console.log(chalk_1.default.green(`[${timestamp}] ${message.content}`));
                break;
            case 'leave':
                console.log(chalk_1.default.yellow(`[${timestamp}] ${message.content}`));
                break;
            case 'error':
                console.log(chalk_1.default.red(`[${timestamp}] Error: ${message.content}`));
                break;
            default:
                console.log(chalk_1.default.gray(`[${timestamp}] ${message.content || 'Unknown message'}`));
        }
        // Re-prompt for input
        if (this.username) {
            this.rl.prompt();
        }
    }
    startInputLoop() {
        if (!this.username) {
            this.rl.question(chalk_1.default.blue('Enter your username: '), (username) => {
                this.username = username.trim();
                if (this.username) {
                    this.sendMessage(this.username);
                    console.log(chalk_1.default.green(`Welcome ${this.username}! You can now type messages.`));
                    this.rl.setPrompt(chalk_1.default.magenta(`${this.username}> `));
                    this.rl.prompt();
                }
                else {
                    console.log(chalk_1.default.red('Username cannot be empty'));
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
            console.log(chalk_1.default.yellow('\nGoodbye!'));
            this.disconnect();
        });
    }
    sendMessage(message) {
        if (this.socket && this.socket.readyState === ws_1.default.OPEN) {
            this.socket.send(message);
        }
        else {
            console.log(chalk_1.default.red('Not connected to server'));
        }
    }
    showHelp() {
        console.log(chalk_1.default.blue('\nAvailable commands:'));
        console.log(chalk_1.default.blue('/help - Show this help message'));
        console.log(chalk_1.default.blue('/quit or /exit - Disconnect from server'));
        console.log(chalk_1.default.blue('Type any message to broadcast to all users\n'));
    }
    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
        this.cleanup();
    }
    cleanup() {
        this.isConnected = false;
        this.rl.close();
        process.exit(0);
    }
    isConnectedToServer() {
        return this.isConnected;
    }
}
exports.BroadcastClient = BroadcastClient;
//# sourceMappingURL=client.js.map