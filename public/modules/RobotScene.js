// ThreeManager.js - Main 3D manager coordinating scene and boxes
import { RobotGeometry } from './RobotGeometry.js';
import { ThreeScene } from './ThreeScene.js';

export class RobotScene {
    constructor(container,  viewId) {
        this.container = container;
        this.scene = null;
        this.boxes = new Map();
        this.viewId = viewId;

        this.currentRobot = null;
        this.targetRobot = null;
        this.scene = new ThreeScene(this.container, this.viewId);
        this.scene.animate();

        this.addWSReceiveListener();
    }
    
    addWSReceiveListener() {
        document.addEventListener('wsReceive', (event) => {
            const s = event.detail.data;
            const current = {lift: s.lift, swing: s.swing, elbow: s.elbow, wrist: s.wrist, gripper: s.gripper};
            const target = {lift: s.liftTarget, swing: s.swingTarget, elbow: s.elbowTarget, wrist: s.wristTarget, gripper: s.gripperTarget};
            
            
            if(this.currentRobot === null) {
                this.currentRobot = new RobotGeometry(0xaaaaff, 0.8);
                this.scene.scene.add(this.currentRobot.getObject3D());
            }
            if(this.targetRobot === null) {
                this.targetRobot = new RobotGeometry(0x77ff77, 0.2);
                this.scene.scene.add(this.targetRobot.getObject3D());
            }
            if(this.targetRobot !== null && distance(current, target) < 1) {
                this.scene.scene.remove(this.targetRobot.getObject3D());
                this.targetRobot = null;
            }

            this.currentRobot.position(current);
            if(this.targetRobot !== null) this.targetRobot.position(target);

            // this.scene.animate();
        });
    }
}

function distance(current, target) {
    return Math.sqrt(
        (current.lift - target.lift) ** 2 +
        (current.swing - target.swing) ** 2 +
        (current.elbow - target.elbow) ** 2 +
        (current.wrist - target.wrist) ** 2 +
        (current.gripper - target.gripper) ** 2
    );
}
