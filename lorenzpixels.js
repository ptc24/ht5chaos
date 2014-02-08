// Lorenz Pixmap
// copyright (c) 2014 Peter Corbett - see LICENSE

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var canvas2 = document.getElementById('canvas2');
var ctx2 = canvas2.getContext('2d');

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

var xpoints = [];
var ypoints = [];
var zpoints = [];
var xcentre = 0;
var ycentre = 0;
var zcentre = 0;
var xrot = 0;
var yrot = 0;
var zrot = 0;
var zoom = 10;

var running = 0;
var crunning = 0;
var simtime = 0;
var frames = 0;

var citer = 0;

function readform() {
	canvas.width = parseFloat(document.getElementById("gwidth").value);
	canvas.height = parseFloat(document.getElementById("gheight").value);
	canvas2.height = canvas.height;
	canvas2.width = canvas.height;
	perframe = parseInt(document.getElementById("perframe").value);
	deltat = parseFloat(document.getElementById("deltat").value);

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
	
	citer = parseInt(document.getElementById("citer").value);

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
	crunning = 0;
	readform();
	xv = [];
	yv = [];
	zv = [];
	sigmav = [];
	rhov = [];
	betav = [];
	simtime = 0;
	frames = 0;
	citer = 0;
	document.getElementById("citer").value = citer;
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
		simtime += deltat;
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
	frames++;
	var e = document.getElementById("status");
	e.innerHTML = "Time per frame: " + (Date.now() - t) + " Frames so far " + frames + " t " + simtime.toFixed(Math.ceil(-Math.log(deltat)/Math.LN10));
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
	var i = cx;
	var j = canvas.height-cy-1;
	var e = document.getElementById("status");
	e.innerHTML = "";
	e.innerHTML += "x0: " + (x0 + (xi * i/canvas.width) + (xj * j/canvas.height));
	e.innerHTML += " y0: " + (y0 + (yi * i/canvas.width) + (yj * j/canvas.height));
	e.innerHTML += " z0: " + (z0 + (zi * i/canvas.width) + (zj * j/canvas.height));
	e.innerHTML += " x " + xv[i][j];
	e.innerHTML += " y " + yv[i][j];
	e.innerHTML += " z " + zv[i][j];
	e.innerHTML += " sigma " + sigmav[i][j];
	e.innerHTML += " rho " + rhov[i][j];
	e.innerHTML += " beta " + betav[i][j];
	calculate_points((x0 + (xi * i/canvas.width) + (xj * j/canvas.height)), (y0 + (yi * i/canvas.width) + (yj * j/canvas.height)), (z0 + (zi * i/canvas.width) + (zj * j/canvas.height)),
		sigmav[i][j], rhov[i][j], betav[i][j]);
	render_c2();
}

