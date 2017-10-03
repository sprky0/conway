function getCanvasRenderer(width, height, selector) {

	// create canvas
	var parent = document.getElementsByTagName('body')[0];
	var canvas = document.createElement('canvas');
	canvas.classList.add('old-canvas');
	canvas.width = width;
	canvas.height = height;
	parent.appendChild(canvas);

	var context = canvas.getContext('2d');

	// temporary pixel for drawing
	var singlePixel = context.createImageData(1,1);
	var singlePixelData = singlePixel.data;

	// old-canvas
	function drawPixel(x,y,r,g,b) {

		singlePixelData[0] = r;
		singlePixelData[1] = g;
		singlePixelData[2] = b;
		singlePixelData[3] = 255;
		context.putImageData( singlePixel, x, y );

	}

	return {

		// setPixel
		drawCell : drawPixel

	};

}

// Set the scene size.
function getThreeRenderer(width, height, selector) {

	var WIDTH = width;
	var HEIGHT = height;

	// Set some camera attributes.
	var VIEW_ANGLE = 45;
	var ASPECT = WIDTH / HEIGHT;
	var NEAR = 0.1;
	var FAR = 10000;

	// Get the DOM element to attach to
	var container = document.querySelector(selector);

	// Create a WebGL renderer, camera
	// and a scene
	var renderer = new THREE.WebGLRenderer();
	var camera = new THREE.PerspectiveCamera(
		VIEW_ANGLE,
		ASPECT,
		NEAR,
		FAR
	);

	var scene = new THREE.Scene();

	// Add the camera to the scene.
	scene.add(camera);

	// Start the renderer.
	renderer.setSize(WIDTH, HEIGHT);

	// Attach the renderer-supplied
	// DOM element.
	container.appendChild(renderer.domElement);

}

