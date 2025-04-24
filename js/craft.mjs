import { getDistance } from "./utils.mjs";

export class Craft {
    /**
     * Represents a spacecraft.
     * @param {string} name - The name of the craft.
     * @param {number} mass - The mass of the craft in kilograms.
     * @param {object} parentBody - The celestial body the craft orbits.
     * @param {number} x - Initial x position relative to the parent body.
     * @param {number} y - Initial y position relative to the parent body.
     */
    constructor(name, mass, parentBody, x, y) {
        this.name = name;
        this.mass = mass;
        this.maximumThrust = 5000;
        this.maximumNormedThrust = null;
        this.parentBody = parentBody;

        this.x = x;
        this.y = y;
        this.angle = 0;

        this.vx = 0;
        this.vy = 0;
        this.ax = 0;
        this.ay = 0;
        this.thrustX = 0;
        this.thrustY = 0;
        this.netForceX = 0;
        this.netForceY = 0;

        this.isLanded = true;
        this.wasLanded = false;
        this.isCrashed = false;
        this.impactVelocity = 0;
        this.maximumImpactVelocity = 500;
        this.collisionCallback = undefined;

        this.landedBodies = [];

        this.updateMaximumNormedThrust();
    }

    /**
     * Fires the thrusters to apply thrust in a specific direction.
     * @param {number} angle - The angle of thrust in radians.
     * @param {number} strength - The strength of the thrust (0 to 1).
     */
    fireThrusters(angle, strength) {
        this.angle = angle;
        this.thrustX = this.maximumNormedThrust * strength * Math.cos(angle);
        this.thrustY = this.maximumNormedThrust * strength * Math.sin(angle);
    }

    /**
     * Sets the parent celestial body of the craft.
     * @param {object} parentBody - The new parent celestial body.
     */
    setParentBody(parentBody) {
        this.parentBody = parentBody;
    }

    /**
     * Gets the parent celestial body of the craft.
     * @returns {object} The parent celestial body.
     */
    getParent() {
        return this.parentBody;
    }

    /**
     * Updates the maximum normalized thrust based on the surface gravity of the parent body.
     */
    updateMaximumNormedThrust() {
        this.maximumNormedThrust = this.parentBody.getSurfaceGravity() * this.maximumThrust;
    }

    /**
     * Sets the position of the craft.
     * @param {object} position - The new position with x and y coordinates.
     */
    setPosition({ x, y }) {
        this.x = x;
        this.y = y;
        this.isLanded = true;
        this.wasLanded = false;
    }

    /**
     * Gets the current position of the craft relative to the parent body.
     * @returns {object} The position with x and y coordinates.
     */
    getPosition() {
        return { x: this.x, y: this.y };
    }

    /**
     * Gets the absolute position of the craft in the simulation.
     * @returns {object} The absolute position with x and y coordinates.
     */
    getAbsolutePosition() {
        const parentPosition = this.parentBody.getPosition();
        const localPosition = this.getPosition();
        return {
            x: parentPosition.x + localPosition.x,
            y: parentPosition.y + localPosition.y
        };
    }

    /**
     * Calculates the surface velocity of the craft.
     * @returns {number} The surface velocity in m/s.
     */
    getSurfaceVelocity() {
        return Math.sqrt(this.vx ** 2 + this.vy ** 2);
    }

    /**
     * Calculates the vertical velocity of the craft relative to the parent body.
     * @returns {number} The vertical velocity in m/s.
     */
    getVerticalVelocity() {
        const normalVector = this.getNormalVector();
        return this.vx * normalVector.x + this.vy * normalVector.y;
    }

    /**
     * Calculates the altitude of the craft above the parent body's surface.
     * @returns {number} The altitude in meters.
     */
    getAltitude() {
        return getDistance(this.x, this.y, 0, 0) - this.parentBody.radius;
    }

    /**
     * Calculates the normal vector from the craft to the parent body.
     * @returns {object} The normal vector with x and y components.
     */
    getNormalVector() {
        const distanceToParent = getDistance(this.x, this.y, 0, 0);
        return { x: this.x / distanceToParent, y: this.y / distanceToParent };
    }

    /**
     * Calculates the net force acting on the craft, including gravitational and thrust forces.
     */
    calculateNetForce() {
        const gravitationalForce = this.parentBody.getGravitationalForce(this.mass, this.getPosition());
        this.netForceX = gravitationalForce.fx + this.thrustX;
        this.netForceY = gravitationalForce.fy + this.thrustY;
    }

