console.log('WebSocketClient module loading...');

export class WebSocketClient {
    /**
     * @param {Object} options
     * @param {function(Object):void} options.onMessage - Called with parsed data on each message
     * @param {function(string):void=} options.onStatus - Optional, called with status: 'connected', 'disconnected', 'error', 'reconnecting'
     * @param {string=} options.url - Optional, WebSocket URL (defaults to current host)
     * @param {number=} options.maxReconnectAttempts - Optional, default 5
     * @param {number=} options.reconnectDelay - Optional, ms, default 1000
     */
    constructor({ onMessage, onStatus, url, maxReconnectAttempts = 5, reconnectDelay = 1000 }) {
        console.log('WebSocketClient constructor called');
        this.onMessage = onMessage;
        this.onStatus = onStatus;
        this.url = url || this._getDefaultUrl();
        this.maxReconnectAttempts = maxReconnectAttempts;
        this.reconnectDelay = reconnectDelay;
        this.reconnectAttempts = 0;
        this.ws = null;
        this._connect();
    }

    _getDefaultUrl() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        return `${protocol}//${window.location.host}`;
    }

    _connect() {
        try {
            this.ws = new WebSocket(this.url);
            this.ws.onopen = () => {
                this.reconnectAttempts = 0;
                this._notifyStatus('connected');
            };
            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.onMessage && this.onMessage(data);
                } catch (err) {
                    // Ignore parse errors
                }
            };
            this.ws.onclose = () => {
                this._notifyStatus('disconnected');
                this._handleReconnect();
            };
            this.ws.onerror = () => {
                this._notifyStatus('error');
            };
        } catch (err) {
            this._notifyStatus('error');
        }
    }

    _handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            this._notifyStatus('reconnecting');
            setTimeout(() => this._connect(), this.reconnectDelay * this.reconnectAttempts);
        } else {
            this._notifyStatus('error');
        }
    }

    _notifyStatus(status) {
        if (this.onStatus) this.onStatus(status);
    }

    send(obj) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(obj));
        }
    }

    close() {
        if (this.ws) {
            this.ws.close();
        }
    }
} 