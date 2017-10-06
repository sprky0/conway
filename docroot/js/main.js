/**
 * Renderer blahblah -- mnormal canvas
 * @param integer width
 * @param integer height
 * @param string selector where to add the elements
 */
function Renderer(width, height, selector) {

	console.log("Setting up a basic CANVAS renderer", width, height, selector);

	// create canvas
	// var parent = document.getElementsByTagName('body')[0];
	var parent = document.querySelector(selector);
	var canvas = document.createElement('canvas');
	canvas.classList.add('old-canvas');
	canvas.width = width;
	canvas.height = height;
	parent.appendChild(canvas);

	var context = canvas.getContext('2d');

	// temporary pixel for drawing
	var singlePixel = context.createImageData(1,1);
	var singlePixelData = singlePixel.data;
	// 
	// function loadChanged(changed) {
	// 	for (var i = 0; i < changed.length; i++)
	//
	// }

	// old-canvas
	function drawPixel(x,y,r,g,b) {

		singlePixelData[0] = r;
		singlePixelData[1] = g;
		singlePixelData[2] = b;
		singlePixelData[3] = 255;
		context.putImageData( singlePixel, x, y );

	}

	/**
	 * Nothing to do here
	 */
	function interval() {
		return;
	}

	return {
		interval : interval,
		// setPixel
		setCellOn : function(x,y) {
			drawPixel(x,y,0,0,0);
		},
		setCellOff : function(x,y) {
			drawPixel(x,y,255,255,255);
		}
	};

}
;/**
 * Generate a grid
 * Apply rules and so on
 * blah blah blah better docs
 */
