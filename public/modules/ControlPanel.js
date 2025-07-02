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

        this.addWSReceiveListener();
        this.addSubmitListener();
        this.addResetListener();
        this.addInputFocusHandlers();
    }

    addWSReceiveListener() {
        document.addEventListener('wsReceive', (event) => {
            const state = event.detail.data;

            const setValueIfEmpty = (input, value) => {
                if(input !== document.activeElement && input.value === '') {
                    input.value = value.toFixed(1);
                }
            }
            setValueIfEmpty(this.liftInput, state.liftTarget);
            setValueIfEmpty(this.swingInput, state.swingTarget);
            setValueIfEmpty(this.elbowInput, state.elbowTarget);
            setValueIfEmpty(this.wristInput, state.wristTarget);
            setValueIfEmpty(this.gripperInput, state.gripperTarget);

            if(this.gripperInput !== document.activeElement && this.gripperInput.value === '') {
                this.gripperInput.value = state.gripperTarget;
            }
            
            this.liftCurrent.textContent = state.lift.toFixed(1);
            this.swingCurrent.textContent = state.swing.toFixed(1);
            this.elbowCurrent.textContent = state.elbow.toFixed(1);
            this.wristCurrent.textContent = state.wrist.toFixed(1);
            this.gripperCurrent.textContent = state.gripper.toFixed(1);
        });
    }

    addResetListener() {
        this.resetButton.addEventListener('click', () => {
            this.liftInput.value = this.liftTarget;
            this.swingInput.value = this.swingTarget;
            this.elbowInput.value = this.elbowTarget;
            this.wristInput.value = this.wristTarget;
            this.gripperInput.value = this.gripperTarget;
        });
    }

    addSubmitListener() {
        this.submitButton.addEventListener('click', (e) => {
            e.preventDefault();

            //todo(wieger): input validation
            const values = {
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

            console.log('Robot Control Panel submit:', values);
            const event = new CustomEvent("wsSend", { detail: { data: values }});
            document.dispatchEvent(event);
        });
    }

    addInputFocusHandlers() {
        const addInputFocusBlur = (input, targetKey) => {
            input.addEventListener('focus', () => {
                input.value = '';
            });
            input.addEventListener('blur', () => {
                if (input.value === '') {
                    input.value = this[targetKey];
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