export class ControlPanel {
    constructor() {
        this.liftInput = document.getElementById('liftInput');
        this.swingInput = document.getElementById('swingInput');
        this.elbowInput = document.getElementById('elbowInput');
        this.wristInput = document.getElementById('wristInput');
        this.gripperInput = document.getElementById('gripperInput');
        this.liftCurrent = document.getElementById('liftCurrent');
        this.swingCurrent = document.getElementById('swingCurrent');
        this.elbowCurrent = document.getElementById('elbowCurrent');
        this.wristCurrent = document.getElementById('wristCurrent');
        this.gripperCurrent = document.getElementById('gripperCurrent');

        this.submitButton = document.getElementById('submitButton');
        this.resetButton = document.getElementById('resetButton');

        this.xInput = document.getElementById('xInput');
        this.zInput = document.getElementById('zInput');
        this.heightInput = document.getElementById('heightInput');
        this.angleInput = document.getElementById('angleInput');
        this.xCurrent = document.getElementById('xCurrent');
        this.zCurrent = document.getElementById('zCurrent');
        this.heightCurrent = document.getElementById('heightCurrent');
        this.angleCurrent = document.getElementById('angleCurrent');

        this.kinematicInversionButton = document.getElementById('kinematicInversionButton');
        this.kinematicInversionResetButton = document.getElementById('kinematicInversionResetButton');

        this.addWSReceiveListener();
        this.addDirectInputListeners();
        this.addKinematicInversionListeners();
        this.addInputFocusHandlers();
    }

    addWSReceiveListener() {
        document.addEventListener('wsReceive', (event) => {
            const state = event.detail.data;
            this.state = state;

            if (state.targetsUpdated) {
                console.log(state);
                const setValueIfEmpty = (input, value) => {
                    if (input !== document.activeElement && input.value === '') {
                        input.value = value.toFixed(1);
                    }
                };
                setValueIfEmpty(this.liftInput, state.liftTarget);
                setValueIfEmpty(this.swingInput, state.swingTarget);
                setValueIfEmpty(this.elbowInput, state.elbowTarget);
                setValueIfEmpty(this.wristInput, state.wristTarget);
                setValueIfEmpty(this.gripperInput, state.gripperTarget);
            }

            if (this.liftCurrent.textContent !== state.lift.toFixed(1)) this.liftCurrent.textContent = state.lift.toFixed(1);
            if (this.swingCurrent.textContent !== state.swing.toFixed(1)) this.swingCurrent.textContent = state.swing.toFixed(1);
            if (this.elbowCurrent.textContent !== state.elbow.toFixed(1)) this.elbowCurrent.textContent = state.elbow.toFixed(1);
            if (this.wristCurrent.textContent !== state.wrist.toFixed(1)) this.wristCurrent.textContent = state.wrist.toFixed(1);
            if (this.gripperCurrent.textContent !== state.gripper.toFixed(1)) this.gripperCurrent.textContent = state.gripper.toFixed(1);

            if (this.xCurrent.textContent !== state.x.toFixed(1)) this.xCurrent.textContent = state.x.toFixed(1);
            if (this.zCurrent.textContent !== state.z.toFixed(1)) this.zCurrent.textContent = state.z.toFixed(1);
            if (this.heightCurrent.textContent !== state.height.toFixed(1)) this.heightCurrent.textContent = state.height.toFixed(1);
            if (this.angleCurrent.textContent !== state.angle.toFixed(1)) this.angleCurrent.textContent = state.angle.toFixed(1);
        });
    }

    addDirectInputListeners() {
        this.submitButton.addEventListener('click', (e) => {
            e.preventDefault();

            //todo(wieger): input validation
            const values = {
                type: 'direct',
                liftTarget: Number(this.liftInput.value),
                swingTarget: Number(this.swingInput.value),
                elbowTarget: Number(this.elbowInput.value),
                wristTarget: Number(this.wristInput.value),
                gripperTarget: Number(this.gripperInput.value),
            };

            this.liftInput.value = '';
            this.swingInput.value = '';
            this.elbowInput.value = '';
            this.wristInput.value = '';
            this.gripperInput.value = '';

            const event = new CustomEvent('wsSend', { detail: { data: values } });
            document.dispatchEvent(event);
        });

        this.resetButton.addEventListener('click', () => {
            this.liftInput.value = this.liftTarget;
            this.swingInput.value = this.swingTarget;
            this.elbowInput.value = this.elbowTarget;
            this.wristInput.value = this.wristTarget;
            this.gripperInput.value = this.gripperTarget;
        });
    }

    addKinematicInversionListeners() {
        this.kinematicInversionButton.addEventListener('click', () => {
            console.log('kinematic inversion');
            const values = {
                type: 'kinematic-inversion',
                x: Number(this.xInput.value),
                z: Number(this.zInput.value),
                height: Number(this.heightInput.value),
                angle: Number(this.angleInput.value),
            };

            this.liftInput.value = '';
            this.swingInput.value = '';
            this.elbowInput.value = '';
            this.wristInput.value = '';
            this.gripperInput.value = '';

            const event = new CustomEvent('wsSend', { detail: { data: values } });
            document.dispatchEvent(event);
        });

        this.kinematicInversionResetButton.addEventListener('click', () => {
            this.xInput.value = '';
            this.zInput.value = '';
            this.heightInput.value = '';
            this.angleInput.value = '';
        });
    }

    addInputFocusHandlers() {
        const addInputFocusBlur = (input, targetKey) => {
            input.addEventListener('focus', () => {
                input.value = '';
            });
            input.addEventListener('blur', () => {
                if (input.value === '') {
                    input.value = this.state[targetKey];
                }
            });
        };
        addInputFocusBlur(this.liftInput, 'liftTarget');
        addInputFocusBlur(this.swingInput, 'swingTarget');
        addInputFocusBlur(this.elbowInput, 'elbowTarget');
        addInputFocusBlur(this.wristInput, 'wristTarget');
        addInputFocusBlur(this.gripperInput, 'gripperTarget');
    }
}
