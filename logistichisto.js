// Logistic Map Histogram + Bifurcation Diagram
// copyright (c) 2014 Peter Corbett - see LICENSE

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var hcanvas = document.getElementById('hcanvas');
var hctx = hcanvas.getContext('2d');

canvas.width = 1600;
canvas.height = 400;

var iters = 20;
var points = 1000;
var minr = 3.5;
var maxr = 4.0;
var minx = 0.4;
var maxx = 0.6;

var drawrect = 0;
var rectx = 0;
var recty = 0;

var img = 0;

var vals = [];

var histo_x = 0;
var intensity = 0.01;

function readform() {
	canvas.width = parseInt(document.getElementById("gwidth").value);
	canvas.height = parseInt(document.getElementById("gheight").value);
	hcanvas.width = canvas.height;
	hcanvas.height = parseInt(document.getElementById("hheight").value);
	intensity = parseFloat(document.getElementById("intensity").value);
	iters = parseInt(document.getElementById("iterations").value);
	points = parseInt(document.getElementById("points").value);
	minr = parseFloat(document.getElementById("minr").value);
	maxr = parseFloat(document.getElementById("maxr").value);
	minx = parseFloat(document.getElementById("minx").value);
	maxx = parseFloat(document.getElementById("maxx").value);
}

function mousedown(event) {
	var cx = (event.pageX-canvas.offsetLeft);
	var cy = (event.pageY-canvas.offsetTop);

	histo_x = cx;
	render_histo();
}

function render_histo() {
	var hv = vals[histo_x];
	var my = 0.0;
	for(var i=0;i<hv.length;i++) {
		my = Math.max(my, hv[i]);
	}
	var himg = hctx.getImageData(0, 0, hcanvas.width, hcanvas.height);
	var data = himg.data;
	for(var i=0;i<hv.length;i++) {
		var top = (hv[i] / my) * hcanvas.height;
		for(var j=0;j<hcanvas.height;j++) {
			var idx = ((hcanvas.height-(j+1)) * hcanvas.width + i) * 4;
			if(j<top) {
				data[idx] = 200;
				data[idx+1] = 200;
				data[idx+2] = 200;
			} else {
				data[idx] = 0;
				data[idx+1] = 0;
				data[idx+2] = 0;			
			}

			data[idx+3] = 255;
		}
	}
	hctx.putImageData(himg, 0, 0);
	var hr = minr + ((maxr-minr) * histo_x / canvas.width);
	var e = document.getElementById("status");
	e.innerHTML = "r=" + minr + " to " + maxr + " x=" + minx + " to " + maxx + " Histogram r=" + hr;
}

function render() {
	img = ctx.getImageData(0, 0, canvas.width, canvas.height);
	var data = img.data;
	vals = [];
	for(var i=0;i<canvas.width;i++) {
		vals[i] = [];
		for(var j=0;j<canvas.height;j++) {
			vals[i][j] = 0;
		}
		for(var j=0;j<points;j++) {
			var r = minr + ((maxr-minr) * i / canvas.width);
			var x = Math.random();
			for(var iter=0;iter<iters;iter++) {
				x = r * x * (1.0 - x);
			}
			var y = Math.round((x - minx) * canvas.height / (maxx - minx));
			if(y >= 0 && y < canvas.height) vals[i][y]++;
		}
		for(var j=0;j<canvas.height;j++) {		
			var idx = ((canvas.height-(j+1)) * canvas.width + i) * 4;
			var v = Math.min(255, 255 * (1-Math.pow(1 - intensity, vals[i][j])));
			data[idx] = v;
			data[idx+1] = v;
			data[idx+2] = v;
			data[idx+3] = 255;
		}
	}
	ctx.putImageData(img, 0, 0);
	histo_x = 0;
	render_histo();
}

function reset() {
	readform();
	render();
}

canvas.addEventListener("mousedown", mousedown, false);

reset();
