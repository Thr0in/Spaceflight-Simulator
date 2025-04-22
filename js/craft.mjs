import { distance } from "./utils.mjs";
// TODO: Implement correct velocity handling.
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
        this.wasLanded = false;
        this.dx = null;
        this.dy = null;
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
        const parentVelocity = this.parentBody.getOrbitalVelocityVector();
        this.vx = parentVelocity.vx;
        this.vy = parentVelocity.vy;
        this.isLanded = true;
        this.wasLanded = false;
        this.updateParentRelativePosition();
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

    checkForCollision(dt) {
        // Simple collision detection with the parent body
        const parentPosition = this.parentBody.getPosition(); // Get parent position
        const distanceToParent = distance(this.x, this.y, parentPosition.x, parentPosition.y); // Calculate distance to parent body
        const normalX = (this.x - parentPosition.x) / distanceToParent; // Normalized x component of collision
        const normalY = (this.y - parentPosition.y) / distanceToParent; // Normalized y component of collision

        this.wasLanded = this.isLanded;

        if (distanceToParent <= this.parentBody.radius) {
            const parentVelocity = this.parentBody.getOrbitalVelocityVector();
            const localVelocity = { vx: this.vx - parentVelocity.vx, vy: this.vy - parentVelocity.vy }
            if (Math.sqrt(localVelocity.vx ** 2 + localVelocity.vy ** 2) > this.maximumImpactVelocity) {
                if (this.collisionCallback) {
                    //this.collisionCallback(); // Call collision callback if defined
                }
            } else {
                this.isLanded = true; // Set landed state to true
            }
            const dotProduct = localVelocity.vx * normalX + localVelocity.vy * normalY; // Dot product of velocity and normal

            // If the dot product is positive, the craft is moving away from the surface
            if (dotProduct > 0) {
                this.isLanded = false;
            }

            // Reflect velocity vector based on the normal
            localVelocity.vx -= 2 * dotProduct * normalX;
            localVelocity.vy -= 2 * dotProduct * normalY;


            const dampeningFactor = 0.4; // Reduce velocity after collision
            // Apply dampening factor
            localVelocity.vx *= dampeningFactor;
            localVelocity.vy *= dampeningFactor;

            // Calculate acceleration dot product
            const accelerationDotProduct = this.ax * normalX + this.ay * normalY; // Dot product of acceleration and normal
            //console.log('accelerationDotProduct', accelerationDotProduct);

            this.vx = localVelocity.vx + parentVelocity.vx;
            this.vy = localVelocity.vy + parentVelocity.vy;

            if (accelerationDotProduct > 0) {
                this.calculateVelocity(dt);
            }
        } else this.calculateVelocity(dt); // Calculate velocity if not colliding
    }

    calculateVelocity(dt) {
        // Calculate velocity based on thrust and time
        this.vx += this.ax * dt; // Update x velocity
        this.vy += this.ay * dt; // Update y velocity
    }

    updateParentRelativePosition() {
        if (!this.wasLanded && this.isLanded) {
            const parentPosition = this.parentBody.getPosition();
            const parentVelocity = this.parentBody.getOrbitalVelocityVector();
            this.dx = this.x - parentPosition.x;
            this.dy = this.y - parentPosition.y;
            this.vx -= parentVelocity.vx;
            this.vy -= parentVelocity.vy;
        }
        if (this.wasLanded && !this.isLanded) {
            const parentVelocity = this.parentBody.getOrbitalVelocityVector();
            this.vx += parentVelocity.vx;
            this.vy += parentVelocity.vy;
            this.dx = null;
            this.dy = null;
        }
    }

    calculatePosition(dt) {
        // Calculate position based on velocity and time
        if (this.isLanded) {
            const parentPosition = this.parentBody.getPosition();
            this.x = parentPosition.x + this.dx;
            this.y = parentPosition.y + this.dy;
        } else {
            this.x += this.vx * dt / 1000; // Update x position
            this.y += this.vy * dt / 1000; // Update y position
        }
    }

    update(dt, celestialBodies, physicsStepsPerSecond = 100) {
        for (let i = 1; i <= Math.ceil(dt * physicsStepsPerSecond); i++) {
            this.calculateNetForce(celestialBodies);
            this.calculateAcceleration();
            this.checkForCollision(i / 100);
            this.updateParentRelativePosition();
            //this.calculateVelocity(i / 100); // Update 
            //console.log(this.vx, this.vy);
            this.calculatePosition(i / 100); // Update position
            //console.log(this.x, this.y);
        }
        this.updateParentBody(celestialBodies)
    }
}