# Spaceflight Simulator

Spaceflight Simulator is an interactive web-based application that simulates a solar system and allows users to control a spacecraft. The project is built using JavaScript and HTML5 Canvas.

## Features

- Simulated solar system with celestial bodies (e.g., Sun, Earth, Moon, etc.).
- Interactive joystick and slider controls for spacecraft navigation and zooming.
- Real-time rendering of celestial bodies, orbits, and spacecraft trajectory.
- Debug mode for logging and diagnostics.
- Responsive design that adjusts to the browser window size.

## Installation

1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/your-username/spaceflight-simulator.git

2. Navigate to the project directory:

3. Ensure you have a modern web browser installed (e.g., Chrome, Firefox, Edge).

4. Open the index.html file in your browser to launch the application.

## Usage
1. Joystick Control: Use the on-screen joystick to control the direction of the spacecraft's thrusters.

2. Slider Control: Adjust the zoom level of the simulation using the slider on the left side of the screen.

3. Time Warp: Use the time warp buttons (<<, 0, >>) to slow down, reset, or speed up the simulation.

4. Debug Mode: Press the debug toggle button to enable or disable debug mode. Debug mode logs additional information to the console.

5. Resize: The application automatically adjusts to the size of your browser window. Resize the window to see the changes.

6. Collision Detection: If the spacecraft collides with a celestial body, a collision message will be displayed, and the simulation will pause.

## Project Structure
Spaceflight-Simulator/
├── css/
│   └── style.css                # Styles for the application
├── images/
│   └── rocket-312767.svg        # Spacecraft image
├── js/
│   ├── button.mjs               # Button component
│   ├── celestialBody.mjs        # Celestial body logic
│   ├── craft.mjs                # Spacecraft logic
│   ├── dataScreen.mjs           # Data screen component
│   ├── eventListeners.mjs       # Event listener setup
│   ├── joystick.mjs             # Joystick component
│   ├── movementController.mjs   # Movement controller logic
│   ├── renderer.mjs             # Rendering logic
│   ├── slider.mjs               # Slider component
│   ├── statisticsScreen.mjs     # Statistics screen component
│   ├── time.mjs                 # Time management
│   └── utils.mjs                # Utility functions
├── [index.html](http://_vscodecontentref_/1)                   # Main HTML file
├── [main.mjs](http://_vscodecontentref_/2)                     # Main JavaScript file
└── favicon.ico                  # Favicon for the application

## Development
To modify or extend the project:

1. Open the project in your favorite code editor (e.g., Visual Studio Code).
2. Edit the JavaScript modules in the js/ folder or the main.mjs file.
3. Reload the index.html file in your browser to see the changes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments
 - The spacecraft image is sourced from Pixabay.
 - Built using HTML5 Canvas and JavaScript