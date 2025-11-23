// --- State Management ---
let gridState = [];
let candidateMap = [];
let lockedCells = [];
let activeNode = null;

// --- Database ---
const LEVEL_DATA = {
    starter: [
        [0, 0, 0, 2, 6, 0, 7, 0, 1],
        [6, 8, 0, 0, 7, 0, 0, 9, 0],
        [1, 9, 0, 0, 0, 4, 5, 0, 0],
        [8, 2, 0, 1, 0, 0, 0, 4, 0],
        [0, 0, 4, 6, 0, 2, 9, 0, 0],
        [0, 5, 0, 0, 0, 3, 0, 2, 8],
        [0, 0, 9, 3, 0, 0, 0, 7, 4],
        [0, 4, 0, 0, 5, 0, 0, 3, 6],
        [7, 0, 3, 0, 1, 8, 0, 0, 0]
    ],
    moderate: [
        [0, 2, 0, 6, 0, 8, 0, 0, 0],
        [5, 8, 0, 0, 0, 9, 7, 0, 0],
        [0, 0, 0, 0, 4, 0, 0, 0, 0],
        [3, 7, 0, 0, 0, 0, 5, 0, 0],
        [6, 0, 0, 0, 0, 0, 0, 0, 4],
        [0, 0, 8, 0, 0, 0, 0, 1, 3],
        [0, 0, 0, 0, 2, 0, 0, 0, 0],
        [0, 0, 9, 8, 0, 0, 0, 3, 6],
        [0, 0, 0, 3, 0, 6, 0, 9, 0]
    ],
    complex: [
        [0, 0, 0, 6, 0, 0, 4, 0, 0],
        [7, 0, 0, 0, 0, 3, 6, 0, 0],
        [0, 0, 0, 0, 9, 1, 0, 8, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 5, 0, 1, 8, 0, 0, 0, 3],
        [0, 0, 0, 3, 0, 6, 0, 4, 5],
        [0, 4, 0, 2, 0, 0, 0, 6, 0],
        [9, 0, 3, 0, 0, 0, 0, 0, 0],
        [0, 2, 0, 0, 0, 0, 1, 0, 0]
    ],
    nightmare: [
        [8, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 3, 6, 0, 0, 0, 0, 0],
        [0, 7, 0, 0, 9, 0, 2, 0, 0],
        [0, 5, 0, 0, 0, 7, 0, 0, 0],
        [0, 0, 0, 0, 4, 5, 7, 0, 0],
        [0, 0, 0, 1, 0, 0, 0, 3, 0],
        [0, 0, 1, 0, 0, 0, 0, 6, 8],
        [0, 0, 8, 5, 0, 0, 0, 1, 0],
        [0, 9, 0, 0, 0, 0, 4, 0, 0]
    ]
};

// --- UI Elements ---
const uiGrid = document.getElementById('gridContainer');
const uiLog = document.getElementById('actionLog');
const uiCandidates = document.getElementById('candidateDisplay');
const algoSelector = document.getElementById('algoSelector');

// --- Initialization ---
function init() {
    document.getElementById('btnLoad').addEventListener('click', loadSelectedLevel);
    document.getElementById('btnSolve').addEventListener('click', executeSolver);
    document.getElementById('btnClear').addEventListener('click', wipeCell);
    
    document.addEventListener('keydown', (e) => {
        if (!activeNode) return;
        if (e.key >= '1' && e.key <= '9') {
            handleExternalInput(parseInt(e.key));
        } else if (e.key === 'Backspace' || e.key === 'Delete') {
            wipeCell();
        }
    });

    resetInternalState();
    renderGridSystem();
    writeLog("System initialized. Waiting for input.", "info");
}

function resetInternalState() {
    gridState = Array(9).fill().map(() => Array(9).fill(0));
    candidateMap = Array(9).fill().map(() => Array(9).fill([1,2,3,4,5,6,7,8,9]));
    lockedCells = Array(9).fill().map(() => Array(9).fill(false));
    activeNode = null;
}

