
/**
 * Receives a DOM element.
 * Returns an object with enable, activate, and deactivate methods
 * @param  {DOM element} element
 * @return {Shape}
 */

function makeButton(el, buttonIndex, publisher) {
	const button = {};
	button.element = el;

	button.enable = function enable() {
		button.enabled = true;
		button.element.classList.add('enabled');
	};

	button.disable = function disable() {
		button.enabled = false;
		button.element.classList.remove('enabled');
	};

	button.toggleEnabled = function toggleEnabled() {
		if (button.enabled) {
			button.disable();
		} else {
			button.enable();
		}
	};

	button.activate = function activate() {
		if (!button.enabled) button.enable();
		button.active = true;
		button.element.classList.add('active');
	};

	button.deactivate = function deactivate() {
		button.active = false;
		button.element.classList.remove('active');
	};

	button.toggleActive = function toggleActive(inputState) {
		button.active = inputState || !button.active;
		if (button.active === true) {
			button.activate();
		} else {
			button.deactivate();
		}
	};

	/**
	 * EVENTS
	 */

	publisher.subscribe('enableButtons', (count) => {
		if (buttonIndex <= count - 1) {
			button.enable();
			button.activate();
		} else {
			button.disable();
			button.deactivate();
		}
	});

	publisher.subscribe('disableButtons', () => {
		button.deactivate();
	})

	button.element.addEventListener('click', () => {
		button.toggleActive();
		const event = (button.active) ? 'stemActivated' : 'stemDeactivated';
		publisher.emit(event, buttonIndex);
	});

	return button;
}

export default makeButton;
