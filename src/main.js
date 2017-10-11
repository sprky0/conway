var CUBEWIDTH  = 32;
var CUBEHEIGHT = 32;

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

	button1.addEventListener('click', handleRunButtonClick);
	button2.addEventListener('click', handleIntervalButtonClick);

	conway.init();
	conway.addRandomGliders( 4 );
	conway.forcePopulate();

	interval(true);

}

setTimeout(main, 100);
