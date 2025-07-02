import { MessageInfoPanel } from './modules/MessageInfoPanel.js';
import { ConnectionStatusPanel } from './modules/ConnectionStatusPanel.js';
import { RawDataPanel } from './modules/RawDataPanel.js';
import { WebSocketClient } from './modules/WebSocketClient.js';
import { Robot3DViewPanel } from './modules/Robot3DViewPanel.js';
import { ControlPanel } from './modules/ControlPanel.js';

document.addEventListener('DOMContentLoaded', () => {
    new MessageInfoPanel();    
    new ConnectionStatusPanel();
    new RawDataPanel();
    new WebSocketClient();
    new Robot3DViewPanel('free');
    new Robot3DViewPanel('top');
    new Robot3DViewPanel('side');
    new ControlPanel();
});