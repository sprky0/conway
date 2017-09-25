(function(){

	/*
	Any live cell with fewer than two live neighbours dies, as if caused by underpopulation.
	Any live cell with two or three live neighbours lives on to the next generation.
	Any live cell with more than three live neighbours dies, as if by overpopulation.
	Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
	*/

	var state = {
		current : {},
		next : {}
	}

	var running = false;
	var drawing = false;

	var width = 300, height = 200;

	// width = window.innerWidth;
	// height = window.innerHeight;

	console.log(width, height);

	var interfaceContainer = document.getElementsByClassName('interface')[0];
	var button1 = document.getElementById('run');
	var button2 = document.getElementById('next_frame');

	// create canvas
	var parent = document.getElementsByTagName('body')[0];
	var canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	parent.appendChild(canvas);

	var context = canvas.getContext('2d');

	// context['imageSmoothingEnabled'] = false;       /* standard */
	// context['mozImageSmoothingEnabled'] = false;    /* Firefox */
	// context['oImageSmoothingEnabled'] = false;      /* Opera */
	// context['webkitImageSmoothingEnabled'] = false; /* Safari */
	// context['msImageSmoothingEnabled'] = false;     /* IE */

	// temporary pixel for drawing
	var singlePixel = context.createImageData(1,1);
	var singlePixelData = singlePixel.data;

	function toggle(x,y) {

		if (getPixel(x, y).state) {
			setPixelOff(x, y);
		} else {
			setPixelOn(x, y);
		}

	}

	function getPixel(x,y) {
		return state.current[x + "_" + y];
	}

	function getPixelNext(x, y) {
		return state.next[x + "_" + y];
	}

	function setPixelNext(x, y, newState) {
		state.next[x+"_"+y].state = newState;
	}

	function setPixelOff(x, y) {
		state.current[x + "_" + y].state = false;
		drawPixel(x, y, 255, 255, 255);
	}

	function setPixelOn(x, y) {
		state.current[x + "_" + y].state = true;
		drawPixel(x, y, 0, 0, 0);
	}

	function drawPixel(x,y,r,g,b) {

		singlePixelData[0] = r;
		singlePixelData[1] = g;
		singlePixelData[2] = b;
		singlePixelData[3] = 255;
		context.putImageData( singlePixel, x, y );

	}

	function random(low, high) {
		return Math.random() * high + low;
	}

	function getPixelNeighborCount(x, y) {

		var startX = x > 0 ? x - 1 : 0;
		var startY = y > 0 ? y - 1 : 0;
		var endX = x + 1 < width - 1 ? x + 1 : width - 1;
		var endY = y + 1 < height - 1 ? y + 1 : height - 1;

		var neighborCount = 0;
		var neighborsChecked = 0;

		for(var curX = startX; curX <= endX; curX++) {
			for(var curY = startY; curY <= endY; curY++) {

				neighborsChecked++;

				if (!(curX === x && curY === y) && getPixel(curX, curY).state == true) {
					neighborCount++;
				}
			}
		}
		//
		// if (neighborCount > 0)
		// 	console.log("I FOUND SOMEONE!" + neighborCount + " from " + neighborsChecked);

		return neighborCount;

	}

	function handleCanvasClick(eve) {
		eve.preventDefault();
		var x = (eve.clientX / eve.target.offsetWidth) * width;
		var y = (eve.clientY / eve.target.offsetHeight) * height;
		toggle( Math.floor(x), Math.floor(y) );
	}

	function handleCanvasMousedown(eve) {
		drawing = true;
		var x = (eve.clientX / eve.target.offsetWidth) * width;
		var y = (eve.clientY / eve.target.offsetHeight) * height;
		toggle( Math.floor(x), Math.floor(y) );
	}

	function handleCanvasMouseup(eve) {
		drawing = false;
		var x = (eve.clientX / eve.target.offsetWidth) * width;
		var y = (eve.clientY / eve.target.offsetHeight) * height;
		toggle( Math.floor(x), Math.floor(y) );
	}

	function handleCanvasMousemove(eve) {

		var x = (eve.clientX / eve.target.offsetWidth) * width;
		var y = (eve.clientY / eve.target.offsetHeight) * height;

		if (drawing)
			setPixelOn( Math.floor(x), Math.floor(y) );

	}

	function handleIntervalButtonClick(eve) {

		eve.preventDefault();
		// do no loop
		interval(true);

	}

	function handleRunButtonClick(eve) {

		eve.preventDefault();
		run();

	}

	function init() {

		for(var x = 0; x < width; x++) {
			for(var y = 0; y < height; y++) {
				state.current[x+"_"+y] = {state:false};
				state.next[x+"_"+y] = {state:false};
			}
		}

	}

	function run() {

		interfaceContainer.classList.add('hidden');

		// no double trouble
		if(running)
			return;

		running = true;
		interval(false);
	}

	function interval(noloop) {

		var loopCount = 0;
		var startLoopMS = new Date().getTime();

		// loop 1 - determine the next state based on our current state
		for(var x = 0; x < width; x++) {
			for(var y = 0; y < height; y++) {

				var neighborCount = getPixelNeighborCount(x, y);

				// Any live cell with fewer than two live neighbours dies, as if caused by underpopulation.
				if (getPixel(x,y).state == true && neighborCount < 2) {
					// console.log(x + "," + y + ": fewer than two -- underpopulation die")
					setPixelNext(x, y, false);
				}

				// Any live cell with two or three live neighbours lives on to the next generation.
				else if (getPixel(x,y).state == true && neighborCount > 2 && neighborCount <= 3) {
					// console.log(x + "," + y + ": two or three -- live ok")
					setPixelNext(x, y, true);
				}

				// Any live cell with more than three live neighbours dies, as if by overpopulation.
				else if (getPixel(x,y).state == true && neighborCount > 3) {
					// console.log(x + "," + y + ": live and three -- overpopulation die")
					setPixelNext(x, y, false);
				}

				//Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
				else if (getPixel(x,y).state == false && neighborCount === 3) {
					// console.log(x + "," + y + ": dead and three -- reproduction add")
					setPixelNext(x, y, true);
				}

				loopCount++;

			}
		}

		console.log("LOOP1 (test) - " + loopCount + " too " + (new Date().getTime() - startLoopMS) + "ms");

		var loopCount = 0;
		var startLoopsMS = new Date().getTime();

		// loop 2 - draw the changes
		// it might be more performant if we just determined the difference
		// above and only looped through the known changed cells.  might do this later
		for(var x = 0; x < width; x++) {
			for(var y = 0; y < height; y++) {

				var curState = getPixel(x, y).state;
				var nextState = getPixelNext(x, y).state;

				// migrate next state to current state + draw

				if (curState != nextState && nextState == true) {
					setPixelOn(x, y);
				}

				else if (curState != nextState && nextState == false) {
					setPixelOff(x, y);
				}

				loopCount++;

			}
		}

		console.log("LOOP2 (draw) - " + loopCount + " too " + (new Date().getTime() - startLoopMS) + "ms");

		if (!noloop && running) {
			// intervalWaiting = true; // could defend against doubles here
			window.requestAnimationFrame(interval);
		}

	}

	// interface and interaction
	// canvas.addEventListener('click', handleCanvasClick)
	canvas.addEventListener('mousedown', handleCanvasMousedown)
	canvas.addEventListener('mouseup', handleCanvasMouseup)
	canvas.addEventListener('mousemove', handleCanvasMousemove)
	button1.addEventListener('click', handleRunButtonClick);
	button2.addEventListener('click', handleIntervalButtonClick);

	init();

})();