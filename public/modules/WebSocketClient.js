export class WebSocketClient {
    constructor({ url, maxReconnectAttempts = 5, reconnectDelay = 1000 } = {}) {
        this.ws = null;
        this.url = url ?? this.getDefaultUrl();
        this.maxReconnectAttempts = maxReconnectAttempts;
        this.reconnectDelay = reconnectDelay;
        this.reconnectAttempts = 0;

        this.setupEventListeners();
        this.connect();
    }

    dispatchStatus(status) {
        const event = new CustomEvent('wsStatus', { detail: { status } });
        document.dispatchEvent(event);
    }

    dispatchMessage(data) {
        const event = new CustomEvent('wsReceive', { detail: { data } });
        document.dispatchEvent(event);
    }

    setupEventListeners() {
        document.addEventListener('wsSend', (event) => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify(event.detail.data));
            }
        });

        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && this.ws?.readyState !== WebSocket.OPEN) {
                console.log('Page became visible, attempting to reconnect');
                this.connect();
            }
        });

        // Handle window focus/blur
        window.addEventListener('focus', () => {
            if (this.ws?.readyState !== WebSocket.OPEN) {
                console.log('Window focused, attempting to reconnect');
                this.connect();
            }
        });

        // Handle beforeunload
        window.addEventListener('beforeunload', () => {
            if (this.ws) {
                this.ws.close();
            }
        });
    }

    getDefaultUrl() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        return `${protocol}//${window.location.host}`;
    }

    connect() {
        try {
            this.ws = new WebSocket(this.url);
            this.ws.onopen = () => {
                this.reconnectAttempts = 0;
                this.dispatchStatus('connected');
            };
            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.dispatchMessage(data);
                } catch (err) {
                    // TODO(wieger): handle parse errors
                }
            };

            this.ws.onclose = () => {
                this.dispatchStatus('disconnected');
                this.handleReconnect();
            };
            this.ws.onerror = () => {
                this.dispatchStatus('error');
            };
        } catch (err) {
            this.dispatchStatus('error');
        }
    }

    handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            this.dispatchStatus('reconnecting');
            setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
        } else {
            this.dispatchStatus('error');
        }
    }
}
