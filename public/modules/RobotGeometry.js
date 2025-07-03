
const liftH = 2000;
const liftW = 200;
const liftL = 200;

const arm1L = 660;
const arm1H = 150;
const arm1W = 180;

const arm2L = 600;
const arm2H = 100;
const arm2W = 150;

const wristL = 180;
const wristH = 400;
const wristW = 180;

const gripperL = 360;
const gripperH = 80;
const gripperW = 90;

const startHeight = arm1H + arm2H + wristH + gripperH + 50;

export class RobotGeometry {
    constructor(color, opacity) {
        this.color = color;
        this.opacity = opacity;

        this.lift = this.createBox(liftL, liftH, liftW, 0, -liftH/2, 0);
        
        this.arm1 = this.createBox(arm1L, arm1H, arm1W, -arm1L/2, 0, 0);
        this.lift.add(this.arm1);
        
        this.arm2 = this.createBox(arm2L, arm2H, arm2W, -arm2L/2 + arm2W/2, arm2H/2, 0);
        this.arm1.add(this.arm2);
        
        this.wrist = this.createBox(wristL, wristH, wristW, 0, wristH/2, 0);
        this.arm2.add(this.wrist);
        
        this.gripper = this.createBox(gripperL, gripperH, gripperW, -gripperL/2 + gripperW/2, gripperH/2, 0);
        this.wrist.add(this.gripper);
        
        this.finger1 = this.createBox(5, 50, 70, 2.5, 25, 0);
        this.gripper.add(this.finger1);
        
        this.finger2 = this.createBox(5, 50, 70, -2.5, 25, 0);
        this.gripper.add(this.finger2);
    }

    getObject3D() {
        return this.lift;
    }

    position(state) {
        if(this.state === null) return;
        
        this.lift.position.set(0, 0, 0);
        this.arm1.position.set(liftL/2, startHeight, 0);
        this.arm2.position.set(arm1L-arm1W/2, -arm1H/2, 0);
        this.wrist.position.set(arm2L-arm2W, -arm2H, 0);
        this.gripper.position.set(0, -wristH, 0);
        this.finger1.position.set(gripperL-gripperW/2 - 5, -gripperH, 0);
        this.finger2.position.set(gripperL-gripperW/2 - 5, -gripperH, 0);
        
        const {lift, swing, elbow, wrist, gripper} = state;
        this.lift.rotation.set(0, swing * Math.PI/180, 0);
        this.arm1.translateY(lift);
        this.arm2.rotation.set(0, elbow * Math.PI/180, 0);
        this.wrist.rotation.set(0, wrist * Math.PI/180, 0);
        this.finger2.translateX(-gripper);
    }
    
    createBox(width, height, depth, cx, cy, cz) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        geometry.translate(-cx, -cy, -cz);
        const material = new THREE.MeshPhongMaterial({
            color: this.color,
            transparent: true,
            opacity: this.opacity,
            // side: THREE.DoubleSide,
            side: THREE.FrontSide,
        });
        
        const box = new THREE.Mesh(geometry, material);
        box.castShadow = true;

        return box;
        // this.mesh.receiveShadow = true;
    }

} 