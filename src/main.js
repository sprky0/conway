var CUBEWIDTH = 160; // Math.floor( Math.random() * window.innerWidth);
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