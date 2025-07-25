#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const server_1 = require("./server");
const client_1 = require("./client");
const program = new commander_1.Command();
program
    .name('broadcast-server')
    .description('A simple WebSocket broadcast server with CLI interface')
    .version('1.0.0');
program
    .command('start')
    .description('Start the broadcast server')
    .option('-p, --port <port>', 'Port to listen on', '8080')
    .action(async (options) => {
    const port = parseInt(options.port, 10);
    if (isNaN(port) || port < 1 || port > 65535) {
        console.error(chalk_1.default.red('Error: Invalid port number. Port must be between 1 and 65535.'));
        process.exit(1);
    }
    console.log(chalk_1.default.blue(`Starting broadcast server on port ${port}...`));
    const server = new server_1.BroadcastServer(port);
    server.on('error', (error) => {
        console.error(chalk_1.default.red('Server error:'), error.message);
        process.exit(1);
    });
    // Handle graceful shutdown
    const gracefulShutdown = async () => {
        console.log(chalk_1.default.yellow('\nShutting down server...'));
        try {
            await server.close();
            console.log(chalk_1.default.green('Server shut down gracefully'));
            process.exit(0);
        }
        catch (error) {
            console.error(chalk_1.default.red('Error during shutdown:'), error);
            process.exit(1);
        }
    };
    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
    console.log(chalk_1.default.green(`✅ Broadcast server started successfully!`));
    console.log(chalk_1.default.blue(`📡 Server listening on ws://localhost:${port}`));
    console.log(chalk_1.default.gray(`👥 Connected clients: ${server.getConnectedClientsCount()}`));
    console.log(chalk_1.default.gray('Press Ctrl+C to stop the server'));
    // Log client count updates every 10 seconds when there are clients
    setInterval(() => {
        const clientCount = server.getConnectedClientsCount();
        if (clientCount > 0) {
            console.log(chalk_1.default.gray(`👥 Connected clients: ${clientCount}`));
        }
    }, 10000);
});
program
    .command('connect')
    .description('Connect to the broadcast server as a client')
    .option('-u, --url <url>', 'WebSocket URL to connect to', 'ws://localhost:8080')
    .action(async (options) => {
    const client = new client_1.BroadcastClient(options.url);
    try {
        await client.connect();
    }
    catch (error) {
        console.error(chalk_1.default.red('Failed to connect:'), error.message);
        console.log(chalk_1.default.blue('Make sure the server is running with: broadcast-server start'));
        process.exit(1);
    }
});
// Handle unknown commands
program.on('command:*', () => {
    console.error(chalk_1.default.red('Invalid command: %s'), program.args.join(' '));
    console.log(chalk_1.default.blue('See --help for a list of available commands.'));
    process.exit(1);
});
// Show help if no command is provided
if (process.argv.length <= 2) {
    program.help();
}
program.parse(process.argv);
//# sourceMappingURL=cli.js.map