# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start the Server
Open a terminal and run:
```bash
npm run test:server
```

### Step 3: Connect Clients
Open **new terminals** (as many as you want) and run:
```bash
npm run test:client
```

## 💬 Commands

### Server Commands
- `npm run test:server` - Start server on default port (8080)
- `npm run dev -- start --port 3000` - Start on custom port

### Client Commands  
- `npm run test:client` - Connect to default server
- `npm run dev -- connect --url ws://localhost:3000` - Connect to custom URL

### In-Chat Commands
- Type any message to broadcast to all users
- `/help` - Show help
- `/quit` or `/exit` - Disconnect
- `Ctrl+C` - Force quit

## 🎯 What You'll See

**Server Terminal:**
```
Starting broadcast server on port 8080...
✅ Broadcast server started successfully!
📡 Server listening on ws://localhost:8080
👥 Connected clients: 0
Press Ctrl+C to stop the server
```

**Client Terminal:**
```
Connecting to ws://localhost:8080...
Connected to server!
Enter your username: Alice
Welcome Alice! You can now type messages.
Alice> Hello everyone!
[10:30:25] Bob joined the chat
[10:30:32] Bob: Hi Alice!
```

## 🔧 Troubleshooting

**"Connection refused":**
- Make sure the server is running first
- Check if the port is correct

**"Port already in use":**
- Use a different port: `--port 3001`
- Or stop the existing process

**TypeScript errors:**
- Run `npm run build` to compile
- Use built version: `node dist/cli.js start`

## ✨ Features Included

✅ Real-time messaging  
✅ Multiple client support  
✅ Username system  
✅ Graceful disconnection  
✅ Error handling  
✅ Colorized output  
✅ CLI interface  
✅ Configurable ports  

Enjoy your broadcast server! 🎉
