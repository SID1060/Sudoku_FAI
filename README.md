# Logic Grid Master (Constraint Propagation Engine)

This project showcases an interactive Logic Grid (Sudoku) solver powered by arc consistency and recursive backtracking algorithms. The goal is to dynamically compute valid domains for cells and assist users in solving puzzles efficiently. The user interface is designed with a modern "Cyber-Logic" aesthetic, allowing manual edits, puzzle generation, and automated solving protocols.

## Features

### Interactive Board:
- Clickable cells for easy selection and editing.
- Displays possible domain values (Entropy) for empty cells dynamically in the sidebar.

### Puzzle Generation:
- Predefined puzzles across four difficulty levels: Starter to Nightmare.
- Option for creating custom puzzles (Empty Grid).

### Algorithm Protocols:
- Arc Consistency (AC-3): Continuously refines domains based on rows, columns, and 3x3 subgrid constraints.
- Backtracking: A pure recursive brute-force approach.
- Hybrid Solver: Combines logic first (to reduce search space) followed by backtracking for complex nodes.

### Step-by-Step Solving:
- Logs domain reductions and value assignments at each step in the "System Log" console.
- Allows users to follow the solving process in real time.

### Dynamic Feedback:
- "Candidate Panel" shows valid moves for any selected node.
- Visual cues for locked, active, and conflicting cells.

## Project Overview

**HTML:** Lays out the board, sidebar logs, and control toolbar.  
**CSS:** Styles the grid with a dark theme, neon accents, and responsive layout.  
**JavaScript:** Implements the solving logic (AC-3, Backtracking), manages the grid state, and handles interactions.

## How It Works

### Board Initialization:
The board starts as a 9x9 grid where every empty cell has a domain of [1–9].

### Arc Consistency:
The `runArcConsistency()` function refines cell domains by eliminating values conflicting with other cells in the same row, column, or subgrid. If a domain reduces to a single value, it is assigned.

### User Interaction:
Users can edit the board manually, view "Entropy" (candidates) on click, and execute different solver protocols.

## Usage

### Open the Project:
Choose a Puzzle: Select a difficulty level from the "DIFFICULTY DATABASE" dropdown or start with an Empty Grid.

### Solve the Puzzle:
Select a protocol (e.g., Hybrid or Arc Const.) and click "EXECUTE PROTOCOL" to watch the solution unfold.

## Key Functions

### Board Management:
