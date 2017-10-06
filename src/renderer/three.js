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
