# Test Instructions

Follow these steps to test the broadcast server:

## Step 1: Start the Server

Open a terminal and run:
```bash
cd "d:\Projects\Broadcase sv"
npm run dev:server
```

You should see:
```
Starting broadcast server on port 8080...
✅ Broadcast server started successfully!
📡 Server listening on ws://localhost:8080
👥 Connected clients: 0
Press Ctrl+C to stop the server
```

## Step 2: Connect First Client

Open a **new terminal** and run:
```bash
cd "d:\Projects\Broadcase sv"
npm run dev:client
```

1. When prompted, enter a username (e.g., "Alice")
2. You should see a welcome message
3. You can now type messages

## Step 3: Connect Second Client

Open **another new terminal** and run:
```bash
cd "d:\Projects\Broadcase sv"
npm run dev:client
```

1. When prompted, enter a different username (e.g., "Bob")
2. You should see Alice's join message
3. Both clients can now send messages to each other

## Step 4: Test Broadcasting

- Type messages in either client terminal
- Verify that messages appear in both terminals
- Try connecting a third client
- Test disconnecting clients (type `/quit` or press Ctrl+C)

## Alternative: Using Built Version

After running `npm run build`, you can also use:

```bash
# Start server
node dist/cli.js start

# Connect client
node dist/cli.js connect
```

## Testing with Custom Port

```bash
# Start server on port 3000
npm run dev -- start --port 3000

# Connect to port 3000
npm run dev -- connect --url ws://localhost:3000
```
