import { getDistance } from "./utils.mjs";

export class Slider {
    constructor(x, y, color = "#000", width = 10, height = 500) {
        this.radius = width/2;
        this.linewidth = 5;
        this.height = height;

        this.position = 0 * this.height;

        this.fingerId = undefined;
        this.color = color;
        this.x = x;
        this.y = y - this.height/2;
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y - this.height/2;
    }

    setHeight(height) {
        this.y = this.y + this.height/2;
        this.height = height;
        this.y = this.y - this.height/2;
    }

    onTouchStart(id, tx, ty) {
        if (getDistance(this.x, this.y + this.height/2 - this.position, tx, ty) < this.radius * 2) {
            this.fingerId = id;
            return true;
        } else return false;
    }

    onTouchMove(id, tx, ty) {
        if (this.fingerId === id) {
            this.position = this.y + this.height/2 - ty;
            if (this.position < 0) {
                this.position = 0;
            } else if (this.position > this.height) {
                this.position = this.height;
            }
        }
    }

    onTouchEnd(id) {
        if (this.fingerId === id) {
            this.fingerId = undefined;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = "#666";
        ctx.fillRect(this.x - this.linewidth/2, this.y - this.height/2, this.linewidth, this.height); // line

        ctx.fillStyle = this.color;
        ctx.beginPath()
        ctx.arc(this.x, this.y + this.height/2 - this.position, this.radius + this.linewidth/2, 0, Math.PI * 2, false); // slider
        ctx.arc(this.x, this.y + this.height/2 - this.position, this.radius, 0, Math.PI * 2, true); // slider
        ctx.fill();
        ctx.fillRect(this.x - this.radius, this.y + (this.height - this.linewidth/2)/2 - this.position, this.radius * 2, this.linewidth/2); // slider

        ctx.restore();
    }

    setStrength(strength) {
        this.position = strength * this.height;
    }

    getStrength() {
        return this.position / this.height;
    }
}
