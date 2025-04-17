export class Button {
    constructor(x, y, width, height, text, color, textColor) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.text = text;
        this.color = color;
        this.textColor = textColor;

        this.callback = undefined;
        this.isPressed = false;
        this.fingerId = undefined;
    }
    draw(ctx) {
        ctx.save();

        ctx.fillStyle = this.color;
        if (this.isPressed) {
            ctx.fillStyle = "#ccc"; // Change color when pressed
        }
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = this.textColor;
        ctx.font = "20px Arial";
        ctx.fillText(this.text, this.x + 10, this.y + 25);

        ctx.restore();
    }
    isInside(x, y) {
        return x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height;
    }
    setCallback(callback) {
        this.callback = callback;
    }
    onTouchStart(fingerId, x, y) {
        if (this.fingerId === undefined && this.isInside(x, y)) {
            this.fingerId = fingerId;
            this.isPressed = true;
            return true;
        }
        return false;
    }

    onTouchEnd(fingerId, x, y) {
        if (this.fingerId === fingerId) {
            this.fingerId = undefined;
            if (this.callback && this.isInside(x, y)) {
                this.callback();
                this.isPressed = true;
            }
            return true;
        }
        return false;
    }
}