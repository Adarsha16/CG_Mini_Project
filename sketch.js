/* 
   Professional Round Robin CPU Scheduling Visualizer
   - Clean UI (Flat Design)
   - Numeric Time Quantum Control
   - Smooth Animations
*/

let processes = [];
let readyQueue = [];
let finishedProcesses = [];
let cpuProcess = null;

let systemTime = 0;
let timer = 0;
let isSimulationComplete = false;

// Scheduling Parameters
let timeQuantum = 2; // Default value

// UI Elements
let btnQMinus, btnQPlus, speedSlider;
let btnRestart, btnPause;
let isPaused = false;

// Layout Variables
let offsetX = 0;
let offsetY = 0;

// Constants
const CANVAS_W = 900;
const CANVAS_H = 650;
const COLOR_BG = '#F0F2F5';
const COLOR_CARD = '#FFFFFF';
const COLOR_ACCENT = '#3B82F6'; // Blue
const COLOR_TEXT_MAIN = '#1E293B';
const COLOR_TEXT_SUB = '#64748B';

// Process Palette (Modern/Professional)
const PALETTE = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

function setup() {
    createCanvas(windowWidth, windowHeight);
    textFont('Inter, sans-serif');

    // --- Create UI Controls ---

    // Quantum Controls
    btnQMinus = createButton('-');
    styleButton(btnQMinus, false);
    btnQMinus.mousePressed(() => adjustQuantum(-1));

    btnQPlus = createButton('+');
    styleButton(btnQPlus, false);
    btnQPlus.mousePressed(() => adjustQuantum(1));

    // Simulation Speed
    speedSlider = createSlider(1, 60, 30, 5);
    speedSlider.style('width', '100px');
    speedSlider.style('cursor', 'pointer');

    // Playback Controls
    btnPause = createButton('Pause');
    styleButton(btnPause, true);
    btnPause.mousePressed(togglePause);

    btnRestart = createButton('Restart');
    styleButton(btnRestart, false);
    btnRestart.style('background-color', '#EF4444'); // Red for restart
    btnRestart.style('color', '#FFF');
    btnRestart.mousePressed(resetSimulation);

    // Initial positioning
    repositionUI();
    resetSimulation();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    repositionUI();
}

// Helper to style buttons via CSS
function styleButton(btn, isPrimary) {
    btn.style('border', 'none');
    btn.style('border-radius', '6px');
    btn.style('padding', '6px 12px');
    btn.style('font-family', 'Inter, sans-serif');
    btn.style('font-weight', '600');
    btn.style('cursor', 'pointer');
    btn.style('transition', 'all 0.2s');

    if (isPrimary) {
        btn.style('background-color', COLOR_ACCENT);
        btn.style('color', '#FFFFFF');
    } else {
        btn.style('background-color', '#E2E8F0');
        btn.style('color', COLOR_TEXT_MAIN);
    }
}

function repositionUI() {
    // Center the container
    offsetX = (width - CANVAS_W) / 2;
    offsetY = (height - CANVAS_H) / 2;

    offsetX = max(20, offsetX);
    offsetY = max(20, offsetY);

    // Control Header Position (Top Right of the card)
    let headerY = offsetY + 30;
    let startX = offsetX + 420;

    // Time Quantum Buttons
    btnQMinus.position(startX, headerY);
    btnQPlus.position(startX + 80, headerY); // Gap for the number text

    // Speed Slider
    speedSlider.position(startX + 150, headerY + 5);

    // Action Buttons
    btnPause.position(offsetX + CANVAS_W - 160, headerY);
    btnRestart.position(offsetX + CANVAS_W - 85, headerY);
}

function adjustQuantum(val) {
    timeQuantum += val;
    if (timeQuantum < 1) timeQuantum = 1;
    if (timeQuantum > 10) timeQuantum = 10;
}

function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        btnPause.html('Resume');
        btnPause.style('background-color', '#10B981'); // Green
    } else {
        btnPause.html('Pause');
        btnPause.style('background-color', COLOR_ACCENT); // Blue
    }
}

