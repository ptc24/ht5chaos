// Lorenz Pixmap
// copyright (c) 2014 Peter Corbett - see LICENSE

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

canvas.width = 1600;
canvas.height = 400;

var img = 0;
var record = 0;

var sigma = 10;
var rho = 28
var beta = 8/3;

var sigma0 = 10;
var rho0 = 28;
var beta0 = 8/3;
var sigmai = 0;
var rhoi = 0;
var betai = 0;
var sigmaj = 0;
var rhoj = 0;
var betaj = 0;
var sigmav = [];
var rhov = [];
var betav = [];

var perframe = 1;
var deltat = 0.001;

var maxx = -100000;
var minx = 100000;
var maxy = -100000;
var miny = 100000;
var maxz = -100000;
var minz = 100000;

var x0=0; var xi=0; var xj=0;
var y0=0; var yi=0; var yj=0;
var z0=0; var zi=0; var zj=0;

var xv = [];
var yv = [];
var zv = [];

var running = 0;

function readform() {
	canvas.width = parseFloat(document.getElementById("gwidth").value);
	canvas.height = parseFloat(document.getElementById("gheight").value);
	perframe = parseInt(document.getElementById("perframe").value);
	deltat = parseFloat(document.getElementById("deltat").value);

	sigma = parseFloat(document.getElementById("sigma").value);
	rho = parseFloat(document.getElementById("rho").value);
	beta = parseFloat(document.getElementById("beta").value);
	sigma0 = parseFloat(document.getElementById("sigma0").value);
	rho0 = parseFloat(document.getElementById("rho0").value);
	beta0 = parseFloat(document.getElementById("beta0").value);
	sigmai = parseFloat(document.getElementById("sigmai").value);
	rhoi = parseFloat(document.getElementById("rhoi").value);
	betai = parseFloat(document.getElementById("betai").value);
	sigmaj = parseFloat(document.getElementById("sigmaj").value);
	rhoj = parseFloat(document.getElementById("rhoj").value);
	betaj = parseFloat(document.getElementById("betaj").value);

	maxx = parseFloat(document.getElementById("maxx").value);
	minx = parseFloat(document.getElementById("minx").value);
	maxy = parseFloat(document.getElementById("maxy").value);
	miny = parseFloat(document.getElementById("miny").value);
	maxz = parseFloat(document.getElementById("maxz").value);
	minz = parseFloat(document.getElementById("minz").value);

	x0 = parseFloat(document.getElementById("x0").value);
	xi = parseFloat(document.getElementById("xi").value);
	xj = parseFloat(document.getElementById("xj").value);
	y0 = parseFloat(document.getElementById("y0").value);
	yi = parseFloat(document.getElementById("yi").value);
	yj = parseFloat(document.getElementById("yj").value);
	z0 = parseFloat(document.getElementById("z0").value);
	zi = parseFloat(document.getElementById("zi").value);
	zj = parseFloat(document.getElementById("zj").value);

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
		for(var j=0;j<canvas.height;j++) {
			var idx = ((canvas.height-j-1) * canvas.width + i) * 4;
			x = (xv[i][j] - minx)/(maxx-minx);
			x = Math.max(0, Math.min(1,x));
			y = (yv[i][j] - miny)/(maxy-miny);
			y = Math.max(0, Math.min(1,y));
			z = (zv[i][j] - minz)/(maxz-minz);
			z = Math.max(0, Math.min(1,z));
			data[idx] = x * 255;
			data[idx+1] = y * 255;
			data[idx+2] = z * 255;
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
	readform();
	xv = [];
	yv = [];
	zv = [];
	sigmav = [];
	rhov = [];
	betav = [];
	for(var i=0;i<canvas.width;i++) {
		xv.push([]);
		yv.push([]);
		zv.push([]);
		sigmav.push([]);
		rhov.push([]);
		betav.push([]);
		for(var j=0;j<canvas.height;j++) {
			xv[i][j] = x0 + (xi * i/canvas.width) + (xj * j/canvas.height);
			yv[i][j] = y0 + (yi * i/canvas.width) + (yj * j/canvas.height);
			zv[i][j] = z0 + (zi * i/canvas.width) + (zj * j/canvas.height);

			sigmav[i][j] = sigma0 + (sigmai * i/canvas.width) + (sigmaj * j/canvas.height);
			rhov[i][j] = rho0 + (rhoi * i/canvas.width) + (rhoj * j/canvas.height);
			betav[i][j] = beta0 + (betai * i/canvas.width) + (betaj * j/canvas.height);
			
		}
	}
	render();
}

function iterate() {
	var t = Date.now();
	for(var cyc=0;cyc<perframe;cyc++) {
		for(var i=0;i<canvas.width;i++) {
			for(var j=0;j<canvas.height;j++) {
				var xx = xv[i][j];
				var yy = yv[i][j];
				var zz = zv[i][j];
				xv[i][j] += deltat * (sigmav[i][j]*(yy-xx));
				yv[i][j] += deltat * ((xx*(rhov[i][j]-zz)) - yy);
				zv[i][j] += deltat * ((xx*yy) - (betav[i][j]*zz));
			}
		}
	}
	var e = document.getElementById("status");
	e.innerHTML = "Time per frame: " + (Date.now() - t);
	render();
	if(running == 1) setTimeout(iterate, 10);
}

function stop() {
	running = 0;
}

function mousedown(event) {
	var cx = (event.pageX-canvas.offsetLeft);
	var cy = (event.pageY-canvas.offsetTop);
	var i = cx;
	var j = canvas.height-cy-1;
	var e = document.getElementById("status");
	e.innerHTML = "";
	e.innerHTML += "x0: " + x0 + (xi * i/canvas.width) + (xj * j/canvas.height);
	e.innerHTML += " y0: " + y0 + (yi * i/canvas.width) + (yj * j/canvas.height);
	e.innerHTML += " z0: " + z0 + (zi * i/canvas.width) + (zj * j/canvas.height);
	e.innerHTML += " x " + xv[i][j];
	e.innerHTML += " y " + yv[i][j];
	e.innerHTML += " z " + zv[i][j];
	e.innerHTML += " sigma " + sigmav[i][j];
	e.innerHTML += " rho " + rhov[i][j];
	e.innerHTML += " beta " + betav[i][j];
}

function autoiterate() {
	running = 1;
	iterate();
}

canvas.addEventListener("mousedown", mousedown, false);

reset();
