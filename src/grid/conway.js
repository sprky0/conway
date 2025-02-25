/**
 * Generate a grid
 * Apply rules and so on
 * blah blah blah better docs
 * 
 * Performance-optimized version
 */
function Conway(gridwidth, gridheight) {

	console.log("GRID INIT W/ ", gridwidth, gridheight);

	var width = gridwidth;
	var height = gridheight;

	// refresher on the rules, courtesy Wikipedia https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life
	/*
	Any live cell with fewer than two live neighbours dies, as if caused by underpopulation.
	Any live cell with two or three live neighbours lives on to the next generation.
	Any live cell with more than three live neighbours dies, as if by overpopulation.
	Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
	*/

	// Performance optimization: use typed arrays for better memory efficiency
	// and a direct 2D array access pattern for better speed
	var state = {
		currentGrid : new Array(width),   // 2D array for current state - faster than object lookup
		nextGrid    : new Array(width),   // 2D array for next state
		activeCells : new Set(),          // Set of cells to check in format "x,y"
		changed     : []                  // Keep original format for compatibility
	};

	// Initialize the 2D arrays
	for (var x = 0; x < width; x++) {
		state.currentGrid[x] = new Array(height).fill(false);
		state.nextGrid[x] = new Array(height).fill(false);
	}

	var neighborMap = [
		// can add / remove relationship rules to this to change how it behaves
		[-1, -1], [0, -1], [1, -1],
		[-1, 0], [1, 0],
		[-1, 1], [0, 1], [1, 1]
	];

	// loop edges
	var loopXY = true;

	// COMPATIBILITY FUNCTIONS - maintain original API

	function toggle(x, y) {
		if (state.currentGrid[x][y]) {
			setCellOff(x, y);
		} else {
			setCellOn(x, y);
		}
	}

	function getCellKey(x, y) {
		return x + "," + y;
	}

	function getCell(x, y) {
		// Emulate original object structure for compatibility
		return { state: state.currentGrid[x][y] };
	}

	function getCellNext(x, y) {
		// Emulate original object structure for compatibility
		return { state: state.nextGrid[x][y] };
	}

	function setCellNext(x, y, newState) {
		state.nextGrid[x][y] = newState;

		// on cells need to be watched along with their neighbors
		if (newState) {
			addActiveCell(x, y);
		}
	}

	function setCellOff(x, y) {
		state.currentGrid[x][y] = false;
	}

	function setCellOn(x, y) {
		state.currentGrid[x][y] = true;
		// Add to active cells for next cycle
		addActiveCell(x, y);
	}

	// PERFORMANCE OPTIMIZED FUNCTIONS

	function addActiveCell(x, y) {
		// Add the cell itself to active cells
		state.activeCells.add(getCellKey(x, y));

		// Add all neighbors to active cells
		var neighbors = getCellNeighborCoordinates(x, y);
		for (var i = 0; i < neighbors.length; i++) {
			state.activeCells.add(getCellKey(neighbors[i][0], neighbors[i][1]));
		}
	}

	function random(low, high) {
		return Math.random() * high + low;
	}

	function randomInt(low, high) {
		return Math.floor(random(low, high));
	}

	/**
	 * Points which have changed state since in
	 * last interval and may need redraw
	 */
	function getChanged() {
		return state.changed.slice(0);
	}

	function getChangedFlat() {
		return state.changed.slice(0);
	}

	function getCellNeighborCoordinates(x, y) {
		var coords = [];

		for (var i = 0; i < neighborMap.length; i++) {
			var curX = x + neighborMap[i][0];
			var curY = y + neighborMap[i][1];

			if (loopXY) {
				curX = (width + curX) % width;
				curY = (height + curY) % height;
			}

			if (!(curX < 0 || curX >= width || curY < 0 || curY >= height)) {
				coords.push([curX, curY]);
			}
		}

		return coords;
	}

	function getCellNeighborCount(x, y) {
		var neighborCount = 0;

		for (var i = 0; i < neighborMap.length; i++) {
			var curX = x + neighborMap[i][0];
			var curY = y + neighborMap[i][1];

			if (loopXY) {
				curX = (width + curX) % width;
				curY = (height + curY) % height;
			}

			if (!(curX < 0 || curX >= width || curY < 0 || curY >= height)) {
				if (state.currentGrid[curX][curY]) {
					neighborCount++;
				}
			}
		}

		return neighborCount;
	}

	function init() {
		// Reset all cells to dead state
		for (var x = 0; x < width; x++) {
			for (var y = 0; y < height; y++) {
				state.currentGrid[x][y] = false;
				state.nextGrid[x][y] = false;
			}
		}

		// Clear active cells and changed list
		state.activeCells.clear();
		state.changed = [];
	}

	function addRandomNoise() {
		for (var x = 0; x < width; x++) {
			for (var y = 0; y < height; y++) {
				if (Math.random() > 0.5) {
					setCellNext(x, y, true);
				}
			}
		}
	}

	function addRandomGliders(gcount) {
		// preset shapes
		var gliders = [
			// don't forget 0,0 is top left corner of grid oops i forget always
			[[0, 0], [1, 0], [2, 0], [2, 1], [1, 2]], // right down
			[[0, 0], [1, 0], [2, 0], [2, -1], [1, -2]], // right up
			[[0, 0], [-1, 0], [-2, 0], [-2, 1], [-1, 2]], // left down
			[[0, 0], [-1, 0], [-2, 0], [-2, -1], [-1, -2]], // left up
			[[0, 0], [0, -1], [0, -2], [-1, -2], [-2, -1]], // top left
			[[0, 0], [0, -1], [0, -2], [1, -2], [2, -1]], // top right
			[[0, 0], [0, 1], [0, 2], [-1, 2], [-2, 1]], // bottom left
			[[0, 0], [0, 1], [0, 2], [1, 2], [2, 1]], // bottom right
		];

		// gliderland
		for (var i = 0; i < gcount; i++) {
			var curGlider = gliders[randomInt(0, gliders.length)];

			var glideX = randomInt(0, width);
			var glideY = randomInt(0, height);

			for (var g = 0; g < curGlider.length; g++) {
				var curX = (width + (glideX + curGlider[g][0])) % width;
				var curY = (height + (glideY + curGlider[g][1])) % height;

				// we have to set the NEXT state b/c we need to calculate difference for rendering
				setCellNext(curX, curY, true);
			}
		}
	}

	function interval() {
		// Reset changed array
		state.changed = [];

		// Create array from activeCells set for iteration
		var cellsToCheck = Array.from(state.activeCells).map(function (key) {
			var parts = key.split(',');
			return [parseInt(parts[0]), parseInt(parts[1])];
		});

		// Clear active cells for next generation
		state.activeCells.clear();

		// Process cells that need checking
		for (var i = 0; i < cellsToCheck.length; i++) {
			var x = cellsToCheck[i][0];
			var y = cellsToCheck[i][1];

			// Skip if out of bounds
			if (x < 0 || x >= width || y < 0 || y >= height) continue;

			var neighborCount = getCellNeighborCount(x, y);
			var isAlive = state.currentGrid[x][y];
			var newState = false;

			// Apply Conway's rules
			if (isAlive && (neighborCount < 2 || neighborCount > 3)) {
				// Dies from under/overpopulation
				newState = false;
			} else if (isAlive && (neighborCount === 2 || neighborCount === 3)) {
				// Survives
				newState = true;
			} else if (!isAlive && neighborCount === 3) {
				// Born from reproduction
				newState = true;
			}

			// Set next state
			state.nextGrid[x][y] = newState;

			// If state changed, add to changed list for rendering
			if (isAlive !== newState) {
				state.changed.push([x, y, newState]);
			}

			// If cell will be alive, add to active cells
			if (newState) {
				addActiveCell(x, y);
			}
		}

		// Update current grid from next grid for changed cells
		for (var j = 0; j < state.changed.length; j++) {
			var cx = state.changed[j][0];
			var cy = state.changed[j][1];
			var cstate = state.changed[j][2];

			state.currentGrid[cx][cy] = cstate;
		}
	}

	function forcePopulate() {
		state.changed = [];

		for (var x = 0; x < width; x++) {
			for (var y = 0; y < height; y++) {
				if (state.currentGrid[x][y] !== state.nextGrid[x][y]) {
					var newState = state.nextGrid[x][y];
					state.currentGrid[x][y] = newState;
					state.changed.push([x, y, newState]);

					if (newState) {
						addActiveCell(x, y);
					}
				}
			}
		}
	}

	// Return the same public API as the original
	return {
		interval: interval,
		getChanged: getChanged,
		getChangedFlat: getChangedFlat,

		init: init,

		addRandomGliders: addRandomGliders,
		addRandomNoise: addRandomNoise,

		forcePopulate: forcePopulate
		// etc
		// state setters, bah blah blah
		// getCell toggleCell setCellOn setCellOff etc etc
	};
}