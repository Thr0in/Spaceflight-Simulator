export class StatisticsScreen {
    constructor(craft = null) {
        this.x = 0;
        this.y = 0;
        this.width = 300;
        this.height = 200;
        this.craft = craft;
        this.isVisible = false;
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    setCraft(craft) {
        this.craft = craft;
    }

    draw(context) {
        if (!this.isVisible || !this.craft) return; // Don't draw if not visible or no craft

        context.save();
        context.translate(this.x, this.y);

        context.font = "16px Arial";
        context.fillStyle = "rgba(0, 0, 0, 0.7)"; // Semi-transparent background
        context.fillRect(5, 5, this.width, this.height); // Background box for overlay

        context.fillStyle = "white";
        let x = 25;
        let y = 40;

        const lineHeight = 25;
        // Display craft name
        context.fillText(`Craft: ${this.craft.name}`, x, y);
        y += lineHeight;

        // Display status
        if (this.craft.isCrashed) {
            context.fillText(`Status: Crashed`, x, y);
            y += lineHeight;
            context.fillText(`Impact Velocity: ${this.craft.impactVelocity.toFixed(2)} m/s`, x, y);
        } else if (this.craft.isLanded) {
            context.fillText(`Status: Landed on ${this.craft.getParent().name}`, x, y);
            y += lineHeight;
            context.fillText(`Landed On: ${this.craft.landedBodies.join(', ')}`, x, y);
        } else {
            context.fillText(`Status: In Flight over ${this.craft.getParent().name}`, x, y);
            y += lineHeight;
            context.fillText(`Altitude: ${this.craft.getAltitude().toFixed(3)} km`, x, y);
            y += lineHeight;
            context.fillText(`Velocity: ${this.craft.getSurfaceVelocity().toFixed(3)} m/s`, x, y);
        }

        context.restore();
    }
}