import { distance } from "./utils.mjs";

export class CelestialBody {
  constructor(name, mass, radius, color = "#000", orbitalRadius = 0, angle = 0, parent = undefined) {
    this.name = name;
    this.mass = mass; // in kg
    this.radius = radius; // in km
    this.color = color; // Celestial body color

    this.orbitalRadius = orbitalRadius; // in km (for planets)
    this.angle = angle; // angle in radians (for planets)
    this.parent = parent; // Parent celestial body (e.g., sun for planets)
    this.children = []; // Array to hold child celestial bodies (e.g., moons for planets)

    this.x = 0; // x position in km
    this.y = 0; // y position in km
  }

  createChild(name, mass, radius, color, orbitalRadius, angle = 0) {
    const child = new CelestialBody(name, mass, radius, color, orbitalRadius, angle, this)
    this.children.push(child);
    return child;
  }

  hasChildren() {
    return this.children.length > 0;
  }

  hasParent() {
    return this.parent !== undefined;
  }

  getParent() {
    return this.parent;
  }

  getChildren() {
    return this.children;
  }

  getGravitationalForce(otherMass, { x, y }) {
    const G = 6.67430e-11; // gravitational constant in m^3 kg^-1 s^-2
    this.getPosition(); // Update position based on parent
    const dx = (x - this.x) * 1000; // Convert km to meters
    const dy = (y - this.y) * 1000; // Convert km to meters
    const distance = Math.sqrt(dx * dx + dy * dy); // distance in meters
    
    let force = 0;
    force = (G * this.mass * otherMass) / Math.pow(distance, 2);
    const angle = Math.atan2(dy, dx); // angle in radians
    const fx = -force * Math.cos(angle);
    const fy = -force * Math.sin(angle);
    return { fx, fy };
  }

  getPosition() {
    const parentPosition = this.hasParent() ? this.parent.getPosition() : { x: 0, y: 0 };
    this.x = parentPosition.x + this.orbitalRadius * Math.cos(this.angle);
    this.y = parentPosition.y + this.orbitalRadius * Math.sin(this.angle);
    return { x: this.x, y: this.y };
  }
}