function runConway() {

	// requestAnimationFrame courtesy http://www.javascriptkit.com/javatutors/requestanimationframe.shtml
	// thanks!
	/*

	window.requestAnimationFrame = window.requestAnimationFrame
		|| window.mozRequestAnimationFrame
		|| window.webkitRequestAnimationFrame
		|| window.msRequestAnimationFrame
		|| function(f){return setTimeout(f, 1000/60)} // simulate calling code 60

	window.cancelAnimationFrame = window.cancelAnimationFrame
		|| window.mozCancelAnimationFrame
		|| function(requestID){clearTimeout(requestID)} //fall back

	var requestAnimationFrame = window.requestAnimationFrame;
	*/

	// refresher on the rules, courtesy Wikipedia https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life
	/*
	Any live cell with fewer than two live neighbours dies, as if caused by underpopulation.
	Any live cell with two or three live neighbours lives on to the next generation.
	Any live cell with more than three live neighbours dies, as if by overpopulation.
	Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
	*/

	var state = {
		current : {},
		next : {}
	};

	var neighborMap = [
		// can add / remove relationship rules to this to change how it behaves
		[-1,-1], [ 0,-1], [ 1,-1],
		[-1, 0],          [ 1, 0],
		[-1, 1], [ 0, 1], [ 1, 1]
	];

	// loop edges
	var loopXY = true;

	var running = false;
	var drawing = false;

	var width = 100, height = 80;

	width = parseInt( window.innerWidth / 32 );
	height = parseInt( window.innerHeight / 32 );

	// console.log(width, height);

	var interfaceContainer = document.getElementsByClassName('interface')[0];
	var button1 = document.getElementById('run');
	var button2 = document.getElementById('next_frame');

	var render = getCanvasRenderer(width, height, '.display');

	function toggle(x,y) {

		if (getCell(x, y).state) {
			setCellOff(x, y);
		} else {
			setCellOn(x, y);
		}

	}

	function getCell(x,y) {
		return state.current[x + "_" + y];
	}

	function getCellNext(x, y) {
		return state.next[x + "_" + y];
	}

	function setCellNext(x, y, newState) {
		state.next[x+"_"+y].state = newState;
	}

	function setCellOff(x, y) {
		state.current[x + "_" + y].state = false;
		render.drawCell(x, y, 255, 255, 255);
	}

	function setCellOn(x, y) {
		state.current[x + "_" + y].state = true;
		var r = 0, g = 0, b = 0;
		render.drawCell(x, y, r, g, b);
	}

	function random(low, high) {
		return Math.random() * high + low;
	}

	function randomInt(low, high) {
		return Math.floor(random(low, high));
	}

	function getCellNeighborCount(x, y) {

		// nighbormap is now global

		// var neighborTests = [];
		var neighborCount = 0;
		var neighborsChecked = 0;

		for(var i = 0; i < neighborMap.length; i++) {

			var curX = x + neighborMap[i][0];
			var curY = y + neighborMap[i][1];

			if (loopXY) {
				curX = (width + curX) % width;
				curY = (height + curY) % height;
			}

			if (!(curX < 0 || curX >= width || curY < 0 || curY >= height)) {

				neighborsChecked++;

				if (getCell(curX, curY).state == true) {
					neighborCount++;
				}

			}

		}

		// console.log(x ,y, neighborsChecked, neighborCount);

		return neighborCount;

	}

	// function handleCanvasClick(eve) {
	// 	eve.preventDefault();
	// 	var x = (eve.clientX / eve.target.offsetWidth) * width;
	// 	var y = (eve.clientY / eve.target.offsetHeight) * height;
	// 	toggle( Math.floor(x), Math.floor(y) );
	// }
	//
	// function handleCanvasMousedown(eve) {
	// 	drawing = true;
	// 	var x = (eve.clientX / eve.target.offsetWidth) * width;
	// 	var y = (eve.clientY / eve.target.offsetHeight) * height;
	// 	toggle( Math.floor(x), Math.floor(y) );
	// }
	//
	// function handleCanvasMouseup(eve) {
	// 	drawing = false;
	// 	var x = (eve.clientX / eve.target.offsetWidth) * width;
	// 	var y = (eve.clientY / eve.target.offsetHeight) * height;
	// 	toggle( Math.floor(x), Math.floor(y) );
	// }
	//
	// function handleCanvasMousemove(eve) {
	//
	// 	var x = (eve.clientX / eve.target.offsetWidth) * width;
	// 	var y = (eve.clientY / eve.target.offsetHeight) * height;
	//
	// 	if (drawing) {
	//
	// 		x = Math.floor(x);
	// 		y = Math.floor(y);
	// 		setCellOn(x, y);
	//
	// 		for(var i = 0; i < neighborMap.length; i++) {
	//
	// 			var curX = x + neighborMap[i][0];
	// 			var curY = y + neighborMap[i][1];
	//
	// 			if (loopXY) {
	// 				curX = (width + curX) % width;
	// 				curY = (height + curY) % height;
	// 			}
	//
	// 			setCellOn( curX, curY );
	//
	// 		}
	// 	}
	//
	// }
	
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

		var gliders = [

			// don't forget 0,0 is top left corner of grid oops i forget always

			[[ 0, 0],[ 1, 0],[ 2, 0],[ 2, 1],[ 1, 2]], // right down
			[[ 0, 0],[ 1, 0],[ 2, 0],[ 2,-1],[ 1,-2]], // right up

			[[ 0, 0],[-1, 0],[-2, 0],[-2, 1],[-1, 2]], // left down
			[[ 0, 0],[-1, 0],[-2, 0],[-2,-1],[-1,-2]], // left up

			[[ 0, 0],[ 0,-1],[ 0,-2],[-1,-2],[-2,-1]], // top left
			[[ 0, 0],[ 0,-1],[ 0,-2],[ 1,-2],[ 2,-1]], // top right

			[[ 0, 0],[ 0, 1],[ 0, 2],[-1, 2],[-2, 1]], // bottom left
			[[ 0, 0],[ 0, 1],[ 0, 2],[ 1, 2],[ 2, 1]], // bottom right

		];

		for(var x = 0; x < width; x++) {
			for(var y = 0; y < height; y++) {
				state.current[x+"_"+y] = {state:false};
				// state.next[x+"_"+y] = {state: Math.random() > .5 ? true : false};
				state.next[x+"_"+y] = {state: false};
			}
		}


		// gliderland
		for(var i = 0; i < 4; i++) {



			var curGlider = gliders[randomInt(0, gliders.length)];

			console.log(curGlider);

			var glideX = randomInt(0, width);
			var glideY = randomInt(0, height);

			for (var g = 0; g < curGlider.length; g++) {

				var curX = (width + (glideX + curGlider[g][0])) % width;
				var curY = (height + (glideY + curGlider[g][1])) % height;

				state.next[curX +"_"+ curY] = {state: true};

			}

		}

		forceDraw();

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

		var todo = [];

		var loopCount = 0;
		var startLoopMS = new Date().getTime();

		// loop 1 - determine the next state based on our current state
		for(var x = 0; x < width; x++) {
			for(var y = 0; y < height; y++) {

				var neighborCount = getCellNeighborCount(x, y);

				// Any live cell with fewer than two live neighbours dies, as if caused by underpopulation.
				if (getCell(x,y).state == true && neighborCount < 2) {
					// console.log(x + "," + y + ": fewer than two -- underpopulation die")
					setCellNext(x, y, false);
					todo.push([x,y]);
				}

				// Any live cell with two or three live neighbours lives on to the next generation.
				else if (getCell(x,y).state == true && neighborCount > 2 && neighborCount <= 3) {
					// console.log(x + "," + y + ": two or three -- live ok")
					setCellNext(x, y, true);
					todo.push([x,y]);
				}

				// Any live cell with more than three live neighbours dies, as if by overpopulation.
				else if (getCell(x,y).state == true && neighborCount > 3) {
					// console.log(x + "," + y + ": live and three -- overpopulation die")
					setCellNext(x, y, false);
					todo.push([x,y]);
				}

				//Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
				else if (getCell(x,y).state == false && neighborCount === 3) {
					// console.log(x + "," + y + ": dead and three -- reproduction add")
					setCellNext(x, y, true);
					todo.push([x,y]);
				}

				loopCount++;

			}
		}

		// console.log("LOOP1 (test) - " + loopCount + " too " + (new Date().getTime() - startLoopMS) + "ms");

		loopCount = 0;
		var startLoopsMS = new Date().getTime();

		// loop 2 - draw the changes
		// it might be more performant if we just determined the difference
		// above and only looped through the known changed cells.  might do this later
		for(var i = 0; i < todo.length; i++) {

			var changeX = todo[i][0];
			var changeY = todo[i][1];

			var curState = getCell(changeX, changeY).state;
			var nextState = getCellNext(changeX, changeY).state;

			// migrate next state to current state + draw

			if (curState != nextState && nextState == true) {
				setCellOn(changeX, changeY);
			}

			else if (curState != nextState && nextState == false) {
				setCellOff(changeX, changeY);
			}

			loopCount++;

		}

		// console.log("LOOP2 (draw) - " + loopCount + " too " + (new Date().getTime() - startLoopMS) + "ms");

		if (!noloop && running) {
			// intervalWaiting = true; // could defend against doubles here
			// not working for some reason, deal with this later:
			setTimeout(interval, 1000 / 60); // optimistic
			// var res = window.requestAnimationFrame(interval);
			// var res = requestAnimationFrame(interval);
			// console.log( requestAnimationFrame, res );
		}

	}

	function forceDraw() {

		for(var x = 0; x < width; x++) {
			for(var y = 0; y < height; y++) {

				var curState = getCell(x, y).state;
				var nextState = getCellNext(x, y).state;

				// migrate next state to current state + draw

				if (curState != nextState && nextState == true) {
					setCellOn(x, y);
				}

				else if (curState != nextState && nextState == false) {
					setCellOff(x, y);
				}

			}
		}

	}

	// interface and interaction
	// canvas.addEventListener('click', handleCanvasClick)
	/*
	canvas.addEventListener('mousedown', handleCanvasMousedown);
	canvas.addEventListener('mouseup', handleCanvasMouseup);
	canvas.addEventListener('mousemove', handleCanvasMousemove);
	*/
	button1.addEventListener('click', handleRunButtonClick);
	button2.addEventListener('click', handleIntervalButtonClick);

	init();

}

runConway();




// var renderer = getRenderer(window.innerWidth, window.innerHeight, '.display');
