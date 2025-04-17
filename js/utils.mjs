export class Finger {
    constructor(id, x = undefined, y = undefined) {
        this.id = id;
        this.x = x;
        this.y = y;
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

export function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export function createMovementController() {
    let touchedState = false;
    let fingerA = new Finger();
    let fingerB = new Finger();
    let scrollSteps = 0;

    let direction = {
        initialX: 0,
        initialY: 0,
        diffX: 0,
        diffY: 0,
        initialDistance: 1,
        initialAngle: 0,
        angle: 0,
        scale: 1
    }

    function getMovement() {
        updateDirection();
        return {
            touched: touchedState,
            angle: direction.angle,
            scale: direction.scale,
            diffX: direction.diffX,
            diffY: direction.diffY
        };
    }

    function onTouchMove(id, tx, ty) {
        for (let finger of [fingerA, fingerB]) {
            if (finger.id === id) {
                finger.x = tx;
                finger.y = ty;
            }
        }
    }

    function onTouchStart(id, tx, ty) {
        if (typeof fingerA.id === "undefined") {
            fingerA.id = id;
            touchedState = true;
            fingerA.x = tx;
            fingerA.y = ty;
            direction.initialX = tx;
            direction.initialY = ty;

        } else if (typeof fingerB.id === "undefined") {
            fingerB.id = id;
            fingerB.x = tx;
            fingerB.y = ty;

            direction.initialDistance = Math.sqrt((fingerB.x - fingerA.x) ** 2 + (fingerB.y - fingerA.y) ** 2);
            direction.initialAngle = Math.atan2(fingerB.y - fingerA.y, fingerB.x - fingerA.x);
        }
    }

    function onTouchEnd(id) {
        if (id === fingerB.id) {
            direction.initialAngle = 0;
            direction.initialDistance = 1;
        }
        for (let finger of [fingerA, fingerB]) {
            if (id === finger.id) {
                finger.id = undefined;
                finger.x = undefined;
                finger.y = undefined;
            }
        }
        if (typeof fingerA.id === "undefined" && typeof fingerB.id === "undefined") {
            touchedState = false;
        }
    }

    function onScroll(delta) {
        if (delta > 0) {
            scrollSteps++;
        } else {
            scrollSteps--;
        }
    }

    function updateDirection() {
        // Update diffX and diffY if fingerA is present
        // Otherwise, set them to 0
        if (typeof fingerA.id !== "undefined") {
            direction.diffX = fingerA.x - direction.initialX;
            direction.diffY = fingerA.y - direction.initialY;
            direction.initialX = fingerA.x;
            direction.initialY = fingerA.y;
        } else {
            direction.diffX = 0;
            direction.diffY = 0;
        }

        // Update angle and scale if both fingers are present
        // Otherwise, set angle to 0 and scale to 1
        if (typeof fingerA.id !== "undefined" && typeof fingerB.id !== "undefined") {
            direction.angle = Math.atan2(fingerB.y - fingerA.y, fingerB.x - fingerA.x);

            let currentSpace = Math.sqrt((fingerB.x - fingerA.x) ** 2 + (fingerB.y - fingerA.y) ** 2);
            direction.scale = currentSpace / direction.initialDistance;
            direction.initialDistance = currentSpace;
        } else {
            direction.angle = 0;
            direction.scale = 1;
        }

        // Apply scroll steps to scale
        if (scrollSteps > 0) {
            direction.scale *= -Math.exp(-scrollSteps) + 1; // -e^-scrollSteps + 1 -> Map values from [0, inf) to [0, 1]
        }
        if (scrollSteps < 0) {
            direction.scale *= Math.exp(scrollSteps) + 1; // e^scrollSteps + 1 -> Map values from (-inf, 0] to [0, 1]
        }
        scrollSteps = 0; // Reset scroll steps after applying them
    }

    return { getMovement, onTouchMove, onTouchStart, onTouchEnd, onScroll };
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

    return {img, offsetX, offsetY};
}