// --- Core Rendering ---
function renderGridSystem() {
    uiGrid.innerHTML = '';
    
    for (let b = 0; b < 9; b++) {
        const subgrid = document.createElement('div');
        subgrid.className = 'subgrid';
        const rowStart = Math.floor(b / 3) * 3;
        const colStart = (b % 3) * 3;

        for (let i = 0; i < 9; i++) {
            const r = rowStart + Math.floor(i / 3);
            const c = colStart + (i % 3);
            
            const node = document.createElement('div');
            node.className = 'node';
            if (lockedCells[r][c]) node.classList.add('locked');
            
            node.dataset.r = r;
            node.dataset.c = c;
            node.id = `cell-${r}-${c}`;
            
            const val = gridState[r][c];
            node.textContent = val === 0 ? '' : val;

            if (!lockedCells[r][c]) {
                node.addEventListener('click', () => highlightNode(node, r, c));
            }
            subgrid.appendChild(node);
        }
        uiGrid.appendChild(subgrid);
    }
}

function highlightNode(domNode, r, c) {
    if (activeNode && activeNode.element) {
        activeNode.element.classList.remove('active');
    }
    domNode.classList.add('active');
    activeNode = { r, c, element: domNode };
    updateCandidatePanel(r, c);
}

function updateCandidatePanel(r, c) {
    if (gridState[r][c] !== 0) {
        uiCandidates.textContent = `Node [${r},${c}] is set to ${gridState[r][c]}.`;
        uiCandidates.style.color = '#fff';
        return;
    }
    const opts = candidateMap[r][c];
    if(opts.length === 0) {
        uiCandidates.textContent = `CRITICAL: No candidates for [${r},${c}]`;
        uiCandidates.style.color = 'var(--error)';
    } else {
        uiCandidates.textContent = `Entropy [${r},${c}]: { ${opts.join(', ')} }`;
        uiCandidates.style.color = 'var(--accent)';
    }
}

function handleExternalInput(val) {
    if (!activeNode) return;
    const { r, c, element } = activeNode;
    if (lockedCells[r][c]) {
        writeLog("Access Denied: Node is locked.", "warn");
        return;
    }
    const potential = calculatePossibilities(r, c);
    gridState[r][c] = val;
    element.textContent = val;
    element.classList.remove('conflict');

    if (!potential.includes(val)) {
        element.classList.add('conflict');
        writeLog(`CONFLICT: Value ${val} invalid at [${r},${c}]`, "warn");
    } else {
        writeLog(`Input accepted: Node [${r},${c}] set to ${val}`);
    }
    recalculateDomains();
    updateCandidatePanel(r, c);
}

function wipeCell() {
    if (!activeNode) return;
    const { r, c, element } = activeNode;
    if (lockedCells[r][c]) {
        writeLog("Cannot wipe locked node.", "warn");
        return;
    }
    element.textContent = '';
    gridState[r][c] = 0;
    element.classList.remove('conflict');
    element.classList.remove('solved');
    recalculateDomains();
    updateCandidatePanel(r, c);
    writeLog(`Node [${r},${c}] cleared.`);
}

function loadSelectedLevel() {
    const key = document.getElementById('levelSelector').value;
    if (key === 'empty') {
        resetInternalState();
        renderGridSystem();
        writeLog("Grid reset to empty state.");
        return;
    }
    if (LEVEL_DATA[key]) {
        resetInternalState();
        const data = LEVEL_DATA[key];
        for(let r=0; r<9; r++){
            for(let c=0; c<9; c++){
                if(data[r][c] !== 0) {
                    gridState[r][c] = data[r][c];
                    lockedCells[r][c] = true;
                }
            }
        }
        recalculateDomains();
        renderGridSystem();
        writeLog(`Level loaded: ${key.toUpperCase()}`, "success");
    }
}

// --- Logic & Constraints ---

function recalculateDomains() {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (gridState[r][c] === 0) {
                candidateMap[r][c] = calculatePossibilities(r, c);
            } else {
                candidateMap[r][c] = [];
            }
        }
    }
}

function calculatePossibilities(r, c) {
    const taken = new Set();
    for (let k = 0; k < 9; k++) {
        if (gridState[r][k]) taken.add(gridState[r][k]);
        if (gridState[k][c]) taken.add(gridState[k][c]);
    }
    const startR = Math.floor(r / 3) * 3;
    const startC = Math.floor(c / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const val = gridState[startR + i][startC + j];
            if (val) taken.add(val);
        }
    }
    return [1,2,3,4,5,6,7,8,9].filter(n => !taken.has(n));
}

