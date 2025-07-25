#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { BroadcastServer } from './server';
import { BroadcastClient } from './client';

const program = new Command();

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
      console.error(chalk.red('Error: Invalid port number. Port must be between 1 and 65535.'));
      process.exit(1);
    }

    console.log(chalk.blue(`Starting broadcast server on port ${port}...`));
    
    const server = new BroadcastServer(port);
    
    server.on('error', (error: Error) => {
      console.error(chalk.red('Server error:'), error.message);
      process.exit(1);
    });

    // Handle graceful shutdown
    const gracefulShutdown = async () => {
      console.log(chalk.yellow('\nShutting down server...'));
      try {
        await server.close();
        console.log(chalk.green('Server shut down gracefully'));
        process.exit(0);
      } catch (error) {
        console.error(chalk.red('Error during shutdown:'), error);
        process.exit(1);
      }
    };

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);

    console.log(chalk.green(`✅ Broadcast server started successfully!`));
    console.log(chalk.blue(`📡 Server listening on ws://localhost:${port}`));
    console.log(chalk.gray(`👥 Connected clients: ${server.getConnectedClientsCount()}`));
    console.log(chalk.gray('Press Ctrl+C to stop the server'));

    // Log client count updates every 10 seconds when there are clients
    setInterval(() => {
      const clientCount = server.getConnectedClientsCount();
      if (clientCount > 0) {
        console.log(chalk.gray(`👥 Connected clients: ${clientCount}`));
      }
    }, 10000);
  });

program
  .command('connect')
  .description('Connect to the broadcast server as a client')
  .option('-u, --url <url>', 'WebSocket URL to connect to', 'ws://localhost:8080')
  .action(async (options) => {
    const client = new BroadcastClient(options.url);
    
    try {
      await client.connect();
    } catch (error) {
      console.error(chalk.red('Failed to connect:'), (error as Error).message);
      console.log(chalk.blue('Make sure the server is running with: broadcast-server start'));
      process.exit(1);
    }
  });

// Handle unknown commands
program.on('command:*', () => {
  console.error(chalk.red('Invalid command: %s'), program.args.join(' '));
  console.log(chalk.blue('See --help for a list of available commands.'));
  process.exit(1);
});

// Show help if no command is provided
if (process.argv.length <= 2) {
  program.help();
}

program.parse(process.argv);
