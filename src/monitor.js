/**
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
})();