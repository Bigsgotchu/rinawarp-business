/**
 * WebSocket client for real-time token streaming
 * Handles connection to the RinaWarp Terminal Pro backend
 */

class StreamClient {
  constructor() {
    this.ws = null;
    this.clientId = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
    this.listeners = new Map();
    this.heartbeatInterval = null;
  }

  /**
   * Connect to WebSocket server
   * @param {string} url - WebSocket URL (default: ws://localhost:3001/stream)
   */
  connect(url = null) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('StreamClient: Already connected');
      return Promise.resolve();
    }

    const wsUrl =
      url || `ws://localhost:${process.env.REACT_APP_API_PORT || 3001}/stream`;

    try {
      this.ws = new WebSocket(wsUrl);

      return new Promise((resolve, reject) => {
        this.ws.onopen = () => {
          console.log('StreamClient: Connected to WebSocket');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.reconnectDelay = 1000;
          this.startHeartbeat();

          // Send client identification
          this.send({
            type: 'client_identify',
            timestamp: new Date().toISOString(),
          });

          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('StreamClient: Error parsing message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log(
            'StreamClient: WebSocket closed:',
            event.code,
            event.reason
          );
          this.isConnected = false;
          this.stopHeartbeat();

          if (
            event.code !== 1000 &&
            this.reconnectAttempts < this.maxReconnectAttempts
          ) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('StreamClient: WebSocket error:', error);
          this.isConnected = false;
          reject(error);
        };

        // Timeout for connection
        setTimeout(() => {
          if (!this.isConnected) {
            reject(new Error('Connection timeout'));
          }
        }, 10000);
      });
    } catch (error) {
      console.error('StreamClient: Connection error:', error);
      throw error;
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.isConnected = false;
    this.stopHeartbeat();
    this.reconnectAttempts = 0;
  }

  /**
   * Send message to server
   * @param {object} data - Message data
   */
  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('StreamClient: Cannot send message, not connected');
    }
  }

  /**
   * Handle incoming messages
   * @param {object} data - Message data
   */
  handleMessage(data) {
    const { type, ...payload } = data;

    // Emit to specific listeners
    if (this.listeners.has(type)) {
      this.listeners.get(type).forEach((callback) => {
        try {
          callback(payload);
        } catch (error) {
          console.error(`StreamClient: Error in ${type} listener:`, error);
        }
      });
    }

    // Emit to wildcard listeners
    if (this.listeners.has('*')) {
      this.listeners.get('*').forEach((callback) => {
        try {
          callback(type, payload);
        } catch (error) {
          console.error('StreamClient: Error in wildcard listener:', error);
        }
      });
    }
  }

  /**
   * Add event listener
   * @param {string} event - Event type
   * @param {function} callback - Callback function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   * @param {string} event - Event type
   * @param {function} callback - Callback function to remove
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
      if (callbacks.length === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Start heartbeat to keep connection alive
   */
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.send({
          type: 'heartbeat',
          timestamp: new Date().toISOString(),
        });
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  /**
   * Stop heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Schedule reconnection attempt
   */
  scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      30000
    );

    console.log(
      `StreamClient: Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`
    );

    setTimeout(() => {
      if (!this.isConnected) {
        this.connect().catch((error) => {
          console.error('StreamClient: Reconnection failed:', error);
        });
      }
    }, delay);
  }

  /**
   * Stream AI response tokens
   * @param {string} prompt - User prompt
   * @param {object} options - Streaming options
   */
  async streamAIResponse(prompt, options = {}) {
    const {
      provider = 'groq',
      temperature = 0.7,
      maxTokens = 1000,
      onToken,
      onComplete,
      onError,
    } = options;

    if (!this.isConnected) {
      await this.connect();
    }

    return new Promise((resolve, reject) => {
      const requestId = Math.random().toString(36).substr(2, 9);

      // Set up response handlers
      const tokenHandler = (data) => {
        if (data.requestId === requestId) {
          if (data.type === 'token') {
            onToken && onToken(data.token, data.finished);
          } else if (data.type === 'complete') {
            cleanup();
            onComplete && onComplete(data.response);
            resolve(data.response);
          } else if (data.type === 'error') {
            cleanup();
            onError && onError(data.error);
            reject(new Error(data.error));
          }
        }
      };

      const errorHandler = (error) => {
        cleanup();
        reject(error);
      };

      // Set up listeners
      this.on('ai_response', tokenHandler);
      this.on('error', errorHandler);

      // Send streaming request
      this.send({
        type: 'stream_ai_request',
        requestId,
        prompt,
        provider,
        temperature,
        maxTokens,
        timestamp: new Date().toISOString(),
      });

      // Cleanup function
      const cleanup = () => {
        this.off('ai_response', tokenHandler);
        this.off('error', errorHandler);
      };

      // Timeout after 60 seconds
      setTimeout(() => {
        cleanup();
        reject(new Error('Streaming timeout'));
      }, 60000);
    });
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      connected: this.isConnected,
      readyState: this.ws ? this.ws.readyState : -1,
      reconnectAttempts: this.reconnectAttempts,
      clientId: this.clientId,
    };
  }
}

// Create singleton instance
const streamClient = new StreamClient();

// Auto-connect when module loads (in development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  streamClient.connect().catch((error) => {
    console.warn('StreamClient: Auto-connect failed:', error);
  });
}

export default streamClient;
export { StreamClient };
