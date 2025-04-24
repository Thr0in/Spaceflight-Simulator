import { createFinger } from "./utils.mjs";

export class MovementController {
    /**
     * Handles user input for movement and scaling.
     */
    constructor() {
        this.touchedState = false;
        this.fingerA = createFinger();
        this.fingerB = createFinger();
        this.scrollSteps = 0;

        this.movement = {
            initialX: 0,
            initialY: 0,
            diffX: 0,
            diffY: 0,
            initialDistance: 1,
            initialAngle: 0,
            angle: 0,
            scale: 1
        };
    }

    /**
     * Retrieves the current movement state.
     * @returns {object} An object containing movement details such as angle, scale, and position differences.
     */
    getMovement() {
        this.updateDirection();
        return {
            touched: this.touchedState,
            angle: this.movement.angle,
            scale: this.movement.scale,
            diffX: this.movement.diffX,
            diffY: this.movement.diffY
        };
    }

    /**
     * Updates the position of a touch point during movement.
     * @param {number} id - The identifier of the touch event.
     * @param {number} tx - The x-coordinate of the touch point.
     * @param {number} ty - The y-coordinate of the touch point.
     */
    onTouchMove(id, tx, ty) {
        for (let finger of [this.fingerA, this.fingerB]) {
            if (finger.id === id) {
                finger.x = tx;
                finger.y = ty;
            }
        }
    }

    /**
     * Handles the start of a touch event.
     * @param {number} id - The identifier of the touch event.
     * @param {number} tx - The x-coordinate of the touch point.
     * @param {number} ty - The y-coordinate of the touch point.
     */
    onTouchStart(id, tx, ty) {
        if (typeof this.fingerA.id === "undefined" || this.fingerA.id === id) {
            this.fingerA.id = id;
            this.touchedState = true;
            this.fingerA.x = tx;
            this.fingerA.y = ty;
            this.movement.initialX = tx;
            this.movement.initialY = ty;

        } else if (typeof this.fingerB.id === "undefined") {
            this.fingerB.id = id;
            this.fingerB.x = tx;
            this.fingerB.y = ty;

            this.movement.initialDistance = Math.sqrt((this.fingerB.x - this.fingerA.x) ** 2 + (this.fingerB.y - this.fingerA.y) ** 2);
            this.movement.initialAngle = Math.atan2(this.fingerB.y - this.fingerA.y, this.fingerB.x - this.fingerA.x);
        }
    }

    /**
     * Handles the end of a touch event.
     * @param {number} id - The identifier of the touch event.
     */
    onTouchEnd(id) {
        if (id === this.fingerB.id) {
            this.movement.initialAngle = 0;
            this.movement.initialDistance = 1;
            this.fingerB.id = undefined;
            this.fingerB.x = undefined;
            this.fingerB.y = undefined;
        }
        if (id === this.fingerA.id) {
            this.movement.initialX = 0;
            this.movement.initialY = 0;
            this.movement.diffX = 0;
            this.movement.diffY = 0;
            this.fingerA.id = undefined;
            this.fingerA.x = undefined;
            this.fingerA.y = undefined;
        }
        if (typeof this.fingerA.id === "undefined" && typeof this.fingerB.id === "undefined") {
            this.touchedState = false;
        }
    }

    /**
     * Handles scroll input to adjust the scale.
     * @param {number} delta - The scroll delta value.
     */
    onScroll(delta) {
        if (delta > 0) {
            this.scrollSteps++;
        } else {
            this.scrollSteps--;
        }
    }

    /**
     * Updates the movement direction, scale, and angle based on touch inputs.
     */
    updateDirection() {
        if (typeof this.fingerA.id !== "undefined") {
            this.movement.diffX = this.fingerA.x - this.movement.initialX;
            this.movement.diffY = this.fingerA.y - this.movement.initialY;
            this.movement.initialX = this.fingerA.x;
            this.movement.initialY = this.fingerA.y;
        } else {
            this.movement.diffX = 0;
            this.movement.diffY = 0;
        }

        if (typeof this.fingerA.id !== "undefined" && typeof this.fingerB.id !== "undefined") {
            this.movement.angle = Math.atan2(this.fingerB.y - this.fingerA.y, this.fingerB.x - this.fingerA.x);

            let currentSpace = Math.sqrt((this.fingerB.x - this.fingerA.x) ** 2 + (this.fingerB.y - this.fingerA.y) ** 2);
            this.movement.scale = currentSpace / this.movement.initialDistance;
            this.movement.initialDistance = currentSpace;
        } else {
            this.movement.angle = 0;
            this.movement.scale = 1;
        }

        if (this.scrollSteps > 0) {
            this.movement.scale *= -Math.exp(-this.scrollSteps) + 1;
        }
        if (this.scrollSteps < 0) {
            this.movement.scale *= Math.exp(this.scrollSteps) + 1;
        }
        this.scrollSteps = 0;
    }
}