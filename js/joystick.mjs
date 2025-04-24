import { getDistance, circle, createFinger } from "./utils.mjs";

export class Joystick {
    /**
     * Represents a joystick for user input.
     * @param {number} x - The x-coordinate of the joystick's center.
     * @param {number} y - The y-coordinate of the joystick's center.
     * @param {string} [color="#000"] - The color of the joystick.
     * @param {number} [radius=50] - The radius of the joystick.
     */
    constructor(x, y, color = "#000", radius = 50) {
        this.color = color;
        this.x = x;
        this.y = y;

        this.angle = -Math.PI / 2;
        this.strength = 0;

        this.radius = radius;
        this.linewidth = 5;
        this.maxRange = 1.5 * this.radius;

        this.finger = new createFinger(undefined, x, y);
    }

    /**
     * Sets the position of the joystick.
     * @param {number} x - The new x-coordinate of the joystick's center.
     * @param {number} y - The new y-coordinate of the joystick's center.
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.finger.x = x;
        this.finger.y = y;
    }

    /**
     * Handles the start of a touch event.
     * @param {number} id - The identifier of the touch event.
     * @param {number} tx - The x-coordinate of the touch point.
     * @param {number} ty - The y-coordinate of the touch point.
     * @returns {boolean} True if the touch event is within the joystick's range, otherwise false.
     */
    onTouchStart(id, tx, ty) {
        if (getDistance(this.x, this.y, tx, ty) < this.radius) {
            this.finger.id = id;
            this.finger.x = tx;
            this.finger.y = ty;
            this.calculateStrength();
            this.angle = Math.atan2(ty - this.y, tx - this.x);
            return true;
        }
        return false;
    }

    /**
     * Handles the movement of a touch event.
     * @param {number} id - The identifier of the touch event.
     * @param {number} tx - The x-coordinate of the touch point.
     * @param {number} ty - The y-coordinate of the touch point.
     */
    onTouchMove(id, tx, ty) {
        if (this.finger.id === id) {
            this.angle = Math.atan2(ty - this.y, tx - this.x);

            if (getDistance(this.x, this.y, tx, ty) <= this.maxRange) {
                this.finger.x = tx;
                this.finger.y = ty;
            } else {
                this.finger.x = this.x + this.maxRange * Math.cos(this.angle);
                this.finger.y = this.y + this.maxRange * Math.sin(this.angle);
            }
            this.calculateStrength();
        }
    }

    /**
     * Handles the end of a touch event.
     * @param {number} id - The identifier of the touch event.
     */
    onTouchEnd(id) {
        if (this.finger.id === id) {
            this.finger.id = undefined;
            this.finger.x = this.x;
            this.finger.y = this.y;
            this.strength = 0;
        }
    }

    /**
     * Draws the joystick on the canvas.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     */
    draw(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + this.linewidth, 0, Math.PI * 2, false);
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
        ctx.fill();

        circle(ctx, this.finger.x, this.finger.y, this.radius / 2, this.color);

        ctx.restore();
    }

    /**
     * Calculates the strength of the joystick input.
     */
    calculateStrength() {
        this.strength = getDistance(this.x, this.y, this.finger.x, this.finger.y) / this.maxRange;
    }

    /**
     * Gets the direction of the joystick input.
     * @returns {number} The angle of the joystick in radians.
     */
    getDirection() {
        return this.angle;
    }

    /**
     * Gets the strength of the joystick input.
     * @returns {number} The strength of the joystick input (0 to 1).
     */
    getStrength() {
        return this.strength;
    }
}
