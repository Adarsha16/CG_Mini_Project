
# CPU Round Robin Scheduling Visualizer

An interactive educational tool built for a **Computer Graphics** mini-project. This application visualizes the Round Robin scheduling algorithm, transforming abstract Operating Systems concepts into a dynamic, real-time graphical simulation.

## Introduction
Understanding "Time Slicing" and "Context Switching" through static tables can be challenging. This project utilizes a "Conveyor Belt" visual metaphor to demonstrate how a CPU handles multiple processes. Color-coded blocks represent processes that migrate between a **Ready Queue**, a **CPU Core**, and a **Terminated Pool** based on a user-defined Time Quantum.

## Key Features
*   **Dynamic Motion Simulation:** Smooth, frame-by-frame animation of process transitions.
*   **Procedural Gantt Chart:** A real-time timeline that scales and updates as the simulation executes.
*   **Interactive Controls:** 
    *   **Time Quantum Slider:** Change the algorithm's time slice in real-time.
    *   **Logic Speed Slider:** Adjust the simulation clock frequency.
    
##  Computer Graphics Concepts Implemented
This project serves as a practical application of several fundamental CG principles:
*   **Linear Interpolation (LERP):** Used to calculate fluid movement paths for process blocks, avoiding "teleporting" and providing a realistic sense of motion.
*   **Coordinate Space Mapping:** Dynamically mapping abstract data (Time Units) into physical screen space (Pixel Widths) for the Gantt Chart.
*   **State-Driven Rendering:** A logic-heavy rendering loop where the visual properties (X/Y coordinates, colors, labels) are a direct reflection of the underlying process states.
*   **Procedural UI & Geometry:** Generating complex UI elements and chart primitives programmatically using the HTML5 Canvas API.

##  Tech Stack
*   **Language:** JavaScript (ES6+)
*   **Graphics Library:** [p5.js](https://p5js.org/)
*   **Environment:** Visual Studio Code / Web Browser

##  Project Structure
```bash
├── index.html   # Main entry point and canvas setup
├── sketch.js    # Core logic, rendering loop, and UI handling
└── README.md    # Project documentation
```

##  How to Run
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/cpu-scheduler-visualizer.git
    ```
2.  **Open the project:**
    *   Simply open `index.html` in any modern web browser.
    *   *Recommended:* Use the **Live Server** extension in VS Code for the best experience.
3.  **Interact:**
    *   Use the sliders to adjust parameters.
    *   Press the **Restart** button or the **'R'** key to re-run the simulation with new random data.
