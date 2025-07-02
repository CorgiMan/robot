export class ConnectionStatusPanel {
    constructor() {
        const statusIndicatorElement = document.getElementById('statusIndicator');
        const statusTextElement = document.getElementById('statusText');

        document.addEventListener('wsStatus', (event) => {
            statusIndicatorElement.classList.remove('connected', 'disconnected');
            switch (event.detail.status) {
                case 'connected':
                    statusIndicatorElement.classList.add('connected');
                    break;
                case 'disconnected':
                    statusIndicatorElement.classList.add('disconnected');
                    break;
                case 'error':
                    statusIndicatorElement.classList.add('disconnected');
                    break;
            }
            statusTextElement.textContent = event.detail.status;
        });
    }

}