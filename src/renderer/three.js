/**
 * Renderer blahblah -- THREE js thingie
 * @param integer width
 * @param integer height
 * @param string selector where to add the elements
 */
function Renderer(width, height, selector) {

	console.log("Setting up a THREE.js renderer", width, height, selector);

	// Keep original variable names for compatibility
	var cubes = {};

	// we always fill the whole available space regardless of grid scale
	var WIDTH = window.innerWidth;
	var HEIGHT = window.innerHeight;

	// Calculate cube size based on available space
	var CUBESIDE = Math.min(
		(WIDTH * 0.8) / width,
		(HEIGHT * 0.8) / height,
		200 // Keep the original max size
	);

	// Get the DOM element to attach to
	var container = document.querySelector(selector);

	var camera = new THREE.PerspectiveCamera(1, window.innerWidth / window.innerHeight, 1, 15000);

	camera.position.x = CUBESIDE * (width / 2);
	camera.position.y = CUBESIDE * (height / 2);
	camera.position.z = 12000;

	var scene = new THREE.Scene();

	scene.background = new THREE.Color(0x121212);

	// Performance optimization: Use scene.matrixAutoUpdate as in original
	scene.matrixAutoUpdate = true;

	var renderer = new THREE.WebGLRenderer({
		antialias: true,
		// Performance improvements while maintaining API
		powerPreference: 'high-performance',
		precision: 'mediump'
	});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	container.appendChild(renderer.domElement);

	var light = new THREE.AmbientLight(0x404040);
	scene.add(light);

	// Add directional light for better 3D appearance - doesn't change API
	var directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
	directionalLight.position.set(1, 1, 1).normalize();
	scene.add(directionalLight);

	var gridContainer = new THREE.Mesh(
		new THREE.BoxBufferGeometry(CUBESIDE * width, CUBESIDE * height, CUBESIDE),
		new THREE.MeshBasicMaterial({ color: 0x0000FF, wireframe: true })
	);
	gridContainer.position.set(
		(CUBESIDE * width / 2),
		(CUBESIDE * height / 2),
		0
	);
	scene.add(gridContainer);

	// Create materials once to reuse - performance optimization that doesn't change API
	var aliveMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
	var deadMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });

	// Create a single geometry to reuse - performance optimization that doesn't change API
	var cubeGeometry = new THREE.BoxBufferGeometry(CUBESIDE, CUBESIDE, CUBESIDE);

	function getCubeKey(x, y) {
		return x + "_" + y; // Keep original format
	}

	function cubeAt(x, y) {
		var key = getCubeKey(x, y);
		return !!cubes[key];
	}

	function spawnCube(x, y) {
		if (cubeAt(x, y))
			return false;

		var key = getCubeKey(x, y);

		var mesh = new THREE.Mesh(
			cubeGeometry,
			new THREE.MeshLambertMaterial({ color: 0xff0000 })
		);
		cubes[key] = mesh;

		gridContainer.add(mesh);

		mesh.position.x = (x * CUBESIDE) - (CUBESIDE * width / 2);
		mesh.position.y = (y * CUBESIDE) - (CUBESIDE * height / 2);
		mesh.position.z = 0;
	}

	function removeCube(x, y) {
		if (!cubeAt(x, y))
			return false;

		var key = getCubeKey(x, y);

		gridContainer.remove(cubes[key]);

		// Performance optimization: explicitly dispose the object
		cubes[key].geometry = undefined;
		cubes[key].material.dispose();
		cubes[key].material = undefined;

		cubes[key] = null;
		delete cubes[key]; // Ensure it's removed from the object
	}

	function setCubeColor(x, y, color) {
		if (!cubeAt(x, y))
			spawnCube(x, y);

		var key = getCubeKey(x, y);

		cubes[key].material.color.setHex(color);
	}

	// Performance optimization: simplified camera rotation that preserves behavior
	function updateCamera() {
		var x = camera.position.x,
			z = camera.position.z;

		var rotSpeed = 0.001;

		camera.position.x = x * Math.cos(rotSpeed) - z * Math.sin(rotSpeed);
		camera.position.z = z * Math.cos(rotSpeed) + x * Math.sin(rotSpeed);

		var lookPos = new THREE.Vector3(
			CUBESIDE * width / 2,
			CUBESIDE * height / 2,
			0
		);
		camera.lookAt(lookPos);
	}

	// Keep original function unchanged
	function interval() {
		updateCamera();
		renderer.render(scene, camera);
	}

	// Keep original function unchanged
	function onWindowResize() {
		console.log('resizing the THREE.js view');
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}

	window.addEventListener('resize', onWindowResize, false);

	// draw the initial frame before we start running the animation
	renderer.render(scene, camera);

	// Keep exactly the same return API as original
	return {
		interval: interval,
		setCellOn: function (x, y) {
			spawnCube(x, y);
			setCubeColor(x, y, 0x00ff00, 1);
		},
		setCellOff: function (x, y) {
			// Uses original behavior - don't remove, just change color
			setCubeColor(x, y, 0xff0000, 0);
		}
	};
}