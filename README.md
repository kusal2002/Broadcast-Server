# Broadcast Server

A simple WebSocket-based broadcast server that allows multiple clients to connect and send messages that are broadcasted to all connected clients in real-time.

## Features

- **Real-time messaging**: Messages are instantly broadcasted to all connected clients
- **Multi-client support**: Handle multiple clients connecting and disconnecting gracefully
- **CLI interface**: Easy-to-use command-line interface for both server and client
- **Username system**: Clients can set usernames for personalized messaging
- **Graceful shutdown**: Proper cleanup when stopping the server or disconnecting clients
- **Error handling**: Robust error handling for connection issues
- **Colorized output**: Beautiful terminal output with color coding

## Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```

## Usage

### Starting the Server

Start the broadcast server on the default port (8080):
```bash
npm run dev:server
# or after building:
npm start start
```

Start the server on a custom port:
```bash
npm run dev -- start --port 3000
# or after building:
npm start start --port 3000
```

### Connecting as a Client

Connect to the server on the default URL (ws://localhost:8080):
```bash
npm run dev:client
# or after building:
npm start connect
```

Connect to a custom server URL:
```bash
npm run dev -- connect --url ws://localhost:3000
# or after building:
npm start connect --url ws://localhost:3000
```

### Client Commands

Once connected as a client, you can use these commands:

- Type any message to broadcast it to all connected clients
- `/help` - Show available commands
- `/quit` or `/exit` - Disconnect from the server
- `Ctrl+C` - Force disconnect and exit

## Example Usage

1. **Terminal 1 - Start the server:**
   ```bash
   npm run dev:server
   ```
   Output:
   ```
   Starting broadcast server on port 8080...
   ✅ Broadcast server started successfully!
   📡 Server listening on ws://localhost:8080
   👥 Connected clients: 0
   Press Ctrl+C to stop the server
   ```

2. **Terminal 2 - Connect first client:**
   ```bash
   npm run dev:client
   ```
   ```
   Connecting to ws://localhost:8080...
   Connected to server!
   Enter your username: Alice
   Welcome Alice! You can now type messages.
   Alice> Hello everyone!
   ```

3. **Terminal 3 - Connect second client:**
   ```bash
   npm run dev:client
   ```
   ```
   Connecting to ws://localhost:8080...
   Connected to server!
   Enter your username: Bob
   Welcome Bob! You can now type messages.
   [10:30:25] Alice joined the chat
   Bob> Hi Alice!
   [10:30:32] Alice: Hello everyone!
   [10:30:40] Alice: Hi Bob! Welcome to the chat
   ```

## Project Structure

```
src/
├── cli.ts          # Command-line interface
├── server.ts       # WebSocket server implementation
└── client.ts       # WebSocket client implementation
```

## Technical Details

- **Language**: TypeScript
- **WebSocket Library**: `ws`
- **CLI Framework**: `commander`
- **Styling**: `chalk` for colorized terminal output
- **Message Format**: JSON-based message protocol
- **Port**: Default 8080 (configurable)

## Message Protocol

The server and clients communicate using JSON messages with the following format:

```typescript
interface BroadcastMessage {
  type: 'message' | 'join' | 'leave' | 'error';
  username?: string;
  content?: string;
  timestamp: string;
  clientId?: string;
}
```

## Error Handling

- Connection timeouts (5 seconds)
- Invalid port numbers
- Server connection failures
- Graceful handling of client disconnections
- Automatic cleanup of resources

## Development

### Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Run with ts-node (development)
- `npm run dev:server` - Start server in development mode
- `npm run dev:client` - Start client in development mode

### Testing

To test the broadcast server:

1. Start the server in one terminal
2. Connect multiple clients in separate terminals
3. Send messages from different clients
4. Verify that all clients receive all messages
5. Test disconnection scenarios

## Requirements Met

✅ **CLI Interface**: Commands `broadcast-server start` and `broadcast-server connect`  
✅ **Multiple Clients**: Support for multiple simultaneous connections  
✅ **Message Broadcasting**: All messages are sent to all connected clients  
✅ **Graceful Disconnection**: Proper cleanup when clients disconnect  
✅ **Error Handling**: Robust error handling throughout  
✅ **Real-time Communication**: Instant message delivery using WebSockets  
✅ **Configurable Port**: Server port can be configured via command line  

## Inspiration idea

[Project idea basis roadmap.sh](https://roadmap.sh/projects/broadcast-server)
