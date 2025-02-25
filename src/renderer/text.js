/**
 * Renderer using monospace font blocks for Conway's Game of Life
 * @param integer width
 * @param integer height
 * @param string selector where to add the elements
 */
function Renderer(width, height, selector) {
	console.log("Setting up a Monospace Block renderer", width, height, selector);

	// Get the DOM element to attach to
	var container = document.querySelector(selector);

	// Create the grid container
	var gridElement = document.createElement('div');
	gridElement.className = 'monospace-grid';
	gridElement.style.fontFamily = 'monospace';
	gridElement.style.lineHeight = '1';
	gridElement.style.whiteSpace = 'pre';
	gridElement.style.fontSize = calculateOptimalFontSize(width, height) + 'px';
	gridElement.style.textAlign = 'center';
	gridElement.style.userSelect = 'none';
	gridElement.style.overflow = 'hidden';
	gridElement.style.backgroundColor = '#000';
	gridElement.style.color = '#fff';
	gridElement.style.padding = '20px';
	gridElement.style.borderRadius = '8px';
	gridElement.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.4)';
	gridElement.style.position = 'absolute';
	gridElement.style.top = '50%';
	gridElement.style.left = '50%';
	gridElement.style.transform = 'translate(-50%, -50%)';



	// Create rows and cells
	var cells = [];
	var cellElements = [];

	// Initialize the grid
	function initializeGrid() {
		gridElement.innerHTML = '';
		cells = [];
		cellElements = [];

		for (var y = 0; y < height; y++) {
			var rowElement = document.createElement('div');
			var rowCells = [];
			var rowCellElements = [];

			for (var x = 0; x < width; x++) {
				var cellElement = document.createElement('span');
				cellElement.textContent = '·'; // Default character for dead cells
				cellElement.dataset.x = x;
				cellElement.dataset.y = y;
				cellElement.style.display = 'inline-block';
				cellElement.style.width = '1ch';
				cellElement.style.height = '1em';
				cellElement.style.transition = 'color 0.1s ease';

				rowElement.appendChild(cellElement);
				rowCells.push(false); // All cells start dead
				rowCellElements.push(cellElement);
			}

			gridElement.appendChild(rowElement);
			cells.push(rowCells);
			cellElements.push(rowCellElements);
		}

		container.appendChild(gridElement);
	}

	// Calculate the optimal font size based on window size and grid dimensions
	function calculateOptimalFontSize(gridWidth, gridHeight) {
		var windowWidth = window.innerWidth * 0.8; // Use 80% of window width
		var windowHeight = window.innerHeight * 0.8; // Use 80% of window height

		var widthBasedSize = Math.floor(windowWidth / gridWidth);
		var heightBasedSize = Math.floor(windowHeight / gridHeight);

		// Choose the smaller of the two to ensure it fits
		return Math.min(widthBasedSize, heightBasedSize, 24); // Max size of 24px
	}

	// Different character sets for cells
	var characterSets = [
		{ alive: '█', dead: '·' }, // Block and dot
		{ alive: '■', dead: '□' }, // Filled and empty squares
		{ alive: '●', dead: '○' }, // Filled and empty circles
		{ alive: '#', dead: ' ' }, // Hash and space
		{ alive: '@', dead: ' ' }  // At symbol and space
	];

	// Select a character set
	var activeCharSet = characterSets[0];

	// Function to cycle through character sets
	function cycleCharacterSet() {
		var currentIndex = characterSets.indexOf(activeCharSet);
		var nextIndex = (currentIndex + 1) % characterSets.length;
		activeCharSet = characterSets[nextIndex];

		// Update all cells with new characters
		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				var isAlive = cells[y][x];
				cellElements[y][x].textContent = isAlive ? activeCharSet.alive : activeCharSet.dead;
			}
		}
	}

	// Add a button to cycle through character sets
	var cycleButton = document.createElement('button');
	cycleButton.textContent = 'Change Style';
	cycleButton.style.position = 'absolute';
	cycleButton.style.bottom = '10px';
	cycleButton.style.right = '10px';
	cycleButton.style.zIndex = '1000';
	cycleButton.style.padding = '8px 12px';
	cycleButton.style.borderRadius = '4px';
	cycleButton.style.border = 'none';
	cycleButton.style.backgroundColor = '#333';
	cycleButton.style.color = 'white';
	cycleButton.style.cursor = 'pointer';
	cycleButton.addEventListener('click', cycleCharacterSet);
	document.body.appendChild(cycleButton);

	// Color themes
	var colorThemes = [
		{ background: '#000000', alive: '#FFFFFF', dead: '#333333' }, // Classic
		{ background: '#0a0a2a', alive: '#00ff00', dead: '#003300' }, // Matrix
		{ background: '#2a0a0a', alive: '#ff0000', dead: '#330000' }, // Red
		{ background: '#0a2a0a', alive: '#00ffff', dead: '#003333' }, // Cyan
		{ background: '#ffffff', alive: '#000000', dead: '#cccccc' }  // Inverted
	];

	var activeColorTheme = colorThemes[0];

	// Function to cycle through color themes
	function cycleColorTheme() {
		var currentIndex = colorThemes.indexOf(activeColorTheme);
		var nextIndex = (currentIndex + 1) % colorThemes.length;
		activeColorTheme = colorThemes[nextIndex];

		// Update grid colors
		updateGridColors();
	}

	// Update grid with current color theme
	function updateGridColors() {
		gridElement.style.backgroundColor = activeColorTheme.background;

		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				var isAlive = cells[y][x];
				cellElements[y][x].style.color = isAlive ? activeColorTheme.alive : activeColorTheme.dead;
			}
		}
	}

	// Add a button to cycle through color themes
	var themeButton = document.createElement('button');
	themeButton.textContent = 'Change Colors';
	themeButton.style.position = 'absolute';
	themeButton.style.bottom = '10px';
	themeButton.style.right = '120px';
	themeButton.style.zIndex = '1000';
	themeButton.style.padding = '8px 12px';
	themeButton.style.borderRadius = '4px';
	themeButton.style.border = 'none';
	themeButton.style.backgroundColor = '#333';
	themeButton.style.color = 'white';
	themeButton.style.cursor = 'pointer';
	themeButton.addEventListener('click', cycleColorTheme);
	document.body.appendChild(themeButton);

	// Handle window resize
	function onWindowResize() {
		gridElement.style.fontSize = calculateOptimalFontSize(width, height) + 'px';
	}

	window.addEventListener('resize', onWindowResize);

	// Initialize the grid
	initializeGrid();

	// Interface methods
	function setCellOn(x, y) {
		if (x >= 0 && x < width && y >= 0 && y < height) {
			cells[y][x] = true;
			cellElements[y][x].textContent = activeCharSet.alive;
			cellElements[y][x].style.color = activeColorTheme.alive;

			// Add a small animation effect
			cellElements[y][x].style.transform = 'scale(1.2)';
			setTimeout(() => {
				if (cellElements[y][x]) {
					cellElements[y][x].style.transform = 'scale(1)';
				}
			}, 100);
		}
	}

	function setCellOff(x, y) {
		if (x >= 0 && x < width && y >= 0 && y < height) {
			cells[y][x] = false;
			cellElements[y][x].textContent = activeCharSet.dead;
			cellElements[y][x].style.color = activeColorTheme.dead;
		}
	}

	// Nothing to do in interval for this renderer
	function interval() {
		return;
	}

	// Return the same API as other renderers
	return {
		interval: interval,
		setCellOn: setCellOn,
		setCellOff: setCellOff
	};
}