function calculate_points(xx, yy, zz, sigma, rho, beta) {
	xpoints = [];
	ypoints = [];
	zpoints = [];
	var xp = 0;
	xcentre = 0;
	ycentre = 0;
	zcentre = 0;
	for(var i=0;i<canvas.width;i++) {
		for(var j=0;j<canvas.height;j++) {
			xp++;
			xcentre+=xv[i][j];
			ycentre+=yv[i][j];
			zcentre+=zv[i][j];		
		}
	}
	xcentre /= xp;
	ycentre /= xp;
	zcentre /= xp;
	
	
	for(var t=0;t<frames*perframe;t++) {
		var xxt = xx;
		var yyt = yy;
		var zzt = zz;
		xx += deltat * (sigma*(yyt-xxt));
		yy += deltat * ((xxt*(rho-zzt)) - yyt);
		zz += deltat * ((xxt*yyt) - (beta*zzt));
		xpoints.push(xx);
		ypoints.push(yy);
		zpoints.push(zz);
	}

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

function render_c2() {
	ctx2.fillStyle = '#000';
	ctx2.fillRect(0, 0, canvas2.width, canvas2.height);
	ctx2.fill();
	ctx2.strokeStyle = '#fff';
	ctx2.lineWidth=4;
	
	var xrm = [[1, 0, 0],
	[0, Math.cos(xrot), -Math.sin(xrot)],
	[0, Math.sin(xrot), Math.cos(xrot)]];
	var yrm = [[Math.cos(yrot), 0 , Math.sin(yrot)],
	[0, 1, 0],
	[-Math.sin(yrot), 0, Math.cos(yrot)]];
	var zrm = [[Math.cos(zrot), -Math.sin(zrot), 0],
	[Math.sin(zrot), Math.cos(zrot), 0],
	[0, 0, 1]];
	var rm = matmult(xrm, matmult(yrm, zrm));

	var pdex = [];
	for(var i=0;i<xpoints.length-1-citer;i++) pdex.push(i);
	var cl = [];
	for(var i=0;i<xpoints.length;i++) {
		var p = [[xpoints[i]-xcentre],[ypoints[i]-ycentre],[zpoints[i]-zcentre]];
		p = matmult(rm, p);
		cl.push(p);
	}
	console.log(pdex.length);
	pdex.sort(function(a,b) {return cl[a][2][0] - cl[b][2][0]});
	console.log(pdex.length);

	
	for(var i=0;i<pdex.length;i++) {
		var ii = pdex[i];
		ctx2.beginPath();
		//ctx2.strokeStyle = '#fff';
		var	x = (xpoints[ii+citer] - minx)/(maxx-minx);
		x = Math.max(0, Math.min(1,x));
		var	y = (ypoints[ii+citer] - miny)/(maxy-miny);
		y = Math.max(0, Math.min(1,y));
		var	z = (zpoints[ii+citer] - minz)/(maxz-minz);
		z = Math.max(0, Math.min(1,z));
		
		ctx2.strokeStyle = "rgb(" + Math.floor(x*256) + "," + Math.floor(y*256) + "," + Math.floor(z*256) + ")";
		//var shade = Math.floor(128*(i/pdex.length))+127;
		//ctx2.strokeStyle = "rgb(" + shade + "," + shade + "," + shade + ")";
		var p1 = cl[ii];
		var p2 = cl[ii+1];
		ctx2.moveTo((p1[0][0]*zoom)+(canvas2.width/2),(canvas2.height/2)-(p1[1][0]*zoom));
		ctx2.lineTo((p2[0][0]*zoom)+(canvas2.width/2),(canvas2.height/2)-(p2[1][0]*zoom));
		ctx2.stroke();
	}
	if(crunning == 1) setTimeout(citerate, 10);
}

function citerate() {
	citer = parseInt(document.getElementById("citer").value);
	citer+=perframe;
	document.getElementById("citer").value = citer;
	render_c2();
}

function autoiterate() {
	running = 1;
	crunning = 0;
	iterate();
}

function autociterate() {
	running = 0;
	crunning = 1;
	citerate();
}

var md = 0;
var mousex = 0;
var mousey = 0;

canvas.addEventListener("mousedown", mousedown, false);
canvas2.addEventListener("mousedown", function(event) {
	event.preventDefault();
	md = 1;
	if(event.button==2) md=2;
	mousex = (event.pageX-canvas2.offsetLeft);
	mousey = (event.pageY-canvas2.offsetTop);
	console.log(mousex + " " + mousey + " " + zoom);
}, false);
canvas2.addEventListener("mouseup", function(event) {
	event.preventDefault();
	md = 0;
}, false);
canvas2.addEventListener("mousemove", function(event) {
	if(md != 0) {
		mx = (event.pageX-canvas2.offsetLeft);
		my = (event.pageY-canvas2.offsetTop);
		
		if(md == 2) {
			zoom *= Math.pow(1.01,my-mousey);
			zrot += (mx-mousex)/100;
		} else {
			xrot += (my-mousey)/100;
			yrot += (mx-mousex)/100;
		}
		mousex = mx;
		mousey = my;
		render_c2();
	}
}, false);

reset();
