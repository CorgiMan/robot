export class ThreeScene {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.isRotating = true;
        
        this.init();
    }
    
    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createControls();
        this.addLights();
        this.setupEventListeners();
    }
    
    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0f172a);
    }
    
    createCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(5, 5, 5);
    }
    
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);
    }
    
    createControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
    }
    
    addLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Point lights for each corner
        const pointLight1 = new THREE.PointLight(0x6366f1, 0.5, 10);
        pointLight1.position.set(5, 5, 5);
        this.scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0x8b5cf6, 0.5, 10);
        pointLight2.position.set(-5, 5, -5);
        this.scene.add(pointLight2);
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        if (this.isRotating) {
            this.scene.rotation.y += 0.005;
        }
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
    
    resetCamera() {
        this.camera.position.set(5, 5, 5);
        this.camera.lookAt(0, 0, 0);
        this.controls.reset();
    }
    
    toggleRotation() {
        this.isRotating = !this.isRotating;
        return this.isRotating;
    }
    
    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }
    
    getScene() {
        return this.scene;
    }
    
    getCamera() {
        return this.camera;
    }
    
    getRenderer() {
        return this.renderer;
    }
} 