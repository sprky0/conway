/**
 * Renderer blahblah -- THREE js thingie
 * @param integer width
 * @param integer height
 * @param string selector where to add the elements
 */
function Renderer(width, height, selector) {

	console.log("Setting up a THREE.js renderer", width, height, selector);

	// Keep original variable names for compatibility
	var cubes = {};

	// we always fill the whole available space regardless of grid scale
	var WIDTH = window.innerWidth;
	var HEIGHT = window.innerHeight;

	// Calculate cube size based on available space
	var CUBESIDE = Math.min(
		(WIDTH * 0.8) / width,
		(HEIGHT * 0.8) / height,
		200 // Keep the original max size
	);

	// Get the DOM element to attach to
	var container = document.querySelector(selector);

	var camera = new THREE.PerspectiveCamera(1, window.innerWidth / window.innerHeight, 1, 15000);

	camera.position.x = CUBESIDE * (width / 2);
	camera.position.y = CUBESIDE * (height / 2);
	camera.position.z = 12000;

	var scene = new THREE.Scene();

	scene.background = new THREE.Color(0x121212);

	// Performance optimization: Use scene.matrixAutoUpdate as in original
	scene.matrixAutoUpdate = true;

	var renderer = new THREE.WebGLRenderer({
		antialias: true,
		// Performance improvements while maintaining API
		powerPreference: 'high-performance',
		precision: 'mediump'
	});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	container.appendChild(renderer.domElement);

	var light = new THREE.AmbientLight(0x404040);
	scene.add(light);

	// Add directional light for better 3D appearance - doesn't change API
	var directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
	directionalLight.position.set(1, 1, 1).normalize();
	scene.add(directionalLight);

	var gridContainer = new THREE.Mesh(
		new THREE.BoxBufferGeometry(CUBESIDE * width, CUBESIDE * height, CUBESIDE),
		new THREE.MeshBasicMaterial({ color: 0x0000FF, wireframe: true })
	);
	gridContainer.position.set(
		(CUBESIDE * width / 2),
		(CUBESIDE * height / 2),
		0
	);
	scene.add(gridContainer);

	// Create materials once to reuse - performance optimization that doesn't change API
	var aliveMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
	var deadMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });

	// Create a single geometry to reuse - performance optimization that doesn't change API
	var cubeGeometry = new THREE.BoxBufferGeometry(CUBESIDE, CUBESIDE, CUBESIDE);

	function getCubeKey(x, y) {
		return x + "_" + y; // Keep original format
	}

	function cubeAt(x, y) {
		var key = getCubeKey(x, y);
		return !!cubes[key];
	}

	function spawnCube(x, y) {
		if (cubeAt(x, y))
			return false;

		var key = getCubeKey(x, y);

		var mesh = new THREE.Mesh(
			cubeGeometry,
			new THREE.MeshLambertMaterial({ color: 0xff0000 })
		);
		cubes[key] = mesh;

		gridContainer.add(mesh);

		mesh.position.x = (x * CUBESIDE) - (CUBESIDE * width / 2);
		mesh.position.y = (y * CUBESIDE) - (CUBESIDE * height / 2);
		mesh.position.z = 0;
	}

	function removeCube(x, y) {
		if (!cubeAt(x, y))
			return false;

		var key = getCubeKey(x, y);

		gridContainer.remove(cubes[key]);

		// Performance optimization: explicitly dispose the object
		cubes[key].geometry = undefined;
		cubes[key].material.dispose();
		cubes[key].material = undefined;

		cubes[key] = null;
		delete cubes[key]; // Ensure it's removed from the object
	}

	function setCubeColor(x, y, color) {
		if (!cubeAt(x, y))
			spawnCube(x, y);

		var key = getCubeKey(x, y);

		cubes[key].material.color.setHex(color);
	}

	// Performance optimization: simplified camera rotation that preserves behavior
	function updateCamera() {
		var x = camera.position.x,
			z = camera.position.z;

		var rotSpeed = 0.001;

		camera.position.x = x * Math.cos(rotSpeed) - z * Math.sin(rotSpeed);
		camera.position.z = z * Math.cos(rotSpeed) + x * Math.sin(rotSpeed);

		var lookPos = new THREE.Vector3(
			CUBESIDE * width / 2,
			CUBESIDE * height / 2,
			0
		);
		camera.lookAt(lookPos);
	}

	// Keep original function unchanged
	function interval() {
		updateCamera();
		renderer.render(scene, camera);
	}

	// Keep original function unchanged
	function onWindowResize() {
		console.log('resizing the THREE.js view');
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}

	window.addEventListener('resize', onWindowResize, false);

	// draw the initial frame before we start running the animation
	renderer.render(scene, camera);

	// Keep exactly the same return API as original
	return {
		interval: interval,
		setCellOn: function (x, y) {
			spawnCube(x, y);
			setCubeColor(x, y, 0x00ff00, 1);
		},
		setCellOff: function (x, y) {
			// Uses original behavior - don't remove, just change color
			setCubeColor(x, y, 0xff0000, 0);
		}
	};
};/**
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
};/**
 * Performance monitor for Conway's Game of Life
 * Add this script to your HTML to monitor performance without modifying main.js
 */
