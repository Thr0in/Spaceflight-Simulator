import { createMovementController, loadImage } from "./js/utils.mjs";
import { Joystick } from "./js/joystick.mjs";
import { Slider } from "./js/slider.mjs";
import { CelestialBody } from "./js/celestialBody.mjs";
import { Renderer } from "./js/renderer.mjs";
import { Craft } from "./js/craft.mjs";
import { Button } from "./js/button.mjs";
import { Time } from "./js/time.mjs";

window.onload = () => {
    let cnv = document.getElementById("cnv");
    let ctx = cnv.getContext("2d");


    function resize() {
        cnv.width = window.innerWidth;
        cnv.height = window.innerHeight;
    }

    addEventListener("resize", resize);

    resize();

    const time = new Time();
    const renderer = new Renderer(cnv, time);
    const craftImage = loadImage("./images/rocket-312767.svg"); // Load craft image
    renderer.setCraftImage(craftImage); // Set craft image in renderer

    const speedMultiplier = 5;
    const scaleMax = 2.5 * 4495.1e6 / Math.min(cnv.width, cnv.height); // Maximum scale for rendering celestial bodies (e.g., distance to Neptune)
    const scaleMin = 10;

    const joystickRadius = 50;
    const joystickX = Math.min(cnv.width * 0.9, cnv.width - joystickRadius * 2.5);
    const joystickY = Math.min(cnv.height * 0.9, cnv.height - joystickRadius * 2.5);
    const joystick = new Joystick(joystickX, joystickY, "#fff", joystickRadius);

    const sliderWidth = 20;
    const sliderX = Math.max(cnv.width * 0.05, 1.5 * sliderWidth);
    const sliderY = Math.min(cnv.height * 0.95, cnv.height - 1.5 * sliderWidth);
    const slider = new Slider(sliderX, sliderY, "#fff", sliderWidth, -cnv.height + 2 * sliderY);

     // Create time warp buttons
    const buttonWidth = 120;
    const buttons = [];
    for (let i = 0; i < 10; i++) {
        const warpFactor = (i <= 2) ? 2 ** i : 10 ** (i - 2);
        const button = new Button(10 + i * (buttonWidth + 10), 10, buttonWidth, 35, `x ${warpFactor}`, "#fff", "#000");
        button.setCallback(() => {
            for (const button of buttons) {
                button.isPressed = false;
            }
            time.setWarpFactor(warpFactor);
        });
        buttons.push(button);
    }
    buttons.at(0).isPressed = true;

    const movementController = createMovementController();

    const craft = new Craft("Craft", 1000, null, 0, 0); // Example craft

    craft.collisionCallback = () => {
        console.log("Collision detected!");
        renderer.onCollision(); // Call collision method in renderer
    }

    cnv.addEventListener("touchstart", (evt) => {
        evt.preventDefault();
        for (let touch of evt.changedTouches) {
            let eventHandled = false;
            eventHandled = joystick.onTouchStart(touch.identifier, touch.clientX, touch.clientY);
            eventHandled |= slider.onTouchStart(touch.identifier, touch.clientX, touch.clientY);
            for (const button of buttons) {
                eventHandled |= button.onTouchStart(touch.identifier, evt.clientX, evt.clientY);
            }
            if (!eventHandled) {
                movementController.onTouchStart(touch.identifier, touch.clientX, touch.clientY);
            }
        }
    });

    cnv.addEventListener("touchmove", (evt) => {
        evt.preventDefault();
        for (let touch of evt.changedTouches) {
            let eventHandled = false;
            eventHandled = joystick.onTouchMove(touch.identifier, touch.clientX, touch.clientY);
            eventHandled |= slider.onTouchMove(touch.identifier, touch.clientX, touch.clientY);
            for (const button of buttons) {
                eventHandled |= button.isInside(evt.clientX, evt.clientY);
            }
            if (!eventHandled) {
                movementController.onTouchMove(touch.identifier, touch.clientX, touch.clientY);
            }
        }
    });

    cnv.addEventListener("touchend", (evt) => {
        evt.preventDefault();
        for (let touch of evt.changedTouches) {
            let eventHandled = false;
            eventHandled = joystick.onTouchEnd(touch.identifier);
            eventHandled |= slider.onTouchEnd(touch.identifier);
            for (const button of buttons) {
                eventHandled |= button.onTouchEnd(touch.identifierl, evt.clientX, evt.clientY);
            }
            if (!eventHandled) {
                movementController.onTouchEnd(touch.identifier);
            }
        }
    });

    cnv.addEventListener("wheel", (evt) => {
        evt.preventDefault();
        movementController.onScroll(evt.deltaY);
    });

    const mouseId = "mouse";

    cnv.addEventListener("mousedown", (evt) => {
        evt.preventDefault();
        let eventHandled = false;
        eventHandled = joystick.onTouchStart(mouseId, evt.clientX, evt.clientY);
        eventHandled |= slider.onTouchStart(mouseId, evt.clientX, evt.clientY);
        for (const button of buttons) {
            eventHandled |= button.onTouchStart(mouseId, evt.clientX, evt.clientY);
        }
        if (!eventHandled) {
            movementController.onTouchStart(mouseId, evt.clientX, evt.clientY);
        }
    });

    cnv.addEventListener("mousemove", (evt) => {
        evt.preventDefault();
        let eventHandled = false;
        eventHandled = joystick.onTouchMove(mouseId, evt.clientX, evt.clientY);
        eventHandled |= slider.onTouchMove(mouseId, evt.clientX, evt.clientY);
        if (!eventHandled) {
            movementController.onTouchMove(mouseId, evt.clientX, evt.clientY);
        }
    });

    cnv.addEventListener("mouseup", (evt) => {
        evt.preventDefault();
        let eventHandled = false;
        eventHandled = joystick.onTouchEnd(mouseId);
        eventHandled |= slider.onTouchEnd(mouseId);
        for (const button of buttons) {
            eventHandled |= button.onTouchEnd(mouseId, evt.clientX, evt.clientY);
        }
        if (!eventHandled) {
            movementController.onTouchEnd(mouseId);
        }
    });


    const sun = new CelestialBody("Sun", 1.989e30, 696340, "#ffcc00"); // mass in kg, radius in km

    // Planets: mass in kg, radius in km, distance from sun in km, initial angle in radians
    // Planet positions are approximated for simplicity
    sun.createChild("Mercury", 3.285e23, 2439.7, "#6d6b68", 57.91e6, 3.14);
    sun.createChild("Venus", 4.867e24, 6051.8, "#f3dbc5", 108.2e6, 1.57);
    const earth = sun.createChild("Earth", 5.972e24, 6371, "#6288a8", 149.6e6, 0);
    earth.createChild("Moon", 7.34767309e22, 1737.4, "#b0b0b0", 384400, 7); // Moon orbiting Earth
    sun.createChild("Mars", 6.417e23, 3389.5, "#c36d5c", 227.9e6, 4.71);
    sun.createChild("Saturn", 5.683e26, 58232, "#dab778", 1433.5e6, 3.67);
    sun.createChild("Uranus", 8.681e25, 25362, "#95bbbe", 2872.5e6, 0.52);
    sun.createChild("Neptune", 1.024e26, 24622, "#7595bf", 4495.1e6, 2.83);

    renderer.addCelestialBody(sun);
    renderer.setScaleDistance(100000); // Set scale for rendering distances
    renderer.setScaleBodies(1000); // Set scale for rendering celestial bodies

    earth.updatePosition(0);
    let positionCraft = earth.getPosition();
    positionCraft.y -= earth.radius + 10; // Start above the Earth

    // Set initial position of the view to the craft's position
    let positionView = {
        x: positionCraft.x,
        y: positionCraft.y
    };

    craft.setParentBody(earth); // Set Earth as the parent body for the craft
    craft.setPosition(positionCraft); // Set initial position of the craft

    let angle = 0;
    let strength = 0;
    let speed = 0;
    let scale = 0.33;
    slider.setStrength(scale); // Set initial strength for the slider

    renderer.keepLogged('Craft', craft); // Log craft position
    //renderer.keepLogged('Earth', earth.getPosition); // Log Earth position

    function draw() {
        ctx.resetTransform();
        ctx.clearRect(0, 0, cnv.width, cnv.height);
        
        time.updateTimeStamp();
        renderer.updateCelestialBodies();

        // TODO: Multi touch

        angle = joystick.getDirection();
        strength = joystick.getStrength();

        speed = speedMultiplier * renderer.getScale().distance;// Adjust speed based on distance scale and joystick strength

        // positionCraft.x = positionCraft.x + (speed * Math.cos(angle)) * strength;
        // positionCraft.y = positionCraft.y + (speed * Math.sin(angle)) * strength;
        // craft.setPosition(positionCraft); // Update craft position

        craft.fireThrusters(angle, strength);

        let movement = movementController.getMovement();
        // positionView.x -= movement.diffX * renderer.getScale().distance;
        // positionView.y -= movement.diffY * renderer.getScale().distance;
        positionView = {
            x: craft.getPosition().x,
            y: craft.getPosition().y
        };


        scale = slider.getStrength();
        scale /= (movement.scale * 0.1 + 0.9); // Adjust scale based on touch movement
        let effectiveScale = Math.pow(scaleMax / scaleMin, scale) * scaleMin;

        // Constrain the effective scale to be within the defined limits
        // This ensures that the scale does not go below scaleMin or above scaleMax
        if (effectiveScale < scaleMin) {
            scale = 0.0000001;
            effectiveScale = scaleMin;
        }
        if (effectiveScale > scaleMax) {
            scale = 1;
            effectiveScale = scaleMax;
        }
        slider.setStrength(scale); // Update slider position

        renderer.setScaleDistance(effectiveScale); // Set scale for rendering distances
        renderer.setScaleBodies(effectiveScale); // Set scale for rendering celestial bodies
        renderer.scale = scale;
        renderer.setOffset(-positionView.x, -positionView.y); // Set offset for rendering celestial bodies

        renderer.drawCelestialBodies(); // Draw celestial bodies
        renderer.drawOrbits();
        renderer.drawCraftHistory(); // Draw the craft's history
        renderer.drawCraftOrbit(craft); // Draw the craft's orbit
        renderer.drawCraft(craft, false); // Draw the craft
        renderer.logAll(); // Log all objects
        //console.log(craft.getPosition(), earth.getPosition());
        
        //console.log("scale: ", scale, "effectiveScale: ", effectiveScale);

        // Draw UI elements
        joystick.draw(ctx);
        slider.draw(ctx);
        for (const button of buttons) {
            button.draw(ctx);
        }

        window.requestAnimationFrame(draw);
    }
    resize();
    draw();
}





