export class MessageInfoPanel {
    constructor() {
        const lastUpdateElement = document.getElementById('lastUpdate');
        const messageCountElement = document.getElementById('messageCount');

        let messageCount = 0;
        document.addEventListener('wsReceive', (event) => {
            lastUpdateElement.textContent = new Date().toLocaleTimeString();        
            messageCountElement.textContent = messageCount++;
        });
    }
}