// --- SPECIFIC SOLVER IMPLEMENTATIONS ---

// 1. ARC CONSISTENCY (AC-3 Logic Loop)
async function runArcConsistency() {
    let unstable = true;
    let cycles = 0;
    const MAX_LOGIC_CYCLES = 50;

    while (unstable && cycles < MAX_LOGIC_CYCLES) {
        unstable = false;
        cycles++;
        let changes = 0;

        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (gridState[r][c] === 0) {
                    const potential = calculatePossibilities(r, c);
                    
                    // Naked Single logic
                    if (potential.length === 1) {
                        const val = potential[0];
                        gridState[r][c] = val;
                        const cell = document.getElementById(`cell-${r}-${c}`);
                        if(cell) {
                            cell.textContent = val;
                            cell.classList.add('solved');
                        }
                        unstable = true;
                        changes++;
                    }
                }
            }
        }

        if(changes > 0) {
            writeLog(`Cycle ${cycles}: Collapsed ${changes} nodes.`);
            await new Promise(r => setTimeout(r, 80)); // Visual delay
        }
    }
    
    recalculateDomains();
    
    if (verifyCompletion()) {
        writeLog("ARC CONSISTENCY COMPLETE.", "success");
        return true;
    } else {
        writeLog(`Entropy Stalled after ${cycles} cycles.`, "warn");
        return false;
    }
}

// 2. BACKTRACKING (Recursive Brute Force)
async function runBacktracking() {
    // Find empty cell
    let emptySpot = null;
    for(let r=0; r<9; r++) {
        for(let c=0; c<9; c++) {
            if(gridState[r][c] === 0) {
                emptySpot = {r, c};
                break;
            }
        }
        if(emptySpot) break;
    }

    // No empty spots? Solved.
    if (!emptySpot) return true;

    const {r, c} = emptySpot;
    const candidates = calculatePossibilities(r, c);

    for (let val of candidates) {
        gridState[r][c] = val;
        
        // Visualization
        const cell = document.getElementById(`cell-${r}-${c}`);
        if(cell) {
            cell.textContent = val;
            cell.classList.add('solved'); 
        }
        
        // Very short delay for visual speed
        await new Promise(resolve => setTimeout(resolve, 5));

        if (await runBacktracking()) return true;

        // Backtrack
        gridState[r][c] = 0;
        if(cell) {
            cell.textContent = '';
            cell.classList.remove('solved');
        }
    }
    return false;
}


// --- MAIN EXECUTOR ---

async function executeSolver() {
    uiLog.innerHTML = '';
    const mode = algoSelector.value;
    writeLog(`Initializing Protocol: ${mode.toUpperCase()}...`, "info");
    
    // Logic Routing
    if (mode === 'ac3') {
        await runArcConsistency();
    } 
    else if (mode === 'backtrack') {
        const result = await runBacktracking();
        if(result) writeLog("BACKTRACK COMPLETE.", "success");
        else writeLog("UNSOLVABLE.", "error");
    } 
    else if (mode === 'hybrid') {
        // Phase 1: AC
        writeLog("Phase 1: Logic Propagation", "sys");
        const fullySolved = await runArcConsistency();
        
        if (!fullySolved) {
            // Phase 2: Backtrack
            writeLog("Phase 2: Engaging Brute Force", "sys");
            await new Promise(r => setTimeout(r, 400)); // Pause
            const result = await runBacktracking();
            if(result) writeLog("HYBRID SOLUTION FOUND.", "success");
            else writeLog("CRITICAL FAILURE.", "error");
        }
    }
    
    recalculateDomains();
}

function verifyCompletion() {
    for(let r=0; r<9; r++) {
        for(let c=0; c<9; c++) {
            if(gridState[r][c] === 0) return false;
                }
            }
            return true;
        }

        function writeLog(msg, type="normal") {
            const line = document.createElement('div');
            line.className = `log-entry ${type}`;
            line.textContent = `> ${msg}`;
            uiLog.appendChild(line);
            uiLog.scrollTop = uiLog.scrollHeight;
        }

// Start
init();