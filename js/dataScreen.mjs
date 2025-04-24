
export class DataScreen {
    constructor(x, y, cnv, debug = false) {
        this.debug = debug;
        this.x = x;
        this.y = y;
        this.cnv = cnv;
        this.craft = null;
        this.ctx = cnv.getContext("2d");
        this.timeStamp = Date.now();
    }

    setCraft(craft) {
        this.craft = craft;
    }

    setPosition({x, y}) {
        this.x = x;
        this.y = y;
    }

    getPosition() {
        return { x: this.x, y: this.y };
    }

    draw() {
        const newDateTime = Date.now();
        this.ctx.save();

        this.ctx.fillStyle = "#fff";
        this.ctx.font = "1.2em Arial";

        this.ctx.translate(this.x, this.y);
        this.ctx.fillText(`Surface Velocity: ${this.craft.getSurfaceVelocity().toFixed(1)} m/s`, 0, 0);
        this.ctx.fillText(`Vertical Velocity: ${this.craft.getVerticalVelocity().toFixed(1)} m/s`, 0, 30);
        this.ctx.fillText(`Altitude: ${this.craft.getAltitude().toFixed(3)} km`, 0, 60);
        if (this.debug) this.ctx.fillText(`FPS: ${Math.round(1000 / (newDateTime - this.timeStamp))}`, 0, 90);

        this.ctx.restore();
        this.timeStamp = newDateTime;
    }
}