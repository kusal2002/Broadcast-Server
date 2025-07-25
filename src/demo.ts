#!/usr/bin/env node

/**
 * Demo script to showcase the broadcast server functionality
 * This script will start a server and simulate multiple clients
 */

import { BroadcastServer } from './server';
import { BroadcastClient } from './client';

async function demo() {
  console.log('🚀 Starting Broadcast Server Demo...\n');

  // Start the server
  console.log('1. Starting server on port 8080...');
  const server = new BroadcastServer(8080);
  
  // Wait a moment for server to start
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('✅ Server started successfully!\n');

  // Simulate multiple clients connecting
  console.log('2. Simulating client connections...');
  
  const clients: BroadcastClient[] = [];
  const usernames = ['Alice', 'Bob', 'Charlie'];

  for (let i = 0; i < usernames.length; i++) {
    const client = new BroadcastClient('ws://localhost:8080');
    clients.push(client);
    
    try {
      await client.connect();
      console.log(`✅ ${usernames[i]} connected`);
      
      // Simulate setting username and sending a message
      setTimeout(() => {
        // This would normally be handled by the CLI, but we'll simulate it
        console.log(`📝 ${usernames[i]} would set their username and send messages`);
      }, (i + 1) * 500);
      
    } catch (error) {
      console.error(`❌ Failed to connect ${usernames[i]}:`, error);
    }
  }

  console.log('\n📊 Demo Summary:');
  console.log(`- Server running on port ${server.getPort()}`);
  console.log(`- ${server.getConnectedClientsCount()} clients connected`);
  console.log('\nTo test manually:');
  console.log('1. Run: npm run test:server');
  console.log('2. In another terminal: npm run test:client');
  console.log('3. Enter a username and start chatting!');

  // Clean up after 5 seconds
  setTimeout(async () => {
    console.log('\n🧹 Cleaning up demo...');
    
    for (const client of clients) {
      client.disconnect();
    }
    
    await server.close();
    console.log('✅ Demo completed successfully!');
    process.exit(0);
  }, 5000);
}

// Run the demo if this file is executed directly
if (require.main === module) {
  demo().catch(error => {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  });
}
