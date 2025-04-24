
/**
 * Sets up event listeners for touch and mouse events on the canvas.
 * Handles joystick, slider, and button interactions.
 * @param {HTMLCanvasElement} cnv - The canvas element to attach event listeners to.
 * @param {Joystick} joystick - The joystick instance for controlling movement.
 * @param {Slider} slider - The slider instance for controlling speed.
 * @param {Array<Button>} buttons - Array of button instances for time warp control.
 * @param {MovementController} movementController - The movement controller instance for handling touch events.
 */
export function setupEventListeners(cnv, joystick, slider, buttons, movementController, statisticsScreen, debugCallback) {
    cnv.addEventListener("touchstart", (evt) => {
        evt.preventDefault();
        for (let touch of evt.changedTouches) {
            let eventHandled = joystick.onTouchStart(touch.identifier, touch.pageX, touch.pageY) ||
                slider.onTouchStart(touch.identifier, touch.pageX, touch.pageY);
            for (const button of buttons) {
                eventHandled |= button.onTouchStart(touch.identifier, touch.pageX, touch.pageY);
            }
            if (!eventHandled) {
                movementController.onTouchStart(touch.identifier, touch.pageX, touch.pageY);
            }
        }
    });

    cnv.addEventListener("touchmove", (evt) => {
        evt.preventDefault();
        for (let touch of evt.changedTouches) {
            joystick.onTouchMove(touch.identifier, touch.pageX, touch.pageY);
            slider.onTouchMove(touch.identifier, touch.pageX, touch.pageY);
            movementController.onTouchMove(touch.identifier, touch.pageX, touch.pageY);
        }
    });

    cnv.addEventListener("touchend", (evt) => {
        evt.preventDefault();
        for (let touch of evt.changedTouches) {
            joystick.onTouchEnd(touch.identifier);
            slider.onTouchEnd(touch.identifier);
            for (const button of buttons) {
                button.onTouchEnd(touch.identifier, touch.pageX, touch.pageY);
            }
            movementController.onTouchEnd(touch.identifier);
        }
    });

    cnv.addEventListener("wheel", (evt) => {
        evt.preventDefault();
        movementController.onScroll(evt.deltaY);
    });

    const mouseId = "mouse";

    cnv.addEventListener("mousedown", (evt) => {
        evt.preventDefault();
        let eventHandled = joystick.onTouchStart(mouseId, evt.pageX, evt.pageY) ||
            slider.onTouchStart(mouseId, evt.pageX, evt.pageY);
        for (const button of buttons) {
            eventHandled |= button.onTouchStart(mouseId, evt.pageX, evt.pageY);
        }
        if (!eventHandled) {
            movementController.onTouchStart(mouseId, evt.pageX, evt.pageY);
        }
    });

    cnv.addEventListener("mousemove", (evt) => {
        evt.preventDefault();
        let eventHandled = joystick.onTouchMove(mouseId, evt.pageX, evt.pageY) ||
            slider.onTouchMove(mouseId, evt.pageX, evt.pageY);
        if (!eventHandled) {
            movementController.onTouchMove(mouseId, evt.pageX, evt.pageY);
        }
    });

    cnv.addEventListener("mouseup", (evt) => {
        evt.preventDefault();
        let eventHandled = joystick.onTouchEnd(mouseId) ||
            slider.onTouchEnd(mouseId);
        for (const button of buttons) {
            eventHandled |= button.onTouchEnd(mouseId, evt.pageX, evt.pageY);
        }
        if (!eventHandled) {
            movementController.onTouchEnd(mouseId);
        }
    });

    window.addEventListener("keydown", (evt) => {
        if (evt.key === "Escape") {
            statisticsScreen.isVisible = !statisticsScreen.isVisible;
        }
        if (evt.key === "d") {
            debugCallback();
        }
        if (evt.key === ",") {
            buttons[0].callback();
        }
        if (evt.key === ".") {
            buttons[2].callback();
        }
    });
}