function Conway(gridwidth, gridheight) {

	console.log("GRID INIT W/ ", gridwidth, gridheight);

	var width = gridwidth;
	var height = gridheight;

	// do we need a local copy of w/h ?

	// refresher on the rules, courtesy Wikipedia https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life
	/*
	Any live cell with fewer than two live neighbours dies, as if caused by underpopulation.
	Any live cell with two or three live neighbours lives on to the next generation.
	Any live cell with more than three live neighbours dies, as if by overpopulation.
	Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
	*/

	var state = {
		current : {},
		next : {},
		check : {},
		changed : []
	};

	var neighborMap = [
		// can add / remove relationship rules to this to change how it behaves
		[-1,-1], [ 0,-1], [ 1,-1],
		[-1, 0],          [ 1, 0],
		[-1, 1], [ 0, 1], [ 1, 1]
	];

	// loop edges
	var loopXY = true;

	// array of points which were changed in the previous interval and need to be re-drawn
	// var changed = [];

	// points which need to be verified (@todo implement this instead of a full on x/y loop)
	// var check = [];

	function toggle(x,y) {

		if (getCell(x, y).state) {
			setCellOff(x, y);
		} else {
			setCellOn(x, y);
		}

	}

	function getCellKey(x,y) {
		return x + "_" + y;
	}

	function getCell(x,y) {
		var key = getCellKey(x,y);
		return state.current[key];
	}

	function getCellNext(x, y) {
		var key = getCellKey(x,y);
		return state.next[key];
	}

	function setCellNext(x, y, newState) {
		var key = getCellKey(x,y);
		state.next[key].state = newState;

		// on cells need to be watched along with their neighbors
		if (newState)
			addWatchCell(x, y);
	}

	function setCellOff(x, y) {
		var key = getCellKey(x,y);
		state.current[key].state = false;
		// renderer is abstracted now -- this just changed the "live" data
		// renderer.setCellOff(x, y);
		// console.log("OFF",x,y);
	}

	function setCellOn(x, y) {
		var key = getCellKey(x,y);
		state.current[key].state = true;
		// renderer is abstracted now -- this just changed the "live" data
		// renderer.setCellOn(x, y);
		// console.log("ON ",x,y);
	}

	function addWatchCell(x ,y) {
		// keep track of active cells and cells which need testing (live and live adjacent)
		// the object/key automatically removes duplicates without caring really
		var neighbors = getCellNeighborCoordinates(x, y);
		for(var i = 0; i < neighbors.length; i++) {
			state.check[getCellKey(neighbors[i][0],neighbors[i][1])] = [neighbors[i][0], neighbors[i][1]];
		}
		state.check[getCellKey(x,y)] = [x,y];
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
		// var changedValues;
		// for(var i = 0; i < changed.length; i++) {
		// changedValues.push( changed )
		// }
		// i want this to include the values also
		return state.changed;
	}

	function getChangedFlat() {
		var changed = getChanged();
		var changedArray = [];
		for(var i in getChanged)
			changedArray = changed[i];
		return changedArray;
	}

	function getCellNeighborCoordinates(x, y) {

		var coords = [];

		for(var i = 0; i < neighborMap.length; i++) {

			var curX = x + neighborMap[i][0];
			var curY = y + neighborMap[i][1];

			if (loopXY) {
				curX = (width + curX) % width;
				curY = (height + curY) % height;
			}

			if (!(curX < 0 || curX >= width || curY < 0 || curY >= height)) {
				coords.push([curX,curY]);
			}

		}

		// console.log( coords[0] );

		return coords;
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

		return neighborCount;

	}

	function init() {

		// make empty grid
		for(var x = 0; x < width; x++) {
			for(var y = 0; y < height; y++) {
				state.current[x+"_"+y] = {state:false};
				state.next[x+"_"+y] = {state: false};
			}
		}

		forcePopulate();
	}

	function addRandomGliders(gcount) {
		// preset shapes
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

		// gliderland
		for(var i = 0; i < gcount; i++) {

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

		forcePopulate();
	}

	function interval(noloop) {

		// clone local copy of check
		// var _check = check.slice(0);
		// reset check
		// check = [];

		// changed cells which require pushing to the 'current' grid
		var todo = [];

		var loopCount = 0;
		var startLoopMS = new Date().getTime();

		// this loop sucks.  it shoud realy just loop through pixels which are neighbors of, or are themselves active
		// that would reduce our footprint substantially

		var check = state.check; // get a reference to this puppy
		state.check = {}; // nuke old one, we will repopulate right now

		// loop 1 - determine the next state based on our current state
		for(var i in check) {

			var x = check[i][0];
			var y = check[i][1];

			var neighborCount = getCellNeighborCount(x, y);

			// Any live cell with fewer than two live neighbours dies, as if caused by underpopulation.
			if (getCell(x,y).state == true && neighborCount < 2) {
				// console.log(x + "," + y + ": fewer than two -- underpopulation die")
				setCellNext(x, y, false);
				todo.push([x,y,false]);
			}

			// Any live cell with two or three live neighbours lives on to the next generation.
			else if (getCell(x,y).state == true && neighborCount > 2 && neighborCount <= 3) {
				// console.log(x + "," + y + ": two or three -- live ok")
				setCellNext(x, y, true); // this needs to stay -- track in next round
				todo.push([x,y,true]); // don't need to refraw this one so this could be removed probably in most uses
			}

			// Any live cell with more than three live neighbours dies, as if by overpopulation.
			else if (getCell(x,y).state == true && neighborCount > 3) {
				// console.log(x + "," + y + ": live and three -- overpopulation die")
				setCellNext(x, y, false);
				todo.push([x,y,false]);
			}

			//Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
			else if (getCell(x,y).state == false && neighborCount === 3) {
				// console.log(x + "," + y + ": dead and three -- reproduction add")
				setCellNext(x, y, true);
				todo.push([x,y,true]);
			}

			loopCount++;

		}

		// console.log("LOOP1 (test) - " + loopCount + " too " + (new Date().getTime() - startLoopMS) + "ms");

		loopCount = 0;
		// var startLoopsMS = new Date().getTime();

		// this loop can 90% sure be rolled up into the above as it initially was for redraw
		for(var t = 0; t < todo.length; t++) {

			var changeX = todo[t][0];
			var changeY = todo[t][1];

			var curState = getCell(changeX, changeY).state;
			var nextState = getCellNext(changeX, changeY).state;

			// migrate next state to current state + draw

			// push these to changed
			// also push neighbors to things to look @ for next loop

			if (curState != nextState && nextState == true) {
				setCellOn(changeX, changeY);
			}

			else if (curState != nextState && nextState == false) {
				setCellOff(changeX, changeY);
			}

			loopCount++;

		}

		state.changed = todo;

	}

	function forcePopulate() {

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

	init();

	addRandomGliders( 10 );

	return {
		interval : interval,
		getChanged : getChanged
		// etc
		// state setters, bah blah blah
		// getCell toggleCell setCellOn setCellOff etc etc
	};

}
;var CUBEWIDTH = 100;
var CUBEHEIGHT = 100;

// function ensureAnimationFrame() {
//
// 	// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// 	// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
// 	// requestAnimationFrame polyfill by Erik Möller
// 	// fixes from Paul Irish and Tino Zijdel
//
// 	var lastTime = 0;
// 	var vendors = ['ms', 'moz', 'webkit', 'o'];
// 	for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
// 		window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
// 		window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
// 	}
// 	if (!window.requestAnimationFrame) {
// 		window.requestAnimationFrame = function(callback, element) {
// 			var currTime = new Date().getTime();
// 			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
// 			var id = window.setTimeout(function() { callback(currTime + timeToCall); },timeToCall);
// 			lastTime = currTime + timeToCall;
// 			return id;
// 		};
// 	}
// 	if (!window.cancelAnimationFrame) {
// 		window.cancelAnimationFrame = function(id) {
// 			clearTimeout(id);
// 		};
// 	}
// }
//
// function hasWebGL() {
// 	return !!window.WebGLRenderingContext &&
// 		!!document.createElement('canvas').getContext(
// 			'experimental-webgl',
// 			{antialias: false}
// 		);
// }

function main() {

	var running = false;
	// var drawing = false;

	var interfaceContainer = document.getElementsByClassName('interface')[0];
	var button1 = document.getElementById('run');
	var button2 = document.getElementById('next_frame');

	// currently using a model where we add one of many possible renderers to our build script
	// replace with something a bit more flexible later

	var renderer = Renderer(CUBEWIDTH, CUBEHEIGHT, '.display');
	var conway = Conway(CUBEWIDTH, CUBEHEIGHT);

	function handleIntervalButtonClick(eve) {

		eve.preventDefault();
		// do no loop -- one step
		interval(true);

	}

	function handleRunButtonClick(eve) {

		eve.preventDefault();
		// run continuously
		run();

		// swap "stop" button here

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

		conway.interval();
		var changed = conway.getChanged();

		for (var i = 0; i < changed.length; i++) {
			var cur = changed[i];
			if (cur[2]) {
				renderer.setCellOn( cur[0], cur[1]);
			} else {
				renderer.setCellOff(cur[0], cur[1]);
			}
		}

		// update display
		renderer.interval();

		// loop!
		if (!noloop && running) {
			// intervalWaiting = true; // could defend against doubles here
			setTimeout(interval, 1000 / 60); // optimistic framerate - will not happen
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

	// camera look for 3d version
	// document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	// pass interface interaction through to grid n' renderer ?

	// test scenbe setou anrd crap:
	// var renderer = getThreeRenderer(window.innerWidth, window.innerHeight, '.display');
	// conway.interval();
	// renderer.interval();
	interval(true);

}

setTimeout(main, 100);
