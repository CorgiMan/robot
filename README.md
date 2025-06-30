# Robot WebSocket State Monitor

A real-time Node.js application with a beautiful JavaScript frontend that monitors and displays 4 state values (a, b, c, d) transmitted over WebSocket every 100ms.

## Features

- **Real-time Updates**: State values update every 100ms via WebSocket
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Connection Status**: Visual indicator showing WebSocket connection status
- **Progress Bars**: Visual representation of each state value (0-100 scale)
- **Raw Data Display**: JSON representation of current state
- **Auto-reconnection**: Automatic reconnection on connection loss
- **Interactive**: Click on state cards to request immediate updates

## Project Structure

```
robot/
├── server.js              # Node.js WebSocket server
├── package.json           # Dependencies and scripts
├── public/
│   ├── index.html         # Main HTML file
│   ├── styles.css         # Modern CSS styling
│   ├── app.js            # Frontend JavaScript
│   └── reset.css         # CSS reset
└── README.md             # This file
```

## Installation

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Server**:
   ```bash
   npm start
   ```
   
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

3. **Open in Browser**:
   Navigate to `http://localhost:3000`

## How It Works

### Backend (Node.js)
- **Express Server**: Serves static files and handles HTTP requests
- **WebSocket Server**: Broadcasts state updates to all connected clients
- **State Generation**: Randomly generates 4 values (a, b, c, d) every 100ms
- **Real-time Broadcasting**: Sends state updates to all connected clients

### Frontend (Plain JavaScript)
- **WebSocket Client**: Connects to the server and receives real-time updates
- **State Management**: Handles incoming state data and updates the UI
- **Visual Feedback**: Animations and progress bars for state changes
- **Connection Handling**: Auto-reconnection and status indicators

## State Values

The application monitors 4 state values:
- **Value A**: Random integer (0-99)
- **Value B**: Random integer (0-99)
- **Value C**: Random integer (0-99)
- **Value D**: Random integer (0-99)

Each value is displayed as:
- Large numeric display
- Progress bar (0-100% scale)
- Updates every 100ms

## UI Components

### Header
- Application title with gradient text
- Connection status indicator (green = connected, red = disconnected, yellow = connecting)

### State Grid
- 4 cards displaying each state value
- Progress bars showing value as percentage
- Hover effects and animations
- Click to request immediate state update

### Info Panel
- Connection information (update rate, last update time, message count)
- Raw JSON data display
- Real-time statistics

## WebSocket Protocol

### Server → Client
```json
{
  "a": 42,
  "b": 73,
  "c": 15,
  "d": 89
}
```

### Client → Server
```json
{
  "type": "request_state"
}
```

## Development

### Adding New State Values
1. Update the `state` object in `server.js`
2. Add corresponding UI elements in `index.html`
3. Update the JavaScript handlers in `app.js`

### Customizing Update Frequency
Modify the `setInterval` delay in `server.js`:
```javascript
setInterval(() => {
  updateState();
  broadcastState();
}, 100); // Change 100 to desired milliseconds
```

### Styling
The application uses CSS custom properties for easy theming. Modify the `:root` variables in `styles.css` to change colors and styling.

## Browser Compatibility

- Modern browsers with WebSocket support
- Chrome 16+, Firefox 11+, Safari 7+, Edge 12+
- Responsive design works on mobile devices

## Troubleshooting

### Connection Issues
- Check if the server is running on port 3000
- Ensure no firewall is blocking the connection
- Check browser console for WebSocket errors

### Performance
- The application is optimized for real-time updates
- Consider reducing update frequency if performance is an issue
- Monitor browser memory usage with many concurrent connections

## License

MIT License - feel free to use and modify as needed. 