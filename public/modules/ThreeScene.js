export class ThreeScene {
    constructor(container, viewId) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.viewId = viewId;
        this.init();
    }
    
    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createControls();
        this.addLights();
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0f172a);
    }
    
    createCamera() {
        if(this.viewId === 'free') {
            this.setPerspectiveView()
        }
        if(this.viewId === 'top' || this.viewId === 'side') {
            this.setOrthographicView()
        }
        this.resetCamera();
    }

    setPerspectiveView() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            10000
        );
    }

    setOrthographicView() {
        const aspect = this.container.clientWidth / this.container.clientHeight;
        const frustumSize = 3000;
        this.camera = new THREE.OrthographicCamera(
            frustumSize * aspect / -2,
            frustumSize * aspect / 2,
            frustumSize / 2,
            frustumSize / -2,
            0.1,
            10000
        );
    }

    resetCamera() {
        if(this.viewId === 'free') {
            this.camera.position.set(500, 1000, 2000);
        }
        if(this.viewId === 'top') {
            this.camera.position.set(0, 3000, 0);
            this.camera.up.set(0, 0, -1);
            this.camera.lookAt(0, 0, 0);
        }
        if(this.viewId === 'side') {
            this.camera.position.set(0, 1000, 1000);
            this.camera.up.set(0, 1, 0);
            this.camera.lookAt(0, 1000, 0);
        }
        if(this.controls) {
            this.controls.target.set(0, 1000, 0);
        }
    }

    
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);
    }
    
    createControls() {
        if(this.viewId === 'free') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 1;
            this.controls.target.set(0, 1000, 0);
        }
    }
    
    addLights() {
        this.scene.add(new THREE.AmbientLight(0x404040, 0.4));
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight2.position.set(-10, 5, -10);
        directionalLight2.castShadow = true;
        directionalLight2.shadow.mapSize.width = 2048;
        directionalLight2.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight2);
        const pointLight1 = new THREE.PointLight(0x6366f1, 0.8, 10);
        pointLight1.position.set(5, 5, 5);
        this.scene.add(pointLight1);
        const pointLight2 = new THREE.PointLight(0x8b5cf6, 0.8, 10);
        pointLight2.position.set(-5, 5, -5);
        this.scene.add(pointLight2);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        if(this.controls) this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
    
    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }
} 