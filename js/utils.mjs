export function createFinger(id = undefined, x = undefined, y = undefined) {
    return {
        id: id,
        x: x,
        y: y
    }
}

export function setTransform(ctx, x, y, angle = 0, scale = 1) {
    ctx.save();
    ctx.resetTransform();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(scale, scale);

    const matrix = ctx.getTransform();

    ctx.restore();
    return matrix;
}

export function fillPath(ctx, path, M, fillStyle = "#fff", strokeStyle = "#000", lineWidth = 0.1) {
    ctx.save();  // Speichern des Zustands mit der aktuellen Matrix auf Stack
    ctx.setTransform(M);
    ctx.fillStyle = fillStyle;
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.fill(path);
    ctx.stroke(path);
    ctx.restore(); // Holen der gespeicherten Matrix vom Stack
}

export function circle(ctx, x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, true);
    ctx.fill();
}

export function getDistance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export function loadImage(src) {
    let img = new Image();
    img.src = src;
    let offsetX = 0, offsetY = 0;

    img.addEventListener('load', () => {
        offsetX = -img.naturalWidth / 2;
        offsetY = -img.naturalHeight / 2;
        console.log('Imaged loaded: ', offsetX, offsetY);
    });

    return { img, offsetX, offsetY };
}
