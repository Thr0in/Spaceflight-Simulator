import { Time } from "./time.mjs";
import { CelestialBody } from "./celestialBody.mjs";

export class Renderer {
    constructor(cnvs, time) {
        this.cnvs = cnvs; // Canvas element for rendering
        this.ctx = cnvs.getContext("2d"); // 2D rendering context
        this.celestialBodies = []; // Array to hold celestial bodies
        this.scaleDistance = 1; // Scale for rendering distances
        this.scaleBodies = 1; // Scale for rendering celestial bodies
        this.scale = 1; // Scale for rendering

        this.offset = { x: 0, y: 0 }; // Offset for positioning celestial bodies
        this.lastTime = 0; // Last time for animation frame
        this.timeWarp = 1; // Time warp factor for simulation speed

        this.loggables = []; // Array to hold loggable objects

        this.craftHistory = []; // Array to hold craft history
        this.craftImage = undefined; // Image for the craft

        this.isDead = false;
        this.craftAngle = 0;
        this.time = time;
    }

    updateCelestialBodies() {
        for (const body of this.celestialBodies) {
            body.updatePosition(this.time.getTime());
        }
    }

    drawCelestialBodies() {
        for (const celestialBody of this.celestialBodies) {
            this.drawCelestialBody(celestialBody);
        }
    }

    drawCelestialBody(celestialBody) {
        this.ctx.save();
        this.applyOffset(); // Apply offset for positioning
        this.ctx.fillStyle = celestialBody.color; // Celestial body color
        this.ctx.beginPath();
        let x = 0;
        let y = 0;
        if (celestialBody.hasParent()) {
            let position = celestialBody.getPosition();
            x = position.x / this.scaleDistance;
            y = position.y / this.scaleDistance;
        }
        let displayRadius = celestialBody.radius / this.scaleBodies; // Adjust radius for scale
        if (celestialBody.radius / this.scaleBodies < 3) {
            displayRadius = 3; // Minimum radius for visibility
        }
        this.ctx.arc(x, y, displayRadius, 0, Math.PI * 2, false);
        this.ctx.fill();
        this.ctx.restore();
    }

    drawOrbits() {
        for (const celestialBody of this.celestialBodies) {
            if (celestialBody.hasParent()) {
                this.drawOrbit(celestialBody);
            }
        }
    }

