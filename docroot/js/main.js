var CUBEWIDTH = 10;
var CUBEHEIGHT = 10;

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel

function ensureAnimationFrame() {
	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
	}
	if (!window.requestAnimationFrame) {
		window.requestAnimationFrame = function(callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() { callback(currTime + timeToCall); },timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
	}
	if (!window.cancelAnimationFrame) {
		window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
	}
}

function hasWebGL() {
	return !!window.WebGLRenderingContext &&
		!!document.createElement('canvas').getContext(
			'experimental-webgl',
			{antialias: false}
		);
}

function getCanvasRenderer(width, height, selector) {

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

// Set the scene size.
function getThreeRenderer(width, height, selector) {

	console.log("Setting up a THREE.js renderer", width, height, selector);

	// starts empty, fills as it is interacted with
	var cubes = {};

	// we always fill the whole available space regardless of grid scale
	var WIDTH = window.innerWidth; // width;
	var HEIGHT = window.innerHeight; // height;

	// our cubes should be somewhat relative to available space
	var CUBESIDE = parseInt(WIDTH / CUBEWIDTH);
	// height .. eh

	// Set some camera attributes.

	// Get the DOM element to attach to
	// var container = document.querySelector(selector);

	var container = document.createElement( 'div' );
	document.body.appendChild( container );

	var camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 15000 );

	camera.position.x = CUBESIDE * (CUBEWIDTH / 2);
	camera.position.y = CUBESIDE * (CUBEHEIGHT / 2);
	camera.position.z = 3000;

	// camera.lookAt( new THREE.Vector3( WIDTH / 2, HEIGHT / 2, 0 ) );
	var scene = new THREE.Scene();

	// Add the camera to the scene.
	// scene.add(camera); // do we do this ?

	scene.background = new THREE.Color( 0xffff00 );

	// add some crap / geometry

	scene.matrixAutoUpdate = true;
	var renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	// var light = new THREE.AmbientLight( 0x404040 ); // soft white light
	// scene.add( light );

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
			new THREE.MeshBasicMaterial({ color: 0x000000 }) // , wireframe: true })
		);
		cubes[key] = mesh;

		mesh.position.x = x * CUBESIDE;
		mesh.position.y = y * CUBESIDE;
		mesh.position.z = 0; // Math.floor(Math.random() * CUBEWIDTH) * CUBESIDE ;

		scene.add( mesh );
		// camera.lookAt( mesh.position );
		// console.log( mesh );

	}

	function removeCube(x,y) {
		if (!cubeAt(x,y))
			return false;

		var key = getCubeKey(x,y);

		scene.remove( cubes[key] );

		cubes[key] = null;

	}

	function interval() {
		// console.log("looking at stuff!");
		// console.log( scene.children );

		camera.position.z += 10;

		// camera.lookAt ( scene.children[ Math.floor(Math.random() * scene.children.length) ].position );

		renderer.render( scene, camera );

	}

	function onWindowResize() {
		console.log('resizing the THREE.js view');
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
	}


	//
	// var mesh = new THREE.Mesh(
	// 	new THREE.BoxBufferGeometry( CUBESIDE, CUBESIDE, CUBESIDE ),
	// 	new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } )
	// );
	// scene.add( mesh );


	window.addEventListener( 'resize', onWindowResize, false );


	// draw the initial frame before we start running the animation
	renderer.render( scene, camera );

	return {
		interval : interval,
		// setPixel
		setCellOn : function(x,y) {
			spawnCube(x,y);
		},
		setCellOff : function(x,y) {
			removeCube(x,y);
		}
	};

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

	var width = CUBEWIDTH,
		height = CUBEHEIGHT;

	width = parseInt( window.innerWidth / CUBEWIDTH );
	height = parseInt( window.innerHeight / CUBEHEIGHT );

	var interfaceContainer = document.getElementsByClassName('interface')[0];
	var button1 = document.getElementById('run');
	var button2 = document.getElementById('next_frame');

	// var renderer = getCanvasRenderer(width, height, '.display');
	var renderer = getThreeRenderer(width, height, '.display');

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
		renderer.setCellOff(x, y);
		// console.log("OFF",x,y);
	}

	function setCellOn(x, y) {
		state.current[x + "_" + y].state = true;
		renderer.setCellOn(x, y);
		// console.log("ON ",x,y);
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

	// canvas specific interaction:
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
		// do no loop -- one step
		interval(true);

	}

	function handleRunButtonClick(eve) {

		eve.preventDefault();
		// run continuously
		run();

		// swap "stop" button here

	}

	function init() {

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

		for(var x = 0; x < width; x++) {
			for(var y = 0; y < height; y++) {
				state.current[x+"_"+y] = {state:false};
				state.next[x+"_"+y] = {state: Math.random() > 0.5 ? true : false};
				// state.next[x+"_"+y] = {state: false};
			}
		}

		// gliderland
		/*
		for(var i = 0; i < 400; i++) {

			var curGlider = gliders[randomInt(0, gliders.length)];

			var glideX = randomInt(0, width);
			var glideY = randomInt(0, height);

			for (var g = 0; g < curGlider.length; g++) {

				var curX = (width + (glideX + curGlider[g][0])) % width;
				var curY = (height + (glideY + curGlider[g][1])) % height;

				state.next[curX +"_"+ curY] = {state: true};

			}

		}
		*/

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

		renderer.interval();

		// console.log("LOOP2 (draw) - " + loopCount + " too " + (new Date().getTime() - startLoopMS) + "ms");
		if (!noloop && running) {
			// intervalWaiting = true; // could defend against doubles here
			// not working for some reason, deal with this later:
			setTimeout(interval, 1000 / 60); // optimistic framerate - will not happen
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

	// camera look for 3d version
	// document.addEventListener( 'mousemove', onDocumentMouseMove, false );

	init();

}

function main() {

	//
	runConway();

	// console.log("LEZ GO");
	// alert( hasWebGL() );

	// test scenbe setou anrd crap:
	// var renderer = getThreeRenderer(window.innerWidth, window.innerHeight, '.display');
	// renderer.interval();

}

setTimeout(main, 100);
