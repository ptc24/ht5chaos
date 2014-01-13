// Logistic Map Pixmap
// copyright (c) 2014 Peter Corbett - see LICENSE

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

canvas.width = 1600;
canvas.height = 400;

var iters = 20;
var minr = 3.5;
var maxr = 4.0;
var minx = 0.4;
var maxx = 0.6;

var drawrect = 0;
var rectx = 0;
var recty = 0;

var img = 0;

function readform() {
	canvas.width = parseFloat(document.getElementById("gwidth").value);
	canvas.height = parseFloat(document.getElementById("gheight").value);
	iters = parseInt(document.getElementById("iterations").value);
	minr = parseFloat(document.getElementById("minr").value);
	maxr = parseFloat(document.getElementById("maxr").value);
	minx = parseFloat(document.getElementById("minx").value);
	maxx = parseFloat(document.getElementById("maxx").value);
}

function update(mod) {
	iters++;
}

function mousedown(event) {
	var cx = (event.pageX-canvas.offsetLeft);
	var cy = (event.pageY-canvas.offsetTop);

	var r = minr + ((maxr-minr) * cx / canvas.width);
	var x0 = minx + ((maxx - minx) * cy / canvas.height);
	
	drawrect = 1;
	rectx = cx;
	recty = cy;
}

function mousemove(event) {
	if(drawrect == 1) {
		var cx = (event.pageX-canvas.offsetLeft);
		var cy = (event.pageY-canvas.offsetTop);
		ctx.putImageData(img, 0, 0);
		ctx.beginPath();
		ctx.strokeStyle = '#f00';
		ctx.lineWidth = 1;
		ctx.rect(rectx, recty, cx-rectx, cy-recty);
		ctx.stroke();
	}
}

function mouseout(event) {
	drawrect = 0;
	ctx.putImageData(img, 0, 0);
}

function mouseup(event) {
	if(drawrect == 1) {
		drawrect = 0;
		var cx = (event.pageX-canvas.offsetLeft);
		var cy = (event.pageY-canvas.offsetTop);
		var ra = minr + ((maxr-minr) * rectx / canvas.width);
		var x0a = minx + ((maxx - minx) * (canvas.height-recty-1) / canvas.height);
		var rb = minr + ((maxr-minr) * cx / canvas.width);
		var x0b = minx + ((maxx - minx) * (canvas.height-cy-1) / canvas.height);
		if(ra > rb) {
			var tmp = ra;
			ra = rb;
			rb = tmp;
		}
		if(x0a > x0b) {
			var tmp = x0a;
			x0a = x0b;
			x0b = tmp;
		}
		minx = x0a;
		maxx = x0b;
		minr = ra;
		maxr = rb;
		render();
		ctx.putImageData(img, 0, 0);
	
	}
}

function render() {
	img = ctx.getImageData(0, 0, canvas.width, canvas.height);
	var data = img.data;
	for(var i=0;i<canvas.width;i++) {
		for(var j=0;j<canvas.height;j++) {
			var r = minr + ((maxr-minr) * i / canvas.width);
			var x = minx + ((maxx - minx) * j / canvas.height);
			for(var iter=0;iter<iters;iter++) {
				x = r * x * (1.0 - x);
			}
			var idx = ((canvas.height-j-1) * canvas.width + i) * 4;
			data[idx] = x * 255;
			data[idx+1] = x * 255;
			data[idx+2] = x * 255;
			data[idx+3] = 255;
		}
	}
	ctx.putImageData(img, 0, 0);
	var e = document.getElementById("status");
	e.innerHTML = "r=" + minr + " to " + maxr + " x<sub>0</sub>=" + minx + " to " + maxx; 
}

function reset() {
	readform();
	render();
}

canvas.addEventListener("mousedown", mousedown, false);
canvas.addEventListener("mousemove", mousemove, false);
canvas.addEventListener("mouseup", mouseup, false);
canvas.addEventListener("mouseout", mouseout, false);

reset();

function run() {
	update((Date.now() - time) / 1000);
	render();
	time = Date.now();
}

//var time = Date.now();
//setInterval(run, 1000);
