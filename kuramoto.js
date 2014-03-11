// Kuramoto model
// copyright (c) 2014 Peter Corbett - see LICENSE

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

canvas.width = 1600;
canvas.height = 400;

var img = 0;
var record = 0;

var perframe = 1;
var deltat = 0.001;

var running = 0;
var simtime = 0;
var frames = 0;

var citer = 0;

var thetas = [];
var nthetas = [];
var omegas = [];
var ks = [];
var noises = [];

var tstr = "";
var nstr = "";
var ostr = "";
var kstr = "";

var k = 1.0;
var omega = 1.0;

// Degrees radians
var d2r = Math.PI / 180;
var r2d = 1 / d2r;

var rlookup = [];
var blookup = [];
var glookup = [];

for(var i=0;i<=3600;i++) {
	var rgb = tinycolor({h:i/10.0,s:1,v:1}).toRgb();
	rlookup.push(rgb.r);
	glookup.push(rgb.g);
	blookup.push(rgb.b);
}

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
	perframe = parseInt(document.getElementById("perframe").value);
	deltat = parseFloat(document.getElementById("deltat").value);

	tstr = document.getElementById("tstr").value
	ostr = document.getElementById("ostr").value
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
		for(var j=0;j<canvas.height;j++) {
			var idx = ((canvas.height-j-1) * canvas.width + i) * 4;
			
			var nt = thetas[i][j] * r2d;
			while(nt < 0) nt += 360;
			while(nt > 360) nt -= 360;
			var r = rlookup[Math.round(10*nt)];
			var g = glookup[Math.round(10*nt)];
			var b = blookup[Math.round(10*nt)];
			
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
	simtime = 0;
	frames = 0;
	
	thetas = [];
	nthetas = [];
	omegas = [];
	ks = [];
	noises = [];
	
	for(var i=0;i<canvas.width;i++) {
		thetas.push([]);
		nthetas.push([]);
		omegas.push([]);
		ks.push([]);
		noises.push([]);
		for(var j=0;j<canvas.height;j++) {
			var x = i*1.0/canvas.width;
			var y = j*1.0/canvas.height;
			nthetas[i].push(0);
			noises[i].push(eval(nstr));
			ks[i].push(eval(kstr));
			thetas[i].push(eval(tstr));
			omegas[i].push(eval(ostr));
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
				var pdiff = 0;
				var n = 0;
				var theta = thetas[i][j];
				if(true) {
					if(i>0) {
						pdiff += Math.sin(thetas[i-1][j] - theta);
						n++;
					}
					if(j>0) {
						pdiff += Math.sin(thetas[i][j-1] - theta);
						n++;
					}
					if(i<canvas.width-1) {
						pdiff += Math.sin(thetas[i+1][j] - theta);
						n++;
					}
					if(j<canvas.height-1) {
						pdiff += Math.sin(thetas[i][j+1] - theta);
						n++;
					}
				} else {
					// 8-adjacent code, just slows things down to no good effect,
					// but I though I'd keep it there in case I or anyone else wants
					// to experiment.
					for(var ii=-1;ii<2;ii++) {
						if(i+ii<0 || i+ii >= canvas.width) continue;
						for(var jj=-1;jj<2;jj++) {
							if(j+jj<0 || j+jj >= canvas.height) continue;
							if(ii==0 && jj==0) continue;
							pdiff += Math.sin(thetas[i+ii][j+jj] - theta);
							n++;
						}
					}
				}
				var noise = Math.random()-0.5;
				noise *= noises[i][j];
				nthetas[i][j] = thetas[i][j] + deltat * (omegas[i][j] + (ks[i][j] * pdiff / n) + noise);
			}
		}
		
		for(var i=0;i<canvas.width;i++) {
			for(var j=0;j<canvas.height;j++) {
				thetas[i][j] = nthetas[i][j];
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
	var e = document.getElementById("status");
	e.innerHTML = "";
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
