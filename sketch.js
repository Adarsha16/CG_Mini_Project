
let processes = [];
let readyQueue = [];
let finishedProcesses = [];
let cpuProcess = null;

let systemTime = 0;
let timer = 0;
let isSimulationComplete = false;

// UI Elements
// UI Elements
let quantumSlider, speedSlider, btn, pauseBtn;
let titleElement, qLabel, sLabel;
let isPaused = false;
let offsetX = 0;
let offsetY = 0;

// Layout Constants
const CANVAS_W = 900;
const CANVAS_H = 600;
const CPU_POS = { x: 450, y: 320 };
const GANTT_Y = 510;

function setup() {
    createCanvas(windowWidth, windowHeight);

    // Initialize UI elements once
    titleElement = createP('<b>CPU Scheduling Parameters</b>');
    titleElement.style('font-family', 'Inter, sans-serif');
    titleElement.style('margin', '0');
    titleElement.style('color', '#2d3436');

    qLabel = createSpan('Time Quantum: ');
    qLabel.style('font-family', 'Inter, sans-serif');

    quantumSlider = createSlider(1, 6, 2, 1);

    sLabel = createSpan('Logic Speed: ');
    sLabel.style('font-family', 'Inter, sans-serif');

    speedSlider = createSlider(1, 60, 30, 5);

    btn = createButton('Restart');
    btn.mousePressed(resetSimulation);
    btn.style('padding', '8px 16px');
    btn.style('cursor', 'pointer');
    btn.style('background', '#e74c3c');
    btn.style('color', 'white');
    btn.style('border', 'none');
    btn.style('border-radius', '4px');
    btn.style('font-family', 'Inter, sans-serif');
    btn.style('font-weight', '600');

    pauseBtn = createButton('Pause');
    pauseBtn.mousePressed(togglePause);
    pauseBtn.style('padding', '8px 16px');
    pauseBtn.style('cursor', 'pointer');
    pauseBtn.style('background', '#3498db');
    pauseBtn.style('color', 'white');
    pauseBtn.style('border', 'none');
    pauseBtn.style('border-radius', '4px');
    pauseBtn.style('font-family', 'Inter, sans-serif');
    pauseBtn.style('font-weight', '600');

    // Calculate positions
    repositionUI();

    resetSimulation();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    repositionUI();
}

function repositionUI() {
    // Center the 900x600 content
    offsetX = (width - CANVAS_W) / 2;
    offsetY = (height - CANVAS_H) / 2;

    // Ensure we don't go off-screen top/left
    offsetX = max(0, offsetX);
    offsetY = max(0, offsetY);

    let topMargin = offsetY + 20;

    titleElement.position(offsetX + 20, topMargin);

    qLabel.position(offsetX + 20, topMargin + 35);
    quantumSlider.position(offsetX + 130, topMargin + 35);

    sLabel.position(offsetX + 320, topMargin + 35);
    speedSlider.position(offsetX + 415, topMargin + 35);

    pauseBtn.position(offsetX + 700, topMargin + 30);
    btn.position(offsetX + 800, topMargin + 30);
}


function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        pauseBtn.html('Resume');
        pauseBtn.style('background', '#27ae60');
    } else {
        pauseBtn.html('Pause');
        pauseBtn.style('background', '#3498db');
    }
}

function resetSimulation() {
    isPaused = false;
    if (pauseBtn) {
        pauseBtn.html('Pause');
        pauseBtn.style('background', '#3498db');
    }
    processes = [];
    readyQueue = [];
    finishedProcesses = [];
    cpuProcess = null;
    systemTime = 0;
    timer = 0;
    isSimulationComplete = false;

    const palette = ['#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F', '#EDC948'];

    for (let i = 0; i < 6; i++) {
        let p = {
            id: "P" + (i + 1),
            burst: floor(random(5, 12)),
            remaining: 0,
            color: palette[i],
            x: 50,
            y: -50,
            targetX: 50,
            targetY: 50,
            history: []
        };
        p.remaining = p.burst;
        processes.push(p);
        readyQueue.push(p);
    }
}

function draw() {

    background('#dfe6e9'); // Page background

    // Draw the "App" container
    noStroke();

    fill(255);
    rect(offsetX, offsetY, CANVAS_W, CANVAS_H, 12); // Rounded corners for container

    push();
    translate(offsetX, offsetY);

    drawStaticLabels();
    updateLogic();
    renderProcesses();
    drawGanttChart();
    drawStatusOverlay();
    pop();
}

function drawStaticLabels() {
    // Title
    noStroke();
    fill(44, 62, 80);
    textAlign(LEFT);
    textSize(24);
    textStyle(BOLD);
    text("CPU Scheduling: Round Robin Visualizer", 20, 110);

    // Background Guide Line (Conveyor belt)
    stroke(235);
    strokeWeight(3);
    line(50, CPU_POS.y, 850, CPU_POS.y);

    // CPU Socket Design
    noStroke();
    fill(0, 15);
    rect(CPU_POS.x - 45, CPU_POS.y - 45, 90, 90, 15); // Shadow
    fill(255);
    stroke(200);
    strokeWeight(2);
    rect(CPU_POS.x - 40, CPU_POS.y - 40, 80, 80, 10);

    fill(127, 140, 141);
    noStroke();
    textAlign(CENTER);
    textSize(12);
    textStyle(BOLD);
    text("CPU CORE", CPU_POS.x, CPU_POS.y + 60);

    textAlign(LEFT);
    text("READY QUEUE", 60, CPU_POS.y + 60);
    textAlign(RIGHT);
    text("TERMINATED POOL", 840, CPU_POS.y + 60);
}

function updateLogic() {
    // Halt if all processes are finished
    if (finishedProcesses.length === processes.length) {
        isSimulationComplete = true;
        return;
    }

    // Update logic at frequency controlled by speedSlider
    if (!isPaused && frameCount % speedSlider.value() === 0) {

        // Check if CPU is vacant
        if (cpuProcess === null && readyQueue.length > 0) {
            cpuProcess = readyQueue.shift();
            timer = 0;
        }

        if (cpuProcess) {
            cpuProcess.remaining--;
            timer++;
            systemTime++;
            cpuProcess.history.push(systemTime);

            if (cpuProcess.remaining <= 0) {
                finishedProcesses.push(cpuProcess);
                cpuProcess = null;
            }
            else if (timer >= quantumSlider.value()) {
                readyQueue.push(cpuProcess);
                cpuProcess = null;
            }
        } else {
            systemTime++;
        }
    }
}

function renderProcesses() {
    // Position targets for animation
    for (let i = 0; i < readyQueue.length; i++) {
        readyQueue[i].targetX = CPU_POS.x - 110 - (i * 70);
        readyQueue[i].targetY = CPU_POS.y - 25;
    }

    if (cpuProcess) {
        cpuProcess.targetX = CPU_POS.x - 25;
        cpuProcess.targetY = CPU_POS.y - 25;
    }

    for (let i = 0; i < finishedProcesses.length; i++) {
        finishedProcesses[i].targetX = 800 + (i * 5);
        finishedProcesses[i].targetY = 320;
    }

    // Render using LERP
    for (let p of processes) {
        p.x = lerp(p.x, p.targetX, 0.15);
        p.y = lerp(p.y, p.targetY, 0.15);

        push();
        translate(p.x, p.y);

        noStroke();
        fill(p.color);
        rect(0, 0, 50, 50, 12);

        // Label
        fill(255);
        noStroke();
        textAlign(CENTER, CENTER);
        textStyle(BOLD);
        textSize(16);
        text(p.id, 25, 18);
        textStyle(NORMAL);
        textSize(10);
        text("REM: " + p.remaining, 25, 36);
        pop();
    }
}

function drawGanttChart() {
    const startX = 50;
    const maxWidth = CANVAS_W - 100;
    const blockW = min(25, maxWidth / (systemTime + 1));

    fill(52, 73, 94);
    noStroke();
    textAlign(LEFT);
    textStyle(BOLD);
    textSize(13);
    text("GANTT CHART: PROCESS EXECUTION TIMELINE", startX, GANTT_Y - 15);

    for (let t = 1; t <= systemTime; t++) {
        for (let p of processes) {
            if (p.history.includes(t)) {
                fill(p.color);
                noStroke();
                rect(startX + (t - 1) * blockW, GANTT_Y, blockW, 35);

                stroke(255, 40);
                line(startX + t * blockW, GANTT_Y, startX + t * blockW, GANTT_Y + 35);
            }
        }
    }

    stroke(149, 165, 166);
    strokeWeight(2);
    line(startX, GANTT_Y + 35, startX + (systemTime * blockW), GANTT_Y + 35);

    fill(127, 140, 141);
    noStroke();
    textStyle(NORMAL);
    textSize(11);
    text("Time: 0", startX, GANTT_Y + 52);
    if (systemTime > 0) {
        textAlign(RIGHT);
        text("Time: " + systemTime, startX + (systemTime * blockW), GANTT_Y + 52);
    }
}

function drawStatusOverlay() {
    // Status Dashboard
    fill(255);
    noStroke();
    rect(width - 240, 100, 220, 90, 15);

    fill(44, 62, 80);
    textAlign(LEFT);
    textSize(14);
    textStyle(BOLD);
    text("Simulation Stats", width - 225, 125);

    textStyle(NORMAL);
    textSize(13);
    text(`Elapsed Time: ${systemTime}`, width - 225, 150);

    if (isSimulationComplete) {
        fill('#27ae60');
        textStyle(BOLD);
        text("STATUS: ALL FINISHED", width - 225, 175);
    } else if (isPaused) {
        fill('#f39c12');
        textStyle(BOLD);
        text("STATUS: PAUSED", width - 225, 175);
    } else {
        fill('#2980b9');
        textStyle(BOLD);
        text("STATUS: EXECUTING...", width - 225, 175);
    }
}

function keyPressed() {
    if (key === 'r' || key === 'R') resetSimulation();
}