function resetSimulation() {
    isPaused = false;
    btnPause.html('Pause');
    btnPause.style('background-color', COLOR_ACCENT);

    processes = [];
    readyQueue = [];
    finishedProcesses = [];
    cpuProcess = null;
    systemTime = 0;
    timer = 0;
    isSimulationComplete = false;

    // Create Processes
    for (let i = 0; i < 5; i++) {
        let p = {
            id: "P" + (i + 1),
            burst: floor(random(4, 10)),
            remaining: 0,
            color: PALETTE[i % PALETTE.length],
            x: offsetX - 50,
            y: offsetY + 200,
            targetX: 0,
            targetY: 0,
            history: [] // Stores time units where this process was active
        };
        p.remaining = p.burst;
        processes.push(p);
        readyQueue.push(p);
    }
}

function draw() {
    background(COLOR_BG);

    // 1. Draw Main Card Container
    push();
    translate(offsetX, offsetY);

    // Main Card Background
    fill(COLOR_CARD);
    stroke('#E2E8F0'); // Subtle border instead of shadow
    strokeWeight(1);
    rect(0, 0, CANVAS_W, CANVAS_H, 20);

    // 2. Draw Header Area
    drawHeader();

    // 3. Draw Layout Zones
    drawZones();

    // 4. Update Logic
    updateLogic();

    // 5. Render Processes & Gantt
    renderProcesses();
    drawGanttChart();

    pop();
}

function drawHeader() {
    // Title
    fill(COLOR_TEXT_MAIN);
    textSize(22);
    textStyle(BOLD);
    noStroke();
    textAlign(LEFT, TOP);
    text("Round Robin Visualizer", 40, 35);

    // Quantum Value Display
    // Note: Buttons are positioned in DOM, we just draw the text between them
    fill(COLOR_TEXT_MAIN);
    textSize(16);
    textAlign(CENTER, TOP);
    textStyle(BOLD);
    text(timeQuantum, 420 + 55, 37); // Positioned between - and +

    // Labels
    fill(COLOR_TEXT_SUB);
    textSize(12);
    textStyle(NORMAL);
    textAlign(CENTER, TOP);
    text("Time Quantum", 420 + 55, 15);

    textAlign(LEFT, TOP);
    text("Sim Speed", 570, 15);
}

function drawZones() {
    let yPos = 120;
    let zoneH = 180;

    // Queue Zone
    drawZoneRect(40, yPos, 300, zoneH, "Ready Queue");

    // CPU Zone (Center)
    drawZoneRect(360, yPos, 180, zoneH, "CPU Core");

    // Finished Zone
    drawZoneRect(560, yPos, 300, zoneH, "Terminated");

    // Connector Lines (Belt)
    stroke('#E2E8F0');
    strokeWeight(4);
    line(340, yPos + zoneH / 2, 360, yPos + zoneH / 2);
    line(540, yPos + zoneH / 2, 560, yPos + zoneH / 2);

    // CPU Socket Graphic
    noStroke();
    fill('#F1F5F9');
    circle(450, yPos + zoneH / 2, 120);
    fill('#E2E8F0');
    circle(450, yPos + zoneH / 2, 90);
}

function drawZoneRect(x, y, w, h, label) {
    fill('#F8FAFC'); // Very light grey
    stroke('#E2E8F0');
    strokeWeight(1);
    rect(x, y, w, h, 12);

    noStroke();
    fill(COLOR_TEXT_SUB);
    textSize(12);
    textStyle(BOLD);
    textAlign(LEFT, TOP);
    text(label.toUpperCase(), x + 15, y + 15);
}

function updateLogic() {
    if (finishedProcesses.length === processes.length) {
        isSimulationComplete = true;
        return;
    }

    if (!isPaused && frameCount % speedSlider.value() === 0) {
        // Load CPU if empty
        if (cpuProcess === null && readyQueue.length > 0) {
            cpuProcess = readyQueue.shift();
            timer = 0;
        }

        if (cpuProcess) {
            cpuProcess.remaining--;
            timer++;
            systemTime++;
            cpuProcess.history.push(systemTime);

            // Check if finished
            if (cpuProcess.remaining <= 0) {
                finishedProcesses.push(cpuProcess);
                cpuProcess = null;
            }
            // Check Quantum
            else if (timer >= timeQuantum) {
                readyQueue.push(cpuProcess);
                cpuProcess = null;
            }
        } else {
            // Idle time
            systemTime++;
        }
    }
}

