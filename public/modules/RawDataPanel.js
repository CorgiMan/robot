export class RawDataPanel {
    constructor() {
        const rawDataEl = document.getElementById('rawData');

        document.addEventListener('wsReceive', (event) => {
            rawDataEl.textContent = JSON.stringify(event.detail.data, null, 2);

            // Heartbeat animation
            rawDataEl.classList.add('raw-data-updated');
            setTimeout(() => {
                rawDataEl.classList.remove('raw-data-updated');
            }, 300);
        });
    }
}
