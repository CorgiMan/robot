import { RobotScene } from './RobotScene.js';

export class Robot3DViewPanel {
    constructor(viewId) {
        const viewElement = document.getElementById(viewId);
        const threeContainerElement = viewElement.querySelector('#threeContainer');
        const resetCameraElement = viewElement.querySelector('#resetCamera');

        this.robotScene = new RobotScene(threeContainerElement, viewId);

        resetCameraElement.addEventListener('click', () => {
            this.robotScene.scene.resetCamera();
        });
    }
}