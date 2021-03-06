
var container, stats;
var camera, scene, renderer;
var mesh, geometry, sphere;
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
document.addEventListener( 'mousemove', onDocumentMouseMove, false );

init();
animate();

function init() {

	container = document.createElement( 'div' );

	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 15000 );
	camera.position.z = 3200;

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xffff00 );

	sphere = new THREE.Mesh( new THREE.SphereGeometry( 100, 20, 20 ), new THREE.MeshNormalMaterial() );
	scene.add( sphere );

	var geometry = new THREE.CylinderGeometry( 0, 10, 100, 12 );
	geometry.rotateX( Math.PI / 2 );
	var material = new THREE.MeshNormalMaterial();
	for ( var i = 0; i < 1000; i ++ ) {
		var mesh = new THREE.Mesh( geometry, material );
		mesh.position.x = Math.random() * 4000 - 2000;
		mesh.position.y = Math.random() * 4000 - 2000;
		mesh.position.z = Math.random() * 4000 - 2000;
		mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 4 + 2;
		scene.add( mesh );
	}
	scene.matrixAutoUpdate = false;
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );
	// stats = new Stats();
	// container.appendChild( stats.dom );
	//
	window.addEventListener( 'resize', onWindowResize, false );
}
function onWindowResize() {
	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}
function onDocumentMouseMove(event) {
	mouseX = ( event.clientX - windowHalfX ) * 10;
	mouseY = ( event.clientY - windowHalfY ) * 10;
}
//
function animate() {
	requestAnimationFrame( animate );
	render();
	// stats.update();
}
function render() {
	var time = Date.now() * 0.0005;
	sphere.position.x = Math.sin( time * 0.7 ) * 2000;
	sphere.position.y = Math.cos( time * 0.5 ) * 2000;
	sphere.position.z = Math.cos( time * 0.3 ) * 2000;
	for ( var i = 1, l = scene.children.length; i < l; i ++ ) {
		scene.children[ i ].lookAt( sphere.position );
	}
	camera.position.x += ( mouseX - camera.position.x ) * 0.05;
	camera.position.y += ( - mouseY - camera.position.y ) * 0.05;
	// camera.lookAt( sphere.position  ); // scene.position
	renderer.render( scene, camera );
}
