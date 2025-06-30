// ThreeManager.js - Main 3D manager coordinating scene and boxes
import { ThreeScene } from './ThreeScene.js';
import { StateBox } from './StateBox.js';

export class ThreeManager {
    constructor(container, controlElements) {
        this.container = container;
        this.controlElements = controlElements;
        this.scene = null;
        this.boxes = new Map();
        
        this.boxConfigs = [
            { x: -2, y: 0, z: -2, color: 0x6366f1, name: 'A' },
            { x: 2, y: 0, z: -2, color: 0x8b5cf6, name: 'B' },
            { x: -2, y: 0, z: 2, color: 0x10b981, name: 'C' },
            { x: 2, y: 0, z: 2, color: 0xf59e0b, name: 'D' }
        ];
        
        this.init();
    }
    
    init() {
        // Create 3D scene
        this.scene = new ThreeScene(this.container);
        
        // Create state boxes
        this.createBoxes();
        
        // Setup controls
        this.setupControls();
        
        // Start animation
        this.scene.animate();
    }
    
    createBoxes() {
        this.boxConfigs.forEach(config => {
            const box = new StateBox(this.scene.getScene(), config);
            this.boxes.set(config.name, box);
        });
    }
    
    setupControls() {
        if (this.controlElements.resetCamera) {
            this.controlElements.resetCamera.addEventListener('click', () => {
                this.scene.resetCamera();
            });
        }
        
        if (this.controlElements.toggleRotation) {
            this.controlElements.toggleRotation.addEventListener('click', () => {
                const isRotating = this.scene.toggleRotation();
                this.controlElements.toggleRotation.textContent = 
                    isRotating ? 'Toggle Rotation' : 'Start Rotation';
            });
        }
    }
    
    updateBoxes(state) {
        this.boxes.forEach((box, name) => {
            const value = state[name.toLowerCase()];
            if (value !== undefined) {
                box.update(value);
            }
        });
    }
    
    getBox(name) {
        return this.boxes.get(name);
    }
    
    getAllBoxes() {
        return Array.from(this.boxes.values());
    }
    
    destroy() {
        // Destroy all boxes
        this.boxes.forEach(box => box.destroy());
        this.boxes.clear();
        
        // Note: Scene cleanup would be handled by ThreeScene if needed
    }
} 