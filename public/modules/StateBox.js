import { WebSocketClient } from './WebSocketClient.js';

export class StateBox {
    constructor(scene, config) {
        this.scene = scene;
        this.config = config;
        this.mesh = null;
        this.wireframe = null;
        this.label = null;
        this.basePosition = { x: config.x, y: config.y, z: config.z };
        
        this.createBox();
        this.createWireframe();
        this.createLabel();
    }
    
    createBox() {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshPhongMaterial({
            color: this.config.color,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(this.config.x, this.config.y, this.config.z);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        this.scene.add(this.mesh);
    }
    
    createWireframe() {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: this.config.color,
            wireframe: true,
            transparent: true,
            opacity: 0.8
        });
        
        this.wireframe = new THREE.Mesh(geometry, wireframeMaterial);
        this.wireframe.position.set(this.config.x, this.config.y, this.config.z);
        
        this.scene.add(this.wireframe);
    }
    
    createLabel() {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;
        context.fillStyle = '#ffffff';
        context.font = '48px Arial';
        context.textAlign = 'center';
        context.fillText(this.config.name, 128, 48);
        
        const texture = new THREE.CanvasTexture(canvas);
        const labelMaterial = new THREE.SpriteMaterial({ map: texture });
        this.label = new THREE.Sprite(labelMaterial);
        this.label.position.set(this.config.x, this.config.y + 1.5, this.config.z);
        this.label.scale.set(1, 0.25, 1);
        
        this.scene.add(this.label);
    }
    
    update(value) {
        const scale = 0.5 + (value / 100) * 1.5; // Scale from 0.5 to 2.0
        const height = value / 100 * 2; // Height from 0 to 2
        
        // Update box scale and position
        this.mesh.scale.set(scale, height, scale);
        this.wireframe.scale.set(scale, height, scale);
        
        // Update position to keep bottom at ground level
        const newY = this.basePosition.y + height / 2;
        this.mesh.position.y = newY;
        this.wireframe.position.y = newY;
        this.label.position.y = newY + 1.5;
        
        // Update material opacity based on value
        const opacity = 0.2 + (value / 100) * 0.6; // Opacity from 0.2 to 0.8
        this.mesh.material.opacity = opacity;
        this.wireframe.material.opacity = 0.3 + opacity * 0.7;
    }
    
    getName() {
        return this.config.name;
    }
    
    getColor() {
        return this.config.color;
    }
    
    destroy() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
        
        if (this.wireframe) {
            this.scene.remove(this.wireframe);
            this.wireframe.geometry.dispose();
            this.wireframe.material.dispose();
        }
        
        if (this.label) {
            this.scene.remove(this.label);
            this.label.material.dispose();
        }
    }
} 