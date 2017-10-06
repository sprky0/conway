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
