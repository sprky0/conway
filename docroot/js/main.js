/**
 * Renderer blahblah -- THREE js thingie
 * @param integer width
 * @param integer height
 * @param string selector where to add the elements
 */
function Renderer(width, height, selector) {

	console.log("Setting up a THREE.js renderer", width, height, selector);

	// starts empty, fills as it is interacted with
	var cubes = {};

	// we always fill the whole available space regardless of grid scale
	var WIDTH = window.innerWidth; // width;
	var HEIGHT = window.innerHeight; // height;

	// our cubes should be somewhat relative to available space
	var CUBESIDE = parseInt(WIDTH / CUBEWIDTH);
	// height .. eh whatev

	// Set some camera attributes.

	// Get the DOM element to attach to
	// var container = document.querySelector(selector);

	var container = document.createElement( 'div' );
	document.body.appendChild( container );

	var camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 15000 );

	camera.position.x = CUBESIDE * (CUBEWIDTH  / 2);
	camera.position.y = CUBESIDE * (CUBEHEIGHT / 2);
	camera.position.z = 3000;

	// camera.lookAt( new THREE.Vector3( WIDTH / 2, HEIGHT / 2, 0 ) );
	var scene = new THREE.Scene();

	// Add the camera to the scene.
	// scene.add(camera); // do we do this ?

	scene.background = new THREE.Color( 0x121212 );

	// add some crap / geometry

	scene.matrixAutoUpdate = true;
	var renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	var light = new THREE.AmbientLight( 0x404040 ); // soft white light
	scene.add( light );

	var gridContainer = new THREE.Mesh(
		new THREE.BoxBufferGeometry( CUBESIDE * CUBEWIDTH, CUBESIDE * CUBEHEIGHT, CUBESIDE ),
		new THREE.MeshBasicMaterial({ color: 0x0000FF, wireframe: true })
	);
	gridContainer.position.set(0,0,0);
	scene.add( gridContainer );

	function getCubeKey(x,y) {
		return x+"_"+y;
	}

	function cubeAt(x,y) {
		var key = getCubeKey(x,y);
		return !!cubes[key];
	}

	function spawnCube(x,y) {
		if (cubeAt(x,y))
			return false;

		var key = getCubeKey(x,y);

		var mesh = new THREE.Mesh(
			new THREE.BoxBufferGeometry( CUBESIDE, CUBESIDE, CUBESIDE ),
			// new THREE.MeshBasicMaterial({ color: 0x000000 }) // , wireframe: true })
			new THREE.MeshLambertMaterial({ color: 0xff0000 })
		);
		cubes[key] = mesh;

		gridContainer.add( mesh );

		mesh.position.x = x * CUBESIDE;
		mesh.position.y = y * CUBESIDE;
		mesh.position.z = 0; // Math.floor(Math.random() * CUBEWIDTH) * CUBESIDE ;

		// camera.lookAt( mesh.position );
		// console.log( mesh );

	}

	function removeCube(x,y) {
		if (!cubeAt(x,y))
			return false;

		var key = getCubeKey(x,y);

		gridContainer.remove( cubes[key] );

		cubes[key] = null;

	}

	function setCubeColor(x, y, color) {
		if (!cubeAt(x, y))
			spawnCube(x, y);

		var key = getCubeKey(x,y);

		cubes[key].material.color.setHex(color);

	}

	function checkRotation() {

		var x = camera.position.x,
		y = camera.position.y,
		z = camera.position.z;
		//
		// if (keyboard.pressed("left")){
			camera.position.x = x * Math.cos(rotSpeed) + z * Math.sin(rotSpeed);
			camera.position.z = z * Math.cos(rotSpeed) - x * Math.sin(rotSpeed);
		// } else if (keyboard.pressed("right")){
		// 	camera.position.x = x * Math.cos(rotSpeed) - z * Math.sin(rotSpeed);
		// 	camera.position.z = z * Math.cos(rotSpeed) + x * Math.sin(rotSpeed);
		// }

		var rotSpeed = 0.02;

		camera.position.x = x * Math.cos(rotSpeed) - z * Math.sin(rotSpeed);
		camera.position.z = z * Math.cos(rotSpeed) + x * Math.sin(rotSpeed);

		camera.lookAt(scene.position);

	}

	function interval() {
		// checkRotation(); // how about like, 'update camera' instead and we check things like, accel / position / keystate
		renderer.render( scene, camera );
	}

	function onWindowResize() {
		console.log('resizing the THREE.js view');
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
	}

	window.addEventListener( 'resize', onWindowResize, false );

	// draw the initial frame before we start running the animation
	renderer.render( scene, camera );

	return {
		interval : interval,
		// setPixel
		setCellOn : function(x,y) {
			spawnCube(x,y);
			setCubeColor(x,y, 0x00ff00);
		},
		setCellOff : function(x,y) {
			// removeCube(x,y);
			setCubeColor(x,y, 0xff0000);
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
		// console.log(check);
		state.check = {}; // nuke old one, we will repopulate right now

		// loop 1 - determine the next state based on our current state
		for(var i in check) {
		// for(var x = 0; x < width; x++) {
		//	for(var y = 0; y < height; y++) {

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

		//	}
		}

		// console.log("LOOP1 (test) - " + loopCount + " too " + (new Date().getTime() - startLoopMS) + "ms");

		loopCount = 0;
		// var startLoopsMS = new Date().getTime();

		// loop 2 - draw the changes
		// it might be more performant if we just determined the difference
		// above and only looped through the known changed cells.  might do this later
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
