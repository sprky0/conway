var CUBEWIDTH = 100;
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