    drawOrbit(celestialBody) {
        this.ctx.save();

        this.applyOffset(); // Apply offset for positioning

        this.ctx.strokeStyle = celestialBody.color; // Orbit color
        this.ctx.beginPath();

        let radius = celestialBody.orbitalRadius / this.scaleDistance; // Adjust radius for scale
        let { x, y } = celestialBody.getParent().getPosition(); // Get position of the celestial body
        this.ctx.arc(x / this.scaleDistance, y / this.scaleDistance, radius, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.restore();
    }

    drawCraft(craft, useImage = true) {
        const currentTime = this.time.getTime(); // Get current time
        let dt = currentTime - this.lastTime; // Calculate time difference
        //console.log(dt);
        dt /= 1000;
        //console.log(1/6, dt);
        this.lastTime = currentTime; // Update last time

        this.ctx.save();

        this.applyOffset(); // Apply offset for positioning
        this.ctx.fillStyle = "red"; // Craft color
        this.ctx.beginPath();

        if (!this.isDead) {
            craft.update(dt, this.celestialBodies); // Update craft position based on time difference and time warp 
        }
        let { x, y } = craft.getPosition();

        if (this.craftHistory.length <= 0) {
            this.craftHistory.push({ x, y }); // Store craft position in history
        } else {
            this.craftHistory.push()
            const lastPos = this.craftHistory[this.craftHistory.length - 1]; // Get last position from history
            if (Math.abs(lastPos.x - x) > 100 || Math.abs(lastPos.y - y) > 100) {
                this.craftHistory.push({ x: x, y: y }); // Store craft position in history
            }
        }

        x /= this.scaleDistance; // Adjust position for scale
        y /= this.scaleDistance;

        if (this.craftImage && useImage) {
            try {
                this.ctx.save();
                this.ctx.resetTransform(); // Reset transformation matrix
                this.ctx.translate(x, y); // Translate to craft position
                this.applyOffset();

                if (!this.isDead) {
                    this.craftAngle = craft.angle;
                }
                this.ctx.rotate(this.craftAngle + Math.PI / 4);

                let sc = 1.5 / Math.exp(this.scale);
                this.ctx.scale(sc, sc); // Scale the image
                this.ctx.translate(-20, -20); // Translate to center the image
                this.ctx.drawImage(this.craftImage.img, 0, 0, 40, 40); // Draw craft image
                this.ctx.restore();
            }
            catch (e) {
                console.log(e);
                this.craftImage = undefined; // Reset craft image if an error occurs
            }
        } else {
            let displayRadius = 5; // Radius for the craft
            this.ctx.arc(x, y, displayRadius, 0, Math.PI * 2, false);
            this.ctx.fill();
        }

        this.ctx.restore();
    }

    drawCraftOrbit(craft) {
        this.ctx.save();

        this.applyOffset(); // Apply offset for positioning

        this.ctx.strokeStyle = "red"; // Orbit 
        this.ctx.setLineDash([5, 5]); // Set dashed line style
        this.ctx.beginPath();

        this.ctx.moveTo(craft.x / this.scaleDistance, craft.y / this.scaleDistance); // Move to craft position

        const tmpCraft = Object.create(craft); // Create a temporary craft object for simulation
        let futureColision = false;
        tmpCraft.collisionCallback = () => { futureColision = true; }
        for (let i = 0; i < 700; i++) {
            tmpCraft.fireThrusters(0, 0);
            tmpCraft.update(i + 1, this.celestialBodies, 0.1); // Update craft position based on time difference
            let { x, y } = tmpCraft.getPosition(); // Get position of the craft
            x /= this.scaleDistance; // Adjust position for scale
            y /= this.scaleDistance;
            this.ctx.lineTo(x, y); // Draw line to new position
            if (futureColision) break;
        }

        this.ctx.stroke();
        this.ctx.restore();
    }

    drawCraftHistory() {
        if (this.craftHistory.length < 2) return; // Check if there are enough points in history
        this.ctx.save();

        this.applyOffset(); // Apply offset for positioning

        this.ctx.strokeStyle = "yellow"; // Orbit color
        this.ctx.beginPath();

        const { x, y } = this.craftHistory[0]; // Get initial position from history
        this.ctx.moveTo(x / this.scaleDistance, y / this.scaleDistance); // Move to initial position}

        for (const pos of this.craftHistory) {
            const { x, y } = pos; // Get position from history
            this.ctx.lineTo(x / this.scaleDistance, y / this.scaleDistance); // Draw line to new position
        }

        this.ctx.stroke();
        this.ctx.restore();
    }

    addCelestialBody(celestialBody) {
        this.celestialBodies.push(celestialBody);
        for (const child of celestialBody.children) {
            this.addCelestialBody(child); // Recursively add child celestial bodies
        }
    }

    onCollision() {
        this.isDead = true; // Set isDead flag to true on collision
        this.time.setWarpFactor(0);
    }

    setCraftImage(craftImage) {
        this.craftImage = craftImage; // Set image for the craft
    }

    setScaleDistance(scale) {
        if (scale <= 0) {
            scale = 0.001
        }
        this.scaleDistance = scale;
    }

    setScaleBodies(scale) {
        if (scale <= 0) {
            scale = 0.001
        }
        this.scaleBodies = scale;
    }

    setOffset(x, y) {
        this.offset.x = x;
        this.offset.y = y;
    }

    setTimeWarp(timeWarp) {
        this.timeWarp = timeWarp; // Set time warp factor
    }

    getOffset() {
        return this.offset;
    }

    getScale() {
        return {
            distance: this.scaleDistance,
            bodies: this.scaleBodies
        };
    }

    applyOffset() {
        const currentOffsetX = this.offset.x / this.scaleDistance; // Adjust offset for current scale
        const currentOffsetY = this.offset.y / this.scaleDistance;
        this.ctx.translate(currentOffsetX + this.cnvs.width / 2, currentOffsetY + this.cnvs.height / 2); // Apply offset for positioning
    }

    keepLogged(name, logFunction) {
        this.loggables.push({ name, func: logFunction }); // Add loggable object to the array
    }

    logAll() {
        this.ctx.save();
        this.ctx.fillStyle = "white"; // Log color
        this.ctx.font = "12px Arial"; // Log font
        this.ctx.textAlign = "left"; // Text alignment for logging
        this.ctx.textBaseline = "top"; // Text baseline for logging
        this.ctx.resetTransform(); // Reset transformation matrix
        this.ctx.translate(10, 50); // Position for logging
        this.ctx.clearRect(0, 0, 100, 100); // Clear previous logs

        for (const loggable of this.loggables) {
            this.log(loggable.name, loggable.func); // Log each object in the array
            this.ctx.translate(0, 20); // Increment position for next log entry
        }

        this.ctx.restore(); // Restore previous state
    }

    log(name, object) {
        let i = 0;
        let j = 0;
        this.ctx.fillText(name, 10, 10); // Log name
        i++; // Increment position for next log entry
        for (const key in object) {
            if (object.hasOwnProperty(key)) {
                let value = object[key];
                if (key === "parentBody") {
                    value = object[key].name; // Get parent body name
                }
                this.ctx.fillText(`${key}: ${value}`, 10 + i * 160, 10 + j * 20); // Log object properties
                if (i > 1200 / 160) {
                    i = 0; // Reset position for next log 
                    j++; // Increment position for next log entry
                }
                i++; // Increment position for next log entry
            }
        }
    }
}