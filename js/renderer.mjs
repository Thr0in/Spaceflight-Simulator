export class Renderer {
    /**
     * Handles rendering of celestial bodies, craft, and related elements.
     * @param {HTMLCanvasElement} cnvs - The canvas element for rendering.
     * @param {object} time - The time object for managing simulation time.
     */
    constructor(cnvs, time) {
        this.cnvs = cnvs;
        this.ctx = cnvs.getContext("2d");
        this.celestialBodies = [];
        this.scaleDistance = 1;
        this.scaleBodies = 1;
        this.scale = 1;

        this.offset = { x: 0, y: 0 };
        this.lastTime = 0;
        this.timeWarp = 1;

        this.loggables = [];
        this.craftHistory = [];
        this.craftImage = undefined;

        this.isDead = false;
        this.craftAngle = 0;
        this.time = time;
    }

    /**
     * Updates the positions of all celestial bodies based on the elapsed simulation time.
     */
    updateCelestialBodies() {
        for (const body of this.celestialBodies) {
            body.updatePosition(this.time.getTime() / 1000);
        }
    }

    /**
     * Draws all celestial bodies on the canvas.
     */
    drawCelestialBodies() {
        for (const celestialBody of this.celestialBodies) {
            this.drawCelestialBody(celestialBody);
        }
    }

    /**
     * Draws a single celestial body on the canvas.
     * @param {object} celestialBody - The celestial body to draw.
     */
    drawCelestialBody(celestialBody) {
        this.ctx.save();
        this.applyOffset();
        this.ctx.fillStyle = celestialBody.color;

        const position = celestialBody.getPosition();
        const x = position.x / this.scaleDistance;
        const y = position.y / this.scaleDistance;

        let displayRadius = Math.max(celestialBody.radius / this.scaleBodies, 3);
        this.ctx.beginPath();
        this.ctx.arc(x, y, displayRadius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();

        this.drawSphereOfInfluence(celestialBody);
    }

    /**
     * Draws the sphere of influence of a celestial body.
     * @param {object} celestialBody - The celestial body whose sphere of influence is drawn.
     */
    drawSphereOfInfluence(celestialBody) {
        if (!celestialBody.hasParent()) return;

        const position = celestialBody.getPosition();
        const x = position.x / this.scaleDistance;
        const y = position.y / this.scaleDistance;

        this.ctx.save();
        this.applyOffset();
        this.ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        this.ctx.beginPath();

        const displayRadius = celestialBody.sphereOfInfluence / this.scaleDistance;
        this.ctx.arc(x, y, displayRadius, 0, Math.PI * 2);

        const minimumSize = Math.min(this.cnvs.width, this.cnvs.height) / 3;
        if (displayRadius < minimumSize) {
            let alphaValue = 0.1 * (1 - (displayRadius - minimumSize / 3) / (minimumSize - minimumSize / 3));
            alphaValue = Math.max(0, Math.min(0.1, alphaValue)); // Clamp alphaValue between 0 and 0.1
            this.ctx.fillStyle = `rgba(255, 255, 255, ${alphaValue})`;
            this.ctx.fill();
        }
        this.ctx.stroke();
        this.ctx.restore();
    }

    /**
     * Draws the orbits of all celestial bodies.
     */
    drawOrbits() {
        for (const celestialBody of this.celestialBodies) {
            if (celestialBody.hasParent()) {
                this.drawOrbit(celestialBody);
            }
        }
    }

    /**
     * Draws the orbit of a celestial body.
     * @param {object} celestialBody - The celestial body whose orbit is drawn.
     */
    drawOrbit(celestialBody) {
        this.ctx.save();
        this.applyOffset();
        this.ctx.strokeStyle = celestialBody.color;

        const radius = celestialBody.orbitalRadius / this.scaleDistance;
        const parentPosition = celestialBody.getParent().getPosition();
        const x = parentPosition.x / this.scaleDistance;
        const y = parentPosition.y / this.scaleDistance;

        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.restore();
    }

    /**
     * Draws the craft on the canvas.
     * @param {object} craft - The craft to draw.
     * @param {boolean} [useImage=true] - Whether to use an image for the craft.
     */
    drawCraft(craft, useImage = true) {
        const currentTime = this.time.getTime();
        let dt = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        this.ctx.save();
        this.applyOffset();

        if (!this.isDead) {
            craft.update(dt);
        }

        let { x, y } = craft.getPosition();
        const parentPosition = craft.getParent().getPosition();
        x = (x + parentPosition.x) / this.scaleDistance;
        y = (y + parentPosition.y) / this.scaleDistance;

        if (this.craftImage && useImage) {
            this.drawCraftImage(x, y, craft.angle);
        } else {
            this.ctx.fillStyle = "red";
            this.ctx.beginPath();
            this.ctx.arc(x, y, 5, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.restore();
        this.saveCraftPosition(craft);
    }

    /**
     * Draws the craft using an image.
     * @param {number} x - The x-coordinate of the craft.
     * @param {number} y - The y-coordinate of the craft.
     * @param {number} angle - The angle of the craft.
     */
    drawCraftImage(x, y, angle) {
        try {
            this.ctx.save();
            this.ctx.resetTransform();
            this.ctx.translate(x, y);
            this.applyOffset();

            if (!this.isDead) {
                this.craftAngle = angle;
            }
            this.ctx.rotate(this.craftAngle + Math.PI / 4);

            const scale = 1.5 / Math.exp(this.scale);
            this.ctx.scale(scale, scale);
            this.ctx.translate(-20, -20);
            this.ctx.translate(5, -5);
            this.ctx.drawImage(this.craftImage.img, 0, 0, 40, 40);
            this.ctx.restore();
        } catch (e) {
            console.error(e);
            this.craftImage = undefined;
        }
    }

    /**
     * Saves the craft's position in the history array if it has moved significantly.
     * @param {object} craft - The craft object to save the position for.
     */
    saveCraftPosition(craft) {
        const { x, y } = craft.getPosition();
        const parent = craft.getParent();
        if (this.craftHistory.length <= 0) {

            this.craftHistory.push({ x, y, parent });

        } else {
            const lastPos = this.craftHistory[this.craftHistory.length - 1];

            if (Math.abs(lastPos.x - x) > 100 || Math.abs(lastPos.y - y) > 100) {

                this.craftHistory.push({ x, y, parent });

            }

        }


    }

    drawCraftOrbit(craft) {
        this.ctx.save();

        this.applyOffset(); // Apply offset for positioning

        this.ctx.strokeStyle = "red"; // Orbit 
        this.ctx.setLineDash([5, 5]); // Set dashed line style
        this.ctx.beginPath();

        let { x, y } = craft.getPosition();
        const parentPosition = craft.getParent().getPosition();
        x += parentPosition.x;
        y += parentPosition.y;

        this.ctx.moveTo(x / this.scaleDistance, y / this.scaleDistance); // Move to craft position

        const tmpCraft = Object.create(craft); // Create a temporary craft object for simulation
        let futureColision = false;
        tmpCraft.collisionCallback = () => { futureColision = true; }
        const startPosition = tmpCraft.getPosition();
        for (let i = 0; i < 8000; i++) {
            tmpCraft.fireThrusters(0, 0);
            tmpCraft.update(i**0.5, 0.9**(i**0.5)); // Update craft position based on time difference
            let { x, y } = tmpCraft.getPosition(); // Get position of the craft
            if (i > 100 && Math.abs(startPosition.x - x) < 500 && Math.abs(startPosition.y - y) < 500) break;
            const parentPosition = tmpCraft.getParent().getPosition();
            x += parentPosition.x;
            y += parentPosition.y;
            x /= this.scaleDistance; // Adjust position for scale
            y /= this.scaleDistance;
            this.ctx.lineTo(x, y); // Draw line to new position
            if (futureColision) break;
        }

        this.ctx.stroke();
        this.ctx.restore();
    }

    /**
     * Draws the craft's historical trajectory.
     */
    drawCraftHistory() {
        if (this.craftHistory.length < 2) return;

        this.ctx.save();
        this.applyOffset();
        this.ctx.strokeStyle = "yellow";
        this.ctx.beginPath();

        for (const pos of this.craftHistory) {
            const parentPosition = pos.parent.getPosition();
            const x = (pos.x + parentPosition.x) / this.scaleDistance;
            const y = (pos.y + parentPosition.y) / this.scaleDistance;
            this.ctx.lineTo(x, y);
        }

        this.ctx.stroke();
        this.ctx.restore();
    }

    /**
     * Adds a celestial body and its children to the renderer.
     * @param {object} celestialBody - The celestial body to add.
     */
    addCelestialBody(celestialBody) {
        this.celestialBodies.push(celestialBody);
        for (const child of celestialBody.children) {
            this.addCelestialBody(child);
        }
    }

    /**
     * Handles collision events by stopping the simulation.
     */
    onCollision() {
        this.isDead = true;
        this.time.setWarpFactor(0);
    }

    /**
     * Sets the image to represent the craft.
     * @param {object} craftImage - The image object for the craft.
     */
    setCraftImage(craftImage) {
        this.craftImage = craftImage;
    }

    /**
     * Sets the scale for distances in the simulation.
     * @param {number} scale - The scale factor for distances.
     */
    setScaleDistance(scale) {
        this.scaleDistance = Math.max(scale, 0.001);
    }

    /**
     * Sets the scale for celestial body sizes.
     * @param {number} scale - The scale factor for celestial body sizes.
     */
    setScaleBodies(scale) {
        this.scaleBodies = Math.max(scale, 0.001);
    }

    /**
     * Sets the offset for rendering.
     * @param {number} x - The x-offset.
     * @param {number} y - The y-offset.
     */
    setOffset(x, y) {
        this.offset.x = x;
        this.offset.y = y;
    }

    /**
     * Sets the time warp factor for the simulation.
     * @param {number} timeWarp - The time warp factor.
     */
    setTimeWarp(timeWarp) {
        this.timeWarp = timeWarp;
    }

    /**
     * Retrieves the current rendering offset.
     * @returns {object} The offset with x and y properties.
     */
    getOffset() {
        return this.offset;
    }

    /**
     * Retrieves the current scale for distances and celestial body sizes.
     * @returns {object} An object containing the distance and body scale factors.
     */
    getScale() {
        return {
            distance: this.scaleDistance,
            bodies: this.scaleBodies
        };
    }

    /**
     * Applies the current offset to the rendering context.
     */
    applyOffset() {
        const currentOffsetX = this.offset.x / this.scaleDistance;
        const currentOffsetY = this.offset.y / this.scaleDistance;
        this.ctx.translate(
            currentOffsetX + this.cnvs.width / 2,
            currentOffsetY + this.cnvs.height / 2
        );
    }

    /**
     * Adds an object to the list of loggable items.
     * @param {string} name - The name of the object to log.
     * @param {object} object - The object to log.
     */
    keepLogged(name, object) {
        this.loggables.push({ name, obj: object });
    }

    /**
     * Logs all registered objects to the canvas.
     */
    logAll() {
        this.ctx.save();
        this.ctx.fillStyle = "white";
        this.ctx.font = "12px Arial";
        this.ctx.textAlign = "left";
        this.ctx.textBaseline = "top";
        this.ctx.resetTransform();
        this.ctx.translate(10, 50);

        for (const loggable of this.loggables) {
            this.log(loggable.name, loggable.obj);
            this.ctx.translate(0, 20);
        }

        this.ctx.restore();
    }

    /**
     * Logs a specific object to the canvas and console.
     * @param {string} name - The name of the object.
     * @param {object} object - The object to log.
     */
    log(name, object) {
        let row = 0;
        let column = 0;

        this.ctx.fillText(name, 10, 10);

        for (const key in object) {
            if (object.hasOwnProperty(key)) {
                let value = object[key];
                if (key === "parentBody" && value) {
                    value = value.name;
                }

                this.ctx.fillText(
                    `${key}: ${value}`,
                    10 + row * 180,
                    10 + column * 20
                );

                if (row > 1000 / 160) {
                    row = 0;
                    column++;
                }

                row++;
            }
        }
    }
}