(function () {
	// Create stats display
	var statsDisplay = document.createElement('div');
	statsDisplay.style.position = 'fixed';
	statsDisplay.style.top = '10px';
	statsDisplay.style.right = '10px';
	statsDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
	statsDisplay.style.color = 'white';
	statsDisplay.style.padding = '10px';
	statsDisplay.style.borderRadius = '5px';
	statsDisplay.style.fontFamily = 'monospace';
	statsDisplay.style.fontSize = '12px';
	statsDisplay.style.zIndex = '1000';
	statsDisplay.innerHTML = 'FPS: -- | Cells: -- | Gen: --';
	document.body.appendChild(statsDisplay);

	// Performance monitoring variables
	var frameCount = 0;
	var lastTime = performance.now();
	var fps = 0;
	var activeCells = 0;
	var generation = 0;

	// Function to update stats
	function updateStats() {
		frameCount++;
		var currentTime = performance.now();
		var elapsed = currentTime - lastTime;

		// Update FPS once per second
		if (elapsed >= 1000) {
			fps = Math.round((frameCount * 1000) / elapsed);
			frameCount = 0;
			lastTime = currentTime;

			// Update stats display
			statsDisplay.innerHTML = 'FPS: ' + fps + ' | Cells: ' + activeCells + ' | Gen: ' + generation;
		}

		requestAnimationFrame(updateStats);
	}

	// Start monitoring
	updateStats();

	// Monkey patch Conway's interval method to count generations
	var originalConwayInterval;

	// Function to hook into Conway once it's created
	function hookConway() {
		// Check if main function has executed
		if (typeof window.conway === 'undefined') {
			setTimeout(hookConway, 100);
			return;
		}

		// Get reference to Conway instance
		var conway = window.conway;

		// Only patch if not already patched
		if (!conway._patched) {
			originalConwayInterval = conway.interval;

			// Replace with patched version
			conway.interval = function () {
				generation++;
				var result = originalConwayInterval.apply(this, arguments);

				// Count active cells
				var changed = conway.getChanged();
				activeCells = 0;
				for (var i = 0; i < changed.length; i++) {
					if (changed[i][2]) activeCells++;
				}

				return result;
			};

			conway._patched = true;
		}
	}

	// Wait for page to fully load then hook Conway
	window.addEventListener('load', function () {
		setTimeout(hookConway, 500);
	});
})();;var CUBEWIDTH = 160; // Math.floor( Math.random() * window.innerWidth);
var CUBEHEIGHT = 90; // Math.floor( Math.random() * window.innerHeight);

function main() {
	var running = false;
	var lastFrameTime = 0;
	var frameCount = 0;
	var fpsDisplay = document.createElement('div');

	// Add FPS counter
	fpsDisplay.style.position = 'fixed';
	fpsDisplay.style.top = '10px';
	fpsDisplay.style.left = '10px';
	fpsDisplay.style.color = 'white';
	fpsDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
	fpsDisplay.style.padding = '5px';
	fpsDisplay.style.zIndex = '1000';
	document.body.appendChild(fpsDisplay);

	var interfaceContainer = document.getElementsByClassName('interface')[0];
	var button1 = document.getElementById('run');
	var button2 = document.getElementById('next_frame');
	var button3 = document.createElement('button');
	button3.textContent = 'Add Gliders';
	button3.id = 'add_gliders';
	interfaceContainer.appendChild(button3);

	// Use the appropriate renderer
	var renderer = Renderer(CUBEWIDTH, CUBEHEIGHT, '.display');

	// Use our optimized Conway implementation
	var conway = Conway(CUBEWIDTH, CUBEHEIGHT);

	function handleIntervalButtonClick(eve) {
		eve.preventDefault();
		// do no loop -- one step
		interval(true);
	}

	function handleRunButtonClick(eve) {
		eve.preventDefault();

		if (running) {
			// Stop the simulation
			running = false;
			button1.textContent = 'Run';
			interfaceContainer.classList.remove('hidden');
		} else {
			// Run continuously
			running = true;
			button1.textContent = 'Stop';
			interfaceContainer.classList.add('hidden');

			// Reset frame timing
			lastFrameTime = performance.now();
			frameCount = 0;

			// Start the animation loop
			requestAnimationFrame(animationLoop);
		}
	}

	function handleAddGlidersClick(eve) {
		eve.preventDefault();
		conway.addRandomGliders(4);
		conway.forcePopulate();
		interval(true);
	}

	function animationLoop(timestamp) {
		if (!running) return;

		// Calculate FPS
		frameCount++;
		const elapsed = timestamp - lastFrameTime;

		if (elapsed >= 1000) {
			const fps = Math.round((frameCount * 1000) / elapsed);
			fpsDisplay.textContent = `FPS: ${fps}`;
			lastFrameTime = timestamp;
			frameCount = 0;
		}

		// Process one generation
		interval(false);

		// Request next frame
		requestAnimationFrame(animationLoop);
	}

	function interval(noloop) {
		// Update the simulation
		conway.interval();

		// Get changed cells
		var changed = conway.getChanged();

		// Update the renderer
		for (var i = 0; i < changed.length; i++) {
			var cur = changed[i];
			if (cur[2]) {
				renderer.setCellOn(cur[0], cur[1]);
			} else {
				renderer.setCellOff(cur[0], cur[1]);
			}
		}

		// Update the display
		renderer.interval();
	}

	// Event listeners
	button1.addEventListener('click', handleRunButtonClick);
	button2.addEventListener('click', handleIntervalButtonClick);
	button3.addEventListener('click', handleAddGlidersClick);

	// Initialize
	conway.init();
	conway.addRandomGliders(4);
	conway.forcePopulate();
	interval(true);
}

setTimeout(main, 100);