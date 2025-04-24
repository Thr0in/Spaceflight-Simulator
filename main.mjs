import { loadImage } from "./js/utils.mjs";
import { Joystick } from "./js/joystick.mjs";
import { Slider } from "./js/slider.mjs";
import { CelestialBody } from "./js/celestialBody.mjs";
import { Renderer } from "./js/renderer.mjs";
import { Craft } from "./js/craft.mjs";
import { Button } from "./js/button.mjs";
import { Time } from "./js/time.mjs";
import { DataScreen } from "./js/dataScreen.mjs";
import { StatisticsScreen } from "./js/statisticsScreen.mjs";
import { setupEventListeners } from "./js/eventListeners.mjs";
import { MovementController } from "./js/movementController.mjs";

/**
 * Initializes the spaceflight simulator application.
 * Sets up the canvas, celestial bodies, UI elements, and event listeners.
 */
window.onload = () => {
    const cnv = document.getElementById("cnv");
    const ctx = cnv.getContext("2d");

    // Initialize core components
    const time = new Time();
    const renderer = new Renderer(cnv, time);
    const craftImage = loadImage("./images/rocket-312767.svg");
    renderer.setCraftImage(craftImage);

    // Create the solar system
    const sun = new CelestialBody("Sun", 1.989e30, 696340, "#ffcc00");
    sun.createChild("Mercury", 3.285e23, 2439.7, "#6d6b68", 57.91e6, 3.14);
    sun.createChild("Venus", 4.867e24, 6051.8, "#f3dbc5", 108.2e6, 1.57);
    const earth = sun.createChild("Earth", 5.972e24, 6371, "#6288a8", 149.6e6, 0);
    earth.createChild("Moon", 7.34767309e22, 1737.4, "#b0b0b0", 384400, 7);
    sun.createChild("Mars", 6.417e23, 3389.5, "#c36d5c", 227.9e6, 4.71);
    sun.createChild("Jupiter", 1.898e27, 69911, "#d6a76c", 778.5e6, 0.87);
    sun.createChild("Saturn", 5.683e26, 58232, "#dab778", 1433.5e6, 3.67);
    sun.createChild("Uranus", 8.681e25, 25362, "#95bbbe", 2872.5e6, 0.52);
    sun.createChild("Neptune", 1.024e26, 24622, "#7595bf", 4495.1e6, 2.83);

    renderer.addCelestialBody(sun);
    renderer.setScaleDistance(100000);
    renderer.setScaleBodies(1000);

    // Define rendering scale limits
    const scaleMax = 2.5 * 4495.1e6 / Math.min(cnv.width, cnv.height);
    const scaleMin = 9.5;

    let debug = false;
    const speedMultiplier = 10;

    // Initialize joystick
    const joystickRadius = 50;
    const joystick = new Joystick(0, 0, "#fff", joystickRadius);

    function updateJoystickUI() {
        const joystickX = Math.min(cnv.width * 0.9, cnv.width - joystickRadius * 2.5);
        const joystickY = Math.min(cnv.height * 0.9, cnv.height - joystickRadius * 2.5);
        joystick.setPosition(joystickX, joystickY);
    }

    // Initialize slider
    const sliderWidth = 20;
    const slider = new Slider(0, 0, "#fff", sliderWidth, 1);

    function updateSliderUI() {
        const sliderX = Math.max(cnv.width * 0.05, 1.5 * sliderWidth);
        const sliderY = Math.min(cnv.height * 0.95, cnv.height - 1.5 * sliderWidth);
        slider.setPosition(sliderX, sliderY);
        slider.setHeight(-cnv.height + 2 * sliderY);
    }

    // Initialize data and statistics screens
    const dataScreen = new DataScreen(10, 10, cnv, debug);
    const statisticsScreen = new StatisticsScreen();

    // Create time warp buttons
    const buttonWidth = 50;
    const buttons = [];
    time.setWarpFactor(8 * speedMultiplier);

    const buttonSlowDown = new Button(10, 10, buttonWidth, 35, "<<", "#fff", "#000");
    const buttonDisplay = new Button(10, 10, buttonWidth * 2, 35, "0", "#fff", "#000");
    const buttonFastForward = new Button(10, 10, buttonWidth, 35, ">>", "#fff", "#000");

    function updateButtonUI() {
        buttonSlowDown.setPosition(cnv.width / 2 - 2 * buttonWidth - 10, 10);
        buttonDisplay.setPosition(cnv.width / 2 - buttonWidth, 10);
        buttonFastForward.setPosition((cnv.width + 2 * buttonWidth) / 2 + 10, 10);
    }

    buttonDisplay.setText(time.getWarpFactor() / speedMultiplier);
    buttonDisplay.setCallback(() => {
        time.setWarpFactor(8 * speedMultiplier);
        buttonDisplay.setText(time.getWarpFactor() / speedMultiplier);
    });

    buttonSlowDown.setCallback(() => {
        time.setWarpFactor(Math.floor(time.getWarpFactor() / 2));
        buttonDisplay.setText(time.getWarpFactor() / speedMultiplier);
    });

    buttonFastForward.setCallback(() => {
        time.setWarpFactor(time.getWarpFactor() * 2);
        if (time.getWarpFactor() <= 0) time.setWarpFactor(1);
        buttonDisplay.setText(time.getWarpFactor() / speedMultiplier);
    });

    buttons.push(buttonSlowDown, buttonDisplay, buttonFastForward);

    // Initialize craft and movement controller
    const movementController = new MovementController();
    const craft = new Craft("Kerbal X", 1000, earth, 0, 0);

    craft.collisionCallback = () => {
        console.log("Collision detected!");
        renderer.onCollision();
        statisticsScreen.isVisible = true;
    };

    function toggleDebug() {
        debug = !debug;
        if (debug) {
            console.log("Debug mode enabled");
        } else {
            console.log("Debug mode disabled");
        }
        dataScreen.debug = debug;
    }

    // Event listeners for touch and mouse input
    setupEventListeners(cnv, joystick, slider, buttons, movementController, statisticsScreen, toggleDebug);

    /**
     * Handles resizing of the canvas and updates UI elements accordingly.
     */
    function resize() {
        cnv.width = window.innerWidth;
        cnv.height = window.innerHeight;
        updateSliderUI();
        updateJoystickUI();
        dataScreen.setPosition({ x: Math.min(cnv.width * 0.1, 150), y: Math.max(cnv.height * 0.06, 2 * sliderWidth) });
        updateButtonUI();
        statisticsScreen.setPosition((cnv.width - statisticsScreen.width) / 2, (cnv.height - statisticsScreen.height) / 2);
    }

    addEventListener("resize", resize);
    resize();

    // Initialize craft position and properties
    let positionCraft = { x: 0, y: -earth.radius - 0.001 };
    craft.setPosition(positionCraft);
    craft.maximumThrust = 5000 / (1.15 ** speedMultiplier - 0.15);
    craft.maximumImpactVelocity = 300 * (0.5 * Math.log(speedMultiplier) + 1);

    earth.updatePosition(0);
    let positionView = craft.getAbsolutePosition();

    let angle = 0;
    let strength = 0;
    let scale = 0.01;
    slider.setStrength(scale);

    renderer.keepLogged('Craft', craft);
    dataScreen.setCraft(craft);
    statisticsScreen.setCraft(craft);

    let craftPosition = craft.getAbsolutePosition();

    /**
     * Main rendering loop. Updates and draws all elements on the canvas.
     */
    function draw() {
        ctx.resetTransform();
        ctx.clearRect(0, 0, cnv.width, cnv.height);

        time.updateTimeStamp();
        renderer.updateCelestialBodies();

        angle = joystick.getDirection();
        strength = joystick.getStrength();
        craft.fireThrusters(angle, strength);

        let movement = movementController.getMovement();
        positionView.x -= movement.diffX * renderer.getScale().distance;
        positionView.y -= movement.diffY * renderer.getScale().distance;

        const craftNewPosition = craft.getAbsolutePosition();
        positionView.x += craftNewPosition.x - craftPosition.x;
        positionView.y += craftNewPosition.y - craftPosition.y;

        craftPosition.x = craftNewPosition.x;
        craftPosition.y = craftNewPosition.y;

        scale = slider.getStrength();
        scale = scale ** (1 + (movement.scale - 1) * Math.max(scale, 0.2));
        let effectiveScale = Math.pow(scaleMax / scaleMin, scale) * scaleMin;

        if (effectiveScale < scaleMin) {
            scale = 0.01;
            effectiveScale = scaleMin;
        }
        if (effectiveScale > scaleMax) {
            scale = 1;
            effectiveScale = scaleMax;
        }
        slider.setStrength(scale);

        renderer.setScaleDistance(effectiveScale);
        renderer.setScaleBodies(effectiveScale);
        renderer.scale = scale;
        renderer.setOffset(-positionView.x, -positionView.y);

        renderer.drawCelestialBodies();
        renderer.drawOrbits();
        renderer.drawCraftHistory();
        renderer.drawCraftOrbit(craft);
        renderer.drawCraft(craft);
        if (debug) renderer.logAll();

        joystick.draw(ctx);
        slider.draw(ctx);
        for (const button of buttons) {
            button.draw(ctx);
        }
        dataScreen.draw();
        statisticsScreen.draw(ctx);

        window.requestAnimationFrame(draw);
    }

    draw();
};

