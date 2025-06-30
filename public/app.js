// WebSocket State Monitor Frontend
import { ThreeManager } from './modules/ThreeManager.js';
import { WebSocketClient } from './modules/WebSocketClient.js';

class WebSocketStateMonitor {
    constructor() {
        this.messageCount = 0;
        this.lastUpdate = null;
        this.currentState = { a: 0, b: 0, c: 0, d: 0 };
        this.threeManager = null;
        this.wsClient = null;
        
        // DOM elements
        this.elements = {
            statusIndicator: document.getElementById('statusIndicator'),
            statusText: document.getElementById('statusText'),
            valueA: document.getElementById('valueA'),
            valueB: document.getElementById('valueB'),
            valueC: document.getElementById('valueC'),
            valueD: document.getElementById('valueD'),
            progressA: document.getElementById('progressA'),
            progressB: document.getElementById('progressB'),
            progressC: document.getElementById('progressC'),
            progressD: document.getElementById('progressD'),
            lastUpdate: document.getElementById('lastUpdate'),
            messageCount: document.getElementById('messageCount'),
            rawData: document.getElementById('rawData'),
            threeContainer: document.getElementById('threeContainer'),
            resetCamera: document.getElementById('resetCamera'),
            toggleRotation: document.getElementById('toggleRotation')
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initThreeJS();
        this.initWebSocket();
    }
    
    initWebSocket() {
        try {
            this.wsClient = new WebSocketClient({
                onMessage: (data) => this.handleStateUpdate(data),
                onStatus: (status) => this.updateConnectionStatus(status)
            });
        } catch (error) {
            console.error('Failed to initialize WebSocket client:', error);
            this.updateConnectionStatus('error');
        }
    }
    
    handleStateUpdate(data) {
        this.messageCount++;
        this.lastUpdate = new Date();
        
        // Update current state
        this.currentState = { ...data };
        
        // Update UI
        this.updateStateDisplay();
        this.updateProgressBars();
        this.updateInfoPanel();
        if (this.threeManager) {
            this.threeManager.updateBoxes(this.currentState);
        }
        
        // Add visual feedback for updates
        this.addUpdateAnimation();
    }
    
    updateStateDisplay() {
        const { valueA, valueB, valueC, valueD } = this.elements;
        
        // Update values with animation
        this.updateValueWithAnimation(valueA, this.currentState.a);
        this.updateValueWithAnimation(valueB, this.currentState.b);
        this.updateValueWithAnimation(valueC, this.currentState.c);
        this.updateValueWithAnimation(valueD, this.currentState.d);
    }
    
    updateValueWithAnimation(element, newValue) {
        const oldValue = parseInt(element.textContent) || 0;
        
        if (oldValue !== newValue) {
            element.textContent = newValue;
            element.classList.add('value-updated');
            
            // Remove animation class after animation completes
            setTimeout(() => {
                element.classList.remove('value-updated');
            }, 300);
        }
    }
    
    updateProgressBars() {
        const { progressA, progressB, progressC, progressD } = this.elements;
        
        // Update progress bars (0-100 scale)
        progressA.style.width = `${this.currentState.a}%`;
        progressB.style.width = `${this.currentState.b}%`;
        progressC.style.width = `${this.currentState.c}%`;
        progressD.style.width = `${this.currentState.d}%`;
    }
    
    updateInfoPanel() {
        const { lastUpdate, messageCount, rawData } = this.elements;
        
        // Update last update time
        if (this.lastUpdate) {
            lastUpdate.textContent = this.lastUpdate.toLocaleTimeString();
        }
        
        // Update message count
        messageCount.textContent = this.messageCount;
        
        // Update raw data display
        rawData.textContent = JSON.stringify(this.currentState, null, 2);
    }
    
    addUpdateAnimation() {
        // Add subtle animation to state cards
        const stateCards = document.querySelectorAll('.state-card');
        stateCards.forEach(card => {
            card.style.transform = 'translateY(-2px)';
            setTimeout(() => {
                card.style.transform = 'translateY(0)';
            }, 150);
        });
    }
    
    updateConnectionStatus(status) {
        const { statusIndicator, statusText } = this.elements;
        
        // Remove all status classes
        statusIndicator.classList.remove('connected', 'disconnected');
        
        // Add appropriate class
        switch (status) {
            case 'connected':
                statusIndicator.classList.add('connected');
                break;
            case 'disconnected':
                statusIndicator.classList.add('disconnected');
                break;
            case 'error':
                statusIndicator.classList.add('disconnected');
                break;
        }
        
        statusText.textContent = status;
    }
    
    setupEventListeners() {
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && this.wsClient?.readyState !== WebSocket.OPEN) {
                console.log('Page became visible, attempting to reconnect');
                this.initWebSocket();
            }
        });
        
        // Handle window focus/blur
        window.addEventListener('focus', () => {
            if (this.wsClient?.readyState !== WebSocket.OPEN) {
                console.log('Window focused, attempting to reconnect');
                this.initWebSocket();
            }
        });
        
        // Handle beforeunload
        window.addEventListener('beforeunload', () => {
            if (this.wsClient) {
                this.wsClient.close();
            }
        });
        
        // 3D Controls
        this.elements.resetCamera.addEventListener('click', () => {
            this.resetCamera();
        });
        
        this.elements.toggleRotation.addEventListener('click', () => {
            this.toggleRotation();
        });
        
        // Handle window resize for 3D scene
        window.addEventListener('resize', () => {
            this.onWindowResize();
        });
    }
    
    // Method to manually request state update
    requestStateUpdate() {
        if (this.wsClient) {
            this.wsClient.send({ type: 'request_state' });
        }
    }
    
    // Three.js Methods
    initThreeJS() {
        this.threeManager = new ThreeManager(
            this.elements.threeContainer,
            {
                resetCamera: this.elements.resetCamera,
                toggleRotation: this.elements.toggleRotation
            }
        );
    }
    
    resetCamera() {
        this.threeManager.resetCamera();
    }
    
    toggleRotation() {
        this.threeManager.toggleRotation();
    }
    
    onWindowResize() {
        this.threeManager.onWindowResize();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing WebSocket State Monitor...');
    
    window.stateMonitor = new WebSocketStateMonitor();
    
    // Add some interactive features
    const stateCards = document.querySelectorAll('.state-card');
    stateCards.forEach(card => {
        card.addEventListener('click', () => {
            // Request immediate state update when clicking on cards
            window.stateMonitor.requestStateUpdate();
        });
    });
    
    console.log('WebSocket State Monitor initialized successfully!');
}); 