import { distance } from "./utils.mjs";

export class Craft {
    constructor(name, mass, parentBody, x, y, vx = 0, vy = 0) {
        this.name = name;
        this.mass = mass;
        this.maxThrust = 15000; // Maximum thrust in Newtons
        this.parentBody = parentBody; // The celestial body it is 

        this.x = x; // Initial x position
        this.y = y; // Initial y 
        this.angle = 0; // Initial angle in radians

        this.vx = vx; // Initial x velocity
        this.vy = vy; // Initial y velocity
        this.ax = 0; // Initial x acceleration
        this.ay = 0; // Initial y acceleration
        this.thrustX = 0;
        this.thrustY = 0;
        this.netForceX = 0;
        this.netForceY = 0;

        this.isLanded = true;
        this.maximumImpactVelocity = 500; // Maximum impact velocity in m/s
        this.collisionCallback = undefined;
    }

    fireThrusters(angle, strength) {
        // Calculate thrust based on angle and strength
        this.angle = angle; // Update angle
        this.thrustX = this.maxThrust * strength * Math.cos(angle);
        this.thrustY = this.maxThrust * strength * Math.sin(angle);
        //console.log('schub', this.thrustX, this.thrustY);
    }

    setParentBody(parentBody) {
        this.parentBody = parentBody; // Set the parent celestial body
    }

    setPosition({ x, y }) {
        this.x = x; // Set x position
        this.y = y; // Set y position
    }

    getPosition() {
        // Calculate stuff
        return { x: this.x, y: this.y };
    }

    calculateNetForce(celestialBodies) {
        // Calculate net force acting on the craft
        //const gravitationalForce = this.parentBody.getGravitationalForce(this.mass, this.getPosition()); // Gravitational force in Newtons
        const gravitationalForceSum = { fx: 0, fy: 0 };
        for (const body of celestialBodies) {
            const gravitationalForce = body.getGravitationalForce(this.mass, this.getPosition()); // Gravitational force in Newtons
            gravitationalForceSum.fx += gravitationalForce.fx;
            gravitationalForceSum.fy += gravitationalForce.fy;
        }
        //console.log('G-Force', gravitationalForce);
        this.netForceX = gravitationalForceSum.fx + this.thrustX;
        this.netForceY = gravitationalForceSum.fy + this.thrustY;
        //console.log('Force', this.netForceX, this.netForceY);
    }

    updateParentBody(celestialBodies) {
        let distanceToParent = distance(this.x, this.y, this.parentBody.x, this.parentBody.y);
        for (const body of celestialBodies) {
            const bodyPosition = body.getPosition();
            const distanceToBody = distance(this.x, this.y, bodyPosition.x, bodyPosition.y);
            if (distanceToParent > distanceToBody) {
                distanceToParent = distanceToBody;
                this.setParentBody(body); // Update parent body if closer celestial body is found
            }
        }
    }

    calculateAcceleration() {
        this.ax = this.netForceX / this.mass; // Acceleration in x direction
        this.ay = this.netForceY / this.mass; // Acceleration in y direction
        //console.log('Beschleunigung', this.ax, this.ay)
    }

    checkForCollision() {
        // Simple collision detection with the parent body
        const parentPosition = this.parentBody.getPosition(); // Get parent position
        const distanceToParent = distance(this.x, this.y, parentPosition.x, parentPosition.y); // Calculate distance to parent body
        if (distanceToParent < this.parentBody.radius) {
            if (Math.sqrt(this.vx ** 2 + this.vy ** 2) > this.maximumImpactVelocity) {
                if (this.collisionCallback) {
                    this.collisionCallback(); // Call collision callback if defined
                }
            } else {
                this.isLanded = true; // Set landed state to true
            }
            const normalX = (this.x - parentPosition.x) / distanceToParent; // Normalized x component of collision
            const normalY = (this.y - parentPosition.y) / distanceToParent; // Normalized y component of collision
            const dotProduct = this.vx * normalX + this.vy * normalY; // Dot product of velocity and normal

            // If the dot product is positive, the craft is moving away from the surface
            if (dotProduct > 0) {
                this.isLanded = false;
            }

            // Reflect velocity vector based on the normal
            this.vx -= 2 * dotProduct * normalX;
            this.vy -= 2 * dotProduct * normalY;


            const dampeningFactor = 0.4; // Reduce velocity after collision
            // Apply dampening factor
            this.vx *= dampeningFactor;
            this.vy *= dampeningFactor;
        }
    }

    calculateVelocity(dt) {
        // Calculate velocity based on thrust and time
        this.vx += this.ax * dt; // Update x velocity
        this.vy += this.ay * dt; // Update y velocity
    }

    calculatePosition(dt) {
        // Calculate position based on velocity and time
        this.x += this.vx * dt / 1000; // Update x position
        this.y += this.vy * dt / 1000; // Update y position
    }

    update(dt, celestialBodies, physicsStepsPerSecond = 100) {
        for (let i = 1; i <= Math.ceil(dt * physicsStepsPerSecond); i++) {
            this.calculateNetForce(celestialBodies);
            this.calculateAcceleration();
            this.checkForCollision();
            this.calculateVelocity(i / 100); // Update 
            //console.log(this.vx, this.vy);
            this.calculatePosition(i / 100); // Update position
            //console.log(this.x, this.y);
        }
        this.updateParentBody(celestialBodies)
    }
}