    /**
     * Updates the parent celestial body of the craft based on its position.
     */
    updateParentBody() {
        const distanceToParent = getDistance(this.x, this.y, 0, 0);
        if (distanceToParent > this.parentBody.sphereOfInfluence) {
            const parentLocalPosition = this.parentBody.getLocalPosition();
            this.x += parentLocalPosition.x;
            this.y += parentLocalPosition.y;
            this.setParentBody(this.parentBody.getParent());
        }
        if (this.parentBody.hasChildren()) {
            for (const child of this.parentBody.getChildren()) {
                const childLocalPosition = child.getLocalPosition();
                const distanceToChild = getDistance(this.x, this.y, childLocalPosition.x, childLocalPosition.y);

                if (distanceToChild < child.sphereOfInfluence) {
                    this.x -= childLocalPosition.x;
                    this.y -= childLocalPosition.y;
                    this.setParentBody(child);
                }
            }
        }
        this.updateMaximumNormedThrust();
    }

    /**
     * Calculates the acceleration of the craft based on the net force and mass.
     */
    calculateAcceleration() {
        this.ax = this.netForceX / this.mass;
        this.ay = this.netForceY / this.mass;
    }

    /**
     * Checks for collisions with the parent body and handles the collision response.
     * @param {number} dt - The time step in seconds.
     */
    checkForCollision(dt) {
        const distanceToParent = getDistance(this.x, this.y, 0, 0);
        const normalVector = this.getNormalVector();

        this.wasLanded = this.isLanded;

        if (distanceToParent > this.parentBody.radius) {
            this.calculateVelocity(dt);
            return;
        }

        const velocityMagnitude = this.getSurfaceVelocity();

        if (velocityMagnitude > this.maximumImpactVelocity) {
            this.handleCrash(velocityMagnitude);
        } else {
            this.handleLanding();
        }

        this.resolveCollision(normalVector, dt);
    }

    /**
     * Handles the crash scenario when the craft exceeds the maximum impact velocity.
     * @param {number} velocityMagnitude - The magnitude of the craft's velocity.
     */
    handleCrash(velocityMagnitude) {
        if (this.collisionCallback) {
            this.isCrashed = true;
            this.impactVelocity = velocityMagnitude;
            this.collisionCallback();
        }
    }

    /**
     * Handles the landing scenario when the craft safely lands on the parent body.
     */
    handleLanding() {
        this.isLanded = true;

        if (!this.wasLanded && !this.landedBodies.includes(this.parentBody.name)) {
            this.landedBodies.push(this.parentBody.name);
        }
    }

    /**
     * Resolves the collision by adjusting the craft's velocity and applying dampening.
     * @param {object} normalVector - The normal vector from the craft to the parent body.
     * @param {number} dt - The time step in seconds.
     */
    resolveCollision(normalVector, dt) {
        const dotProduct = this.vx * normalVector.x + this.vy * normalVector.y;

        if (dotProduct > 0) {
            this.isLanded = false;
        }

        this.vx -= 2 * dotProduct * normalVector.x;
        this.vy -= 2 * dotProduct * normalVector.y;

        const dampeningFactor = 0.4;
        this.vx *= dampeningFactor;
        this.vy *= dampeningFactor;

        const accelerationDotProduct = this.ax * normalVector.x + this.ay * normalVector.y;
        if (accelerationDotProduct > 0) {
            this.calculateVelocity(dt);
        }
    }

    /**
     * Updates the velocity of the craft based on acceleration and time.
     * @param {number} dt - The time step in seconds.
     */
    calculateVelocity(dt) {
        this.vx += this.ax * dt;
        this.vy += this.ay * dt;
    }

    /**
     * Updates the position of the craft based on velocity and time.
     * @param {number} dt - The time step in milliseconds.
     */
    calculatePosition(dt) {
        this.x += this.vx * dt / 1000;
        this.y += this.vy * dt / 1000;
    }

    /**
     * Updates the craft's state, including forces, acceleration, collisions, and position.
     * @param {number} dt - The time step in milliseconds.
     * @param {number} physicsStepsPerSecond - The number of physics steps per second.
     */
    update(dt, physicsStepsPerSecond = 20) {
        const stepLength = 1 / physicsStepsPerSecond;
        for (let i = 1; i <= Math.ceil(dt * physicsStepsPerSecond); i++) {
            this.calculateNetForce();
            this.calculateAcceleration();
            this.checkForCollision(stepLength);
            this.calculatePosition(stepLength);
        }
        this.updateParentBody();
    }
}