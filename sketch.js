
let processes = [];
let readyQueue = [];
let finishedProcesses = [];
let cpuProcess = null;

let systemTime = 0;
let timer = 0;
let isSimulationComplete = false;

// UI Elements
let quantumSlider, speedSlider, btn;

// Layout Constants
const CANVAS_W = 900;
const CANVAS_H = 600;
const CPU_POS = { x: 450, y: 320 };
const GANTT_Y = 510;

function setup() {
    createCanvas(CANVAS_W, CANVAS_H);

    let topMargin = 20;

    let title = createP('<b>CPU Scheduling Parameters</b>');
    title.position(20, topMargin);
    title.style('font-family', 'sans-serif');
    title.style('margin', '0');

    let qLabel = createSpan('Time Quantum: ');
    qLabel.position(20, topMargin + 35);
    qLabel.style('font-family', 'sans-serif');

    quantumSlider = createSlider(1, 6, 2, 1);
    quantumSlider.position(130, topMargin + 35);

    let sLabel = createSpan('Logic Speed: ');
    sLabel.position(320, topMargin + 35);
    sLabel.style('font-family', 'sans-serif');

    speedSlider = createSlider(1, 60, 30, 5);
    speedSlider.position(415, topMargin + 35);

    btn = createButton('Restart Simulation');
    btn.position(720, topMargin + 30);
    btn.mousePressed(resetSimulation);
    btn.style('padding', '8px 16px');
    btn.style('cursor', 'pointer');
    btn.style('background', '#2c3e50');
    btn.style('color', 'white');
    btn.style('border', 'none');
    btn.style('border-radius', '4px');

    resetSimulation();
}

function resetSimulation() {
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
    background(252, 253, 255);

    drawStaticLabels();
    updateLogic();
    renderProcesses();
    drawGanttChart();
    drawStatusOverlay();
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
    if (frameCount % speedSlider.value() === 0) {

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
        finishedProcesses[i].targetX = 700 + (i * 15);
        finishedProcesses[i].targetY = 160 - (i * 5);
    }

    // Render using LERP
    for (let p of processes) {
        p.x = lerp(p.x, p.targetX, 0.15);
        p.y = lerp(p.y, p.targetY, 0.15);

        push();
        translate(p.x, p.y);

        // Card style shadow
        noStroke();
        fill(0, 30);
        rect(3, 3, 50, 50, 8);

        // Block
        fill(p.color);
        stroke(255);
        strokeWeight(2);
        rect(0, 0, 50, 50, 8);

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
    const maxWidth = width - 100;
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
    fill(245, 247, 250);
    noStroke();
    rect(width - 240, 100, 220, 75, 8);

    fill(44, 62, 80);
    textAlign(LEFT);
    textSize(14);
    textStyle(BOLD);
    text("Simulation Stats", width - 225, 125);

    textStyle(NORMAL);
    textSize(13);
    text(`Elapsed Time: ${systemTime}`, width - 225, 145);

    if (isSimulationComplete) {
        fill('#27ae60');
        textStyle(BOLD);
        text("STATUS: ALL FINISHED", width - 225, 165);
    } else {
        fill('#2980b9');
        textStyle(BOLD);
        text("STATUS: EXECUTING...", width - 225, 165);
    }
}

function keyPressed() {
    if (key === 'r' || key === 'R') resetSimulation();
}