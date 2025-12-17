/**
 * WebSocket Client for Real-time Terminal Collaboration
 */
class WebSocketClient {
    constructor() {
        this.socket = null;
        this.reconnectInterval = 5000; // 5 seconds
        this.maxReconnectAttempts = 10;
        this.reconnectAttempts = 0;
        this.messageQueue = [];
        this.eventHandlers = new Map();
        this.connected = false;
        this.sessionId = null;
        this.userId = null;
    }

    /**
     * Initialize WebSocket connection
     * @param {string} sessionId - Shared terminal session ID
     * @param {string} userId - Current user ID
     * @param {string} token - Authentication token
     */
    initialize(sessionId, userId, token) {
        this.sessionId = sessionId;
        this.userId = userId;
        this.token = token;

        // Build WebSocket URL
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const hostname = process.env.WEBSOCKET_HOST || 'ws.rinawarptech.com';
        const path = `/api/terminal/collab/${sessionId}?userId=${userId}&token=${token}`;

        this.wsUrl = `${protocol}//${hostname}${path}`;

        this.connect();
    }

    /**
     * Connect to WebSocket server
     */
    connect() {
        console.log(`[WebSocket] Connecting to ${this.wsUrl}`);

        this.socket = new WebSocket(this.wsUrl);

        this.socket.onopen = () => {
            this.connected = true;
            this.reconnectAttempts = 0;
            console.log('[WebSocket] Connection established');

            // Send queued messages
            while (this.messageQueue.length > 0) {
                const message = this.messageQueue.shift();
                this.send(message);
            }

            this.triggerEvent('connected');
        };

        this.socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.triggerEvent('message', data);
            } catch (error) {
                console.error('[WebSocket] Error parsing message:', error);
            }
        };

        this.socket.onclose = (event) => {
            this.connected = false;
            console.log(`[WebSocket] Connection closed: ${event.code} ${event.reason}`);

            this.triggerEvent('disconnected');

            // Attempt to reconnect
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                this.reconnectAttempts++;
                console.log(`[WebSocket] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
                setTimeout(() => this.connect(), this.reconnectInterval);
            } else {
                console.error('[WebSocket] Max reconnection attempts reached');
            }
        };

        this.socket.onerror = (error) => {
            console.error('[WebSocket] Error:', error);
            this.triggerEvent('error', error);
        };
    }

    /**
     * Send message through WebSocket
     * @param {Object} message - Message to send
     */
    send(message) {
        if (!this.connected) {
            console.log('[WebSocket] Not connected, queueing message');
            this.messageQueue.push(message);
            return;
        }

        try {
            const messageWithMetadata = {
                ...message,
                timestamp: Date.now(),
                userId: this.userId,
                sessionId: this.sessionId
            };

            const messageString = JSON.stringify(messageWithMetadata);
            this.socket.send(messageString);
        } catch (error) {
            console.error('[WebSocket] Error sending message:', error);
        }
    }

    /**
     * Register event handler
     * @param {string} eventName - Event name
     * @param {Function} handler - Event handler function
     */
    on(eventName, handler) {
        if (!this.eventHandlers.has(eventName)) {
            this.eventHandlers.set(eventName, []);
        }
        this.eventHandlers.get(eventName).push(handler);
    }

    /**
     * Remove event handler
     * @param {string} eventName - Event name
     * @param {Function} handler - Event handler function
     */
    off(eventName, handler) {
        const handlers = this.eventHandlers.get(eventName);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index !== -1) {
                handlers.splice(index, 1);
            }
        }
    }

    /**
     * Trigger event
     * @param {string} eventName - Event name
     * @param {*} data - Event data
     */
    triggerEvent(eventName, data) {
        const handlers = this.eventHandlers.get(eventName);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`[WebSocket] Error in ${eventName} handler:`, error);
                }
            });
        }
    }

    /**
     * Close WebSocket connection
     */
    close() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.connected = false;
    }

    /**
     * Get connection status
     * @returns {boolean} Connection status
     */
    isConnected() {
        return this.connected;
    }
}

// Singleton instance
const websocketClient = new WebSocketClient();

export default websocketClient;