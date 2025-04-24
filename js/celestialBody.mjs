import { getDistance } from "./utils.mjs";

const G = 6.67430e-11; // Gravitational constant in m^3 kg^-1 s^-2

export class CelestialBody {
    /**
     * Represents a celestial body such as a planet, moon, or star.
     * @param {string} name - The name of the celestial body.
     * @param {number} mass - The mass of the celestial body in kilograms.
     * @param {number} radius - The radius of the celestial body in kilometers.
     * @param {string} color - The color used to represent the celestial body.
     * @param {number} orbitalRadius - The orbital radius in kilometers (relative to its parent body).
     * @param {number} angle - The initial angle of the celestial body in radians.
     * @param {CelestialBody} [parent] - The parent celestial body (e.g., the sun for planets).
     */
    constructor(name, mass, radius, color = "#000", orbitalRadius = 0, angle = 0, parent = undefined) {
        this.name = name;
        this.mass = mass;
        this.radius = radius;
        this.color = color;

        this.orbitalRadius = orbitalRadius;
        this.sphereOfInfluence = parent
            ? orbitalRadius * (mass / parent.mass) ** (2 / 5)
            : Infinity;

        this.initialAngle = angle;
        this.currentAngle = angle;

        this.parent = parent;
        this.children = [];

        this.x = 0;
        this.y = 0;
    }

    /**
     * Creates a child celestial body (e.g., a moon for a planet).
     * @param {string} name - The name of the child celestial body.
     * @param {number} mass - The mass of the child in kilograms.
     * @param {number} radius - The radius of the child in kilometers.
     * @param {string} color - The color used to represent the child.
     * @param {number} orbitalRadius - The orbital radius of the child in kilometers.
     * @param {number} angle - The initial angle of the child in radians.
     * @returns {CelestialBody} The created child celestial body.
     */
    createChild(name, mass, radius, color, orbitalRadius, angle = 0) {
        const child = new CelestialBody(name, mass, radius, color, orbitalRadius, angle, this);
        this.children.push(child);
        return child;
    }

    /**
     * Checks if the celestial body has child bodies.
     * @returns {boolean} True if the celestial body has children, otherwise false.
     */
    hasChildren() {
        return this.children.length > 0;
    }

    /**
     * Checks if the celestial body has a parent body.
     * @returns {boolean} True if the celestial body has a parent, otherwise false.
     */
    hasParent() {
        return this.parent !== undefined;
    }

    /**
     * Gets the parent celestial body.
     * @returns {CelestialBody} The parent celestial body.
     */
    getParent() {
        return this.parent;
    }

    /**
     * Gets the child celestial bodies.
     * @returns {CelestialBody[]} An array of child celestial bodies.
     */
    getChildren() {
        return this.children;
    }

    /**
     * Calculates the gravitational force exerted by this body on another mass.
     * @param {number} otherMass - The mass of the other object in kilograms.
     * @param {object} position - The position of the other object relative to this body.
     * @returns {object} The gravitational force vector with x and y components.
     */
    getGravitationalForce(otherMass, { x, y }) {
        const distance = getDistance(x * 1000, y * 1000, 0, 0);
        const force = (G * this.mass * otherMass) / Math.pow(distance, 2);
        const angle = Math.atan2(y, x);
        return {
            fx: -force * Math.cos(angle),
            fy: -force * Math.sin(angle),
        };
    }

    /**
     * Updates the position of the celestial body based on the elapsed time.
     * @param {number} time - The elapsed time in seconds.
     */
    updatePosition(time) {
        const parentPosition = this.hasParent()
            ? this.parent.getPosition(time)
            : { x: 0, y: 0 };

        this.currentAngle = this.hasParent()
            ? this.initialAngle - (2 * Math.PI * time) / this.getOrbitalPeriod()
            : this.initialAngle;

        this.x = parentPosition.x + this.orbitalRadius * Math.cos(this.currentAngle);
        this.y = parentPosition.y + this.orbitalRadius * Math.sin(this.currentAngle);
    }

    /**
     * Gets the absolute position of the celestial body.
     * @returns {object} The position with x and y coordinates.
     */
    getPosition() {
        return { x: this.x, y: this.y };
    }

    /**
     * Gets the position of the celestial body relative to its parent.
     * @returns {object} The local position with x and y coordinates.
     */
    getLocalPosition() {
        return this.hasParent()
            ? { x: this.x - this.parent.x, y: this.y - this.parent.y }
            : this.getPosition();
    }

    /**
     * Calculates the orbital velocity of the celestial body.
     * @returns {number} The orbital velocity in meters per second.
     */
    getOrbitalVelocity() {
        if (this.hasParent()) {
            const gm = G * this.parent.mass;
            return Math.sqrt(gm / (this.orbitalRadius * 1000));
        }
        return 0;
    }

    /**
     * Calculates the orbital period of the celestial body.
     * @returns {number} The orbital period in seconds.
     */
    getOrbitalPeriod() {
        if (this.hasParent()) {
            return (2 * Math.PI * this.orbitalRadius * 1000) / this.getOrbitalVelocity();
        }
        return Infinity;
    }

    /**
     * Calculates the orbital velocity vector of the celestial body.
     * @returns {object} The velocity vector with vx and vy components.
     */
    getOrbitalVelocityVector() {
        const v = this.getOrbitalVelocity();
        return {
            vx: v * Math.sin(this.currentAngle),
            vy: v * Math.cos(this.currentAngle),
        };
    }

    /**
     * Calculates the surface gravity of the celestial body.
     * @returns {number} The surface gravity in meters per second squared.
     */
    getSurfaceGravity() {
        return (G * this.mass) / Math.pow(this.radius * 1000, 2);
    }
}
