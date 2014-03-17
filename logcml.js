// Logistic Map CML
// copyright (c) 2014 Peter Corbett - see LICENSE

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

canvas.width = 1600;
canvas.height = 400;

var img = 0;
var record = 0;

var running = 0;
var simtime = 0;
var frames = 0;

var citer = 0;

var xs = [];
var nxs = [];
var rs = [];
var ks = [];
var noises = [];

var xstr = "";
var nstr = "";
var rstr = "";
var kstr = "";

var k = 1.0;
var r = 1.0;

// Box-Muller Transform Gaussian
function rnd_gauss() {
	return Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random());
}

// A random number from a Cauchy distribution
function rnd_cauchy() {
	return rnd_gauss() / rnd_gauss();
}

function readform() {
	canvas.width = parseFloat(document.getElementById("gwidth").value);
	canvas.height = parseFloat(document.getElementById("gheight").value);

	xstr = document.getElementById("xstr").value
	rstr = document.getElementById("rstr").value
	kstr = document.getElementById("kstr").value
	nstr = document.getElementById("nstr").value
	
	if(document.getElementById("record") == null) {
		record = 0;
	} else {
		record = document.getElementById("record").checked ? 1 : 0;
	}

}

function render() {
	img = ctx.getImageData(0, 0, canvas.width, canvas.height);
	var data = img.data;

	for(var i=0;i<canvas.width;i++) {
		console.log(i);
		for(var j=0;j<canvas.height;j++) {
			var idx = ((canvas.height-j-1) * canvas.width + i) * 4;
			
			var xx = xs[i][j] * 255;
			var r = xx;
			var g = xx;
			var b = xx;
			
			data[idx] = r;
			data[idx+1] = g;
			data[idx+2] = b;
			data[idx+3] = 255;
		}
	}
	ctx.putImageData(img, 0, 0);
	if(record == 1) record_image();	
}

function record_image() {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("POST","record_image",false);
	xmlhttp.send(canvas.toDataURL());
	var e = document.getElementById("status");
	e.innerHTML += " " + xmlhttp.responseText;
}

function reset() {
	running = 0;
	crunning = 0;
	readform();
	frames = 0;
	
	xs = [];
	nxs = [];
	rs = [];
	ks = [];
	noises = [];
	
	for(var i=0;i<canvas.width;i++) {
		xs.push([]);
		nxs.push([]);
		rs.push([]);
		ks.push([]);
		noises.push([]);
		for(var j=0;j<canvas.height;j++) {
			var x = i*1.0/canvas.width;
			var y = j*1.0/canvas.height;
			nxs[i].push(0);
			noises[i].push(eval(nstr));
			ks[i].push(eval(kstr));
			xs[i].push(eval(xstr));
			rs[i].push(eval(rstr));
		}
	}
	render();
}

function iterate() {
	var t = Date.now();
	for(var i=0;i<canvas.width;i++) {
		for(var j=0;j<canvas.height;j++) {
			nxs[i][j] = rs[i][j]*xs[i][j]*(1.0-xs[i][j]);
		}
	}
	for(var i=0;i<canvas.width;i++) {
		for(var j=0;j<canvas.height;j++) {
			var xt = nxs[i][j];
			var n = 1;
			if(i>0) {
				xt += nxs[i-1][j];
				n++;
			}
			if(j>0) {
				xt += nxs[i][j-1];
				n++;
			}
			if(i<canvas.width-1) {
				xt += nxs[i+1][j];
				n++;
			}
			if(j<canvas.height-1) {
				xt += nxs[i][j+1];
				n++;
			}
			xs[i][j] = (ks[i][j] * (xt / n)) + ((1-ks[i][j]) * nxs[i][j]);
			if(noises[i][j] > 0) xs[i][j] = (Math.random() * noises[i][j]) + ((1-noises[i][j])*xs[i][j]);
		}
	}
	frames++;
	var e = document.getElementById("status");
	e.innerHTML = "Time per frame: " + (Date.now() - t) + " Frames so far " + frames;
	render();
	if(running == 1) setTimeout(iterate, 10);
}

function stop() {
	running = 0;
	crunning = 0;
}

function mousedown(event) {
	var cx = (event.pageX-canvas.offsetLeft);
	var cy = (event.pageY-canvas.offsetTop);
	var e = document.getElementById("status");
	e.innerHTML = "x = " + (cx / canvas.width) + " y= " + (1.0 - (cy / canvas.height));
}

function matmult(m1, m2) {
	var result = [];
	for(var i=0;i<m1.length;i++) {
		result.push([]);
		for(var j=0;j<m2[0].length;j++) {
			var t = 0;
			for(var k=0;k<m1[0].length;k++) t += m1[i][k] * m2[k][j];
			result[i].push(t);
		}
	}
	return result;
}

function autoiterate() {
	running = 1;
	crunning = 0;
	iterate();
}

canvas.addEventListener("mousedown", mousedown, false);

reset();
