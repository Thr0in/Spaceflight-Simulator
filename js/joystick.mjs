import { distance, circle, Finger } from "./utils.mjs";

export class Joystick {
    constructor(x, y, color = "#000", radius = 50) {
        this.color = color;
        this.x = x;
        this.y = y;

        this.angle = -Math.PI/2;
        this.strength = 0;

        this.radius = radius;
        this.linewidth = 5;
        this.maxRange = 1.5 * this.radius;

        this.finger = new Finger(undefined, x, y);
    }

    onTouchStart(id, tx, ty) {
        if (distance(this.x, this.y, tx, ty) < this.radius) {
            this.finger.id = id;
            this.finger.x = tx;
            this.finger.y = ty;
            return true;
        } else return false;
    }

    onTouchMove(id, tx, ty) {
        if (this.finger.id === id) {
            this.angle = Math.atan2(ty - this.y, tx - this.x);

            if (distance(this.x, this.y, tx, ty) <= this.maxRange) {
                this.finger.x = tx;
                this.finger.y = ty;
            } else {
                this.finger.x = this.x + (this.maxRange * Math.cos(this.angle));
                this.finger.y = this.y + (this.maxRange * Math.sin(this.angle));
            }
            this.strength = distance(this.x, this.y, this.finger.x, this.finger.y) / this.maxRange;
            //.log(this.strength);
        }
    }

    onTouchEnd(id) {
        if (this.finger.id === id) {
            this.finger.id = undefined;
            this.finger.x = this.x;
            this.finger.y = this.y;
            this.strength = 0;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius + this.linewidth, 0, Math.PI * 2, false); // outer (filled)
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true); // outer (unfills it)
        ctx.fill();


        circle(ctx, this.finger.x, this.finger.y, this.radius / 2, this.color); // inner (filled)

        ctx.restore();
    }

    getDirection() {
        return this.angle;
    }
    getStrength() {
        return this.strength;
    }
}
