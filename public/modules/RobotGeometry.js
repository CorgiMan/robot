const lift_h = 2000;
const lift_w = 200;
const lift_l = 200;

const arm1_l = 600;
const arm1_h = 150;
const arm1_w = 180;

const arm2_l = 600;
const arm2_h = 100;
const arm2_w = 150;

const wrist_l = 180;
const wrist_h = 400;
const wrist_w = 180;

const gripper_l = 360;
const gripper_h = 80;
const gripper_w = 90;

export class RobotGeometry {
    constructor(color, opacity) {
        this.color = color;
        this.opacity = opacity;

        this.lift = this.createBox(lift_l, lift_h, lift_w, 0, -lift_h/2, 0);
        
        this.arm1 = this.createBox(arm1_l, arm1_h, arm1_w, -arm1_l/2, 0, 0);
        this.lift.add(this.arm1);
        
        this.arm2 = this.createBox(arm2_l, arm2_h, arm2_w, -arm2_l/2 + arm2_w/2, arm2_h/2, 0);
        this.arm1.add(this.arm2);
        
        this.wrist = this.createBox(wrist_l, wrist_h, wrist_w, 0, wrist_h/2, 0);
        this.arm2.add(this.wrist);
        
        this.gripper = this.createBox(gripper_l, gripper_h, gripper_w, -gripper_l/2 + gripper_w/2, gripper_h/2, 0);
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
        this.arm1.position.set(lift_l/2, 700, 0);
        this.arm2.position.set(arm1_l-arm1_w/2, -arm1_h/2, 0);
        this.wrist.position.set(arm2_l-arm2_w, -arm2_h, 0);
        this.gripper.position.set(0, -wrist_h, 0);
        this.finger1.position.set(gripper_l-gripper_w/2 - 5, -gripper_h, 0);
        this.finger2.position.set(gripper_l-gripper_w/2 - 5 - 0, -gripper_h, 0);
        
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