function renderProcesses() {
    let zoneY = 120;
    let zoneCenterY = zoneY + 90;

    // 1. Calculate Targets

    // Ready Queue Positions
    for (let i = 0; i < readyQueue.length; i++) {
        readyQueue[i].targetX = 60 + (i * 60);
        readyQueue[i].targetY = zoneCenterY - 25;
    }

    // CPU Position
    if (cpuProcess) {
        cpuProcess.targetX = 450 - 25;
        cpuProcess.targetY = zoneCenterY - 25;
    }

    // Finished Positions
    for (let i = 0; i < finishedProcesses.length; i++) {
        finishedProcesses[i].targetX = 580 + (i * 55);
        finishedProcesses[i].targetY = zoneCenterY - 25;
    }

    // 2. Draw Processes
    for (let p of processes) {
        // Smooth movement (Lerp)
        p.x = lerp(p.x, p.targetX, 0.1);
        p.y = lerp(p.y, p.targetY, 0.1);

        drawProcessBlock(p);
    }

    // Draw Timer radial indicator around CPU if active
    if (cpuProcess) {
        noFill();
        stroke(cpuProcess.color);
        strokeWeight(4);
        let angle = map(timer, 0, timeQuantum, -HALF_PI, TWO_PI - HALF_PI);
        arc(450, zoneCenterY, 70, 70, -HALF_PI, angle);
    }
}

function drawProcessBlock(p) {
    push();
    translate(p.x, p.y);

    // Block body
    fill(p.color);
    noStroke();
    rect(0, 0, 50, 50, 8);

    // Text
    fill('#FFFFFF');
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(14);
    text(p.id, 25, 18);

    textSize(10);
    textStyle(NORMAL);
    fill('rgba(255,255,255,0.9)');
    text(p.remaining + "s", 25, 36);

    pop();
}

function drawGanttChart() {
    let startY = 360;
    let chartH = 250;

    // Section Header
    fill(COLOR_TEXT_MAIN);
    textSize(16);
    textStyle(BOLD);
    textAlign(LEFT, TOP);
    text("Gantt Chart Timeline", 40, 320);

    // Stats
    textAlign(RIGHT, TOP);
    fill(COLOR_TEXT_SUB);
    textStyle(NORMAL);
    textSize(14);
    let statusText = isSimulationComplete ? "Finished" : (isPaused ? "Paused" : "Running");
    text(`Status: ${statusText}  |  Total Time: ${systemTime}`, CANVAS_W - 40, 320);

    // Chart Background
    fill('#F8FAFC');
    stroke('#E2E8F0');
    strokeWeight(1);
    rect(40, startY, CANVAS_W - 80, 80, 8);

    // Dynamic block width based on time
    let maxDisplayTime = max(20, systemTime + 5);
    let blockW = (CANVAS_W - 80) / maxDisplayTime;
    let chartX = 40;
    let chartY = startY + 20;

    // Draw Timeline Blocks
    for (let t = 1; t <= systemTime; t++) {
        for (let p of processes) {
            if (p.history.includes(t)) {
                fill(p.color);
                noStroke();
                // Draw rect with slight gap
                rect(chartX + (t - 1) * blockW, chartY, blockW - 0.5, 40, 2);
            }
        }
    }

    // Time Markers
    fill(COLOR_TEXT_SUB);
    noStroke();
    textSize(10);
    textAlign(CENTER);

    // Draw 0
    text("0", chartX, chartY + 55);

    // Draw current time
    text(systemTime, chartX + (systemTime * blockW), chartY + 55);

    // Draw Legend below chart
    let lx = 40;
    let ly = startY + 100;
    for (let p of processes) {
        fill(p.color);
        circle(lx, ly, 10);
        fill(COLOR_TEXT_MAIN);
        textAlign(LEFT, CENTER);
        text(p.id, lx + 10, ly);
        lx += 50;
    }
}