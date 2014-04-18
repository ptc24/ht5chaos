// Newton-Raphson Fractal dynamics pixmap
// copyright (c) 2014 Peter Corbett - see LICENSE

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

canvas.width = 1600;
canvas.height = 400;

var iters = 20;
var miny = 3.5;
var maxy = 4.0;
var minx = 0.4;
var maxx = 0.6;
var ccx = 0;
var ccy = 0;
var colmag = 0;
var shademag = 0;
var satmag = 0;
var colrot = 0;
var itertime = 100;
var record = 0;

var drawrect = 0;
var rectx = 0;
var recty = 0;

var img = 0;
var clickcc = 0;

// Degrees radians
var d2r = Math.PI / 180;
var r2d = 1 / d2r;

var previterx = [];
var previtery = [];
var nic = [];

var rlookup = [];
var blookup = [];
var glookup = [];

var interval = 0;

var roots = [];
var pn;
var dpn;

function addc(a, b) {
	return [a[0]+b[0], a[1]+b[1]];
}
function subc(a, b) {
	return [a[0]-b[0], a[1]-b[1]];
}
function multc(a, b) {
	return [(a[0]*b[0])-(a[1]*b[1]), (a[1]*b[0])+(a[0]*b[1])];
}
function divc(a, b) {
	var denom = (b[0]*b[0])+(b[1]*b[1]);
	return [((a[0]*b[0])+(a[1]*b[1]))/denom, ((a[1]*b[0])-(a[0]*b[1]))/denom];
}

// Make a polynomial
function pnom(items) {
	// (x-items0)(x-items1)(x-item2)...
	
	var coeff = [[1,0]];
	
	for(var i=0;i<items.length;i++) {
		var ncoeff = [];
		var ii = items[i];
		ii[0] = -ii[0];
		ii[1] = -ii[1];
		for(var j=0;j<coeff.length;j++) {
			ncoeff.push(multc(coeff[j],ii));
		}
		ncoeff.push([0,0]);
		for(var j=1;j<ncoeff.length;j++) {
			ncoeff[j] = addc(ncoeff[j],coeff[j-1]);
		}
		coeff = ncoeff;
	}
	return coeff;
}

// Differentiate a polynomial
function diffp(pn) {
	var npn = [];
	for(var i=1;i<pn.length;i++) {
		npn.push(multc(pn[i],[i,0]));
	}
	return npn;
}

// Apply a polynomial
function applyp(c, pn) {
	var out = [0,0];
	var ctn = c; // x to the n;
	for(var i=0;i<pn.length;i++) {
		if(i==0) {
			out = pn[i];
		} else {
			out = addc(out, multc(ctn, pn[i]));		
			ctn = multc(c, ctn);
		}		
	}
	return out;
}

// Complex to string
function ctostr(c) {
	if(c[1] > 0) {
		return c[0] + "+" + c[1] + "i";	
	} else if(c[1] == 0) {
		return c[0];
	} else {
		return c[0] + "-" + (-c[1]) + "i";
	}
}

// Newton-Raphson step - complex number, polynomial, differential of polynomial
function newtonstep(c, pn, dpn) {
	return subc(c, divc(applyp(c, pn),applyp(c, dpn)));
}



for(var i=0;i<=3600;i++) {
	var rgb = tinycolor({h:i/10.0,s:1,v:1}).toRgb();
	rlookup.push(rgb.r);
	glookup.push(rgb.g);
	blookup.push(rgb.b);
}

function readform() {
	canvas.width = parseFloat(document.getElementById("gwidth").value);
	canvas.height = parseFloat(document.getElementById("gheight").value);
	iters = parseInt(document.getElementById("iterations").value);
	miny = parseFloat(document.getElementById("miny").value);
	maxy = parseFloat(document.getElementById("maxy").value);
	minx = parseFloat(document.getElementById("minx").value);
	maxx = parseFloat(document.getElementById("maxx").value);
	roots = eval(document.getElementById("roots").value);
	readuncontroversial();
	pn = pnom(roots);
	dpn = diffp(pn);
}

function readuncontroversial() {
	ccx = parseFloat(document.getElementById("ccx").value);
	ccy = parseFloat(document.getElementById("ccy").value);
	clickcc = document.getElementById("clickcc").checked ? 1 : 0;
	colmag = document.getElementById("colmag").checked ? 1 : 0;
	shademag = document.getElementById("shademag").checked ? 1 : 0;
	satmag = document.getElementById("satmag").checked ? 1 : 0;
	colrot = parseFloat(document.getElementById("colrot").value);
	itertime = parseFloat(document.getElementById("itertime").value);
	if(document.getElementById("record") == null) {
		record = 0;
	} else {
		record = document.getElementById("record").checked ? 1 : 0;
	}
}

function update(mod) {
	iters++;
}

function mousedown(event) {
	stop();
	var cx = (event.pageX-canvas.offsetLeft);
	var cy = (event.pageY-canvas.offsetTop);

	var x = minx + ((maxx-minx) * cx / canvas.width);
	var y = miny + ((maxy - miny) * cy / canvas.height);
	clickcc = document.getElementById("clickcc").checked ? 1 : 0;

	if(clickcc == 1) {
		ccx = x;
		ccy = y;
		document.getElementById("ccx").value = ccx;
		document.getElementById("ccy").value = ccy;
		render(0);
	} else {
		drawrect = 1;
		rectx = cx;
		recty = cy;	
	}
}

function mousemove(event) {
	if(drawrect == 1) {
		var cx = (event.pageX-canvas.offsetLeft);
		var cy = (event.pageY-canvas.offsetTop);
		if((cx-rectx) * (cy-recty) > 0) {
			cy = recty + (cx-rectx) * (canvas.height / canvas.width);
		} else {
			cy = recty - (cx-rectx) * (canvas.height / canvas.width);
		}
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
		if((cx-rectx) * (cy-recty) > 0) {
			cy = recty + (cx-rectx) * (canvas.height / canvas.width);
		} else {
			cy = recty - (cx-rectx) * (canvas.height / canvas.width);
		}
		var xa = minx + ((maxx-minx) * rectx / canvas.width);
		var xb = minx + ((maxx-minx) * cx / canvas.width);
		var ya = miny + ((maxy-miny) * recty / canvas.height);
		var yb = miny + ((maxy-miny) * cy / canvas.height);
		if(xa > xb) {
			var tmp = xa;
			xa = xb;
			xb = tmp;
		}
		if(ya > yb) {
			var tmp = ya;
			ya = yb;
			yb = tmp;
		}
		minx = xa;
		maxx = xb;
		miny = ya;
		maxy = yb;
		render(0);
		ctx.putImageData(img, 0, 0);
	
	}
}

function render(withprev) {
	img = ctx.getImageData(0, 0, canvas.width, canvas.height);
	var data = img.data;
	var time = Date.now();
	if(previterx.length == 0 || withprev == 0) {
		withprev = 0;
		nic = [];
		for(var i=0;i<canvas.width;i++) {	
			previterx[i] = [];
			previtery[i] = [];
			nic[i] = [];
			for(var j=0;j<canvas.height;j++) nic[i][j] = -1;
		}
	}
	var nm = iters;
	for(var i=0;i<canvas.width;i++) {
		for(var j=0;j<canvas.height;j++) {
			var y = miny + ((maxy - miny) * j / canvas.height);
			var x = minx + ((maxx - minx) * i / canvas.width);
			var xx = x;
			var yy = y;
			var xxt = 0;
			var isn = 0;
			var mag = 0;

			if(withprev == 0) {
				for(var iter=0;iter<iters;iter++) {
					nic[i][j] = -1;
					var ct = newtonstep([xx,yy], pn, dpn);
					xx = ct[0];
					yy = ct[1];
					//xxt = xx*xx - yy*yy + x;
					//yy = 2*xx*yy + y;
					//xx = xxt;
					mag = Math.sqrt((xx*xx)+(yy*yy))*2;
					if(mag > 1e10) {
						isn = 1;
						nic[i][j] = iter + 1 - Math.log(Math.log(mag)/Math.log(1e10))/Math.log(2);
						break;
					}
				}			
			} else if(nic[i][j] < 0) {
				xx = previterx[i][j];
				yy = previtery[i][j];
				var ct = newtonstep([xx,yy], pn, dpn);
				xx = ct[0];
				yy = ct[1];
				mag = Math.sqrt((xx*xx)+(yy*yy))*2;
				if(mag > 1e10) {
					isn = 1;
					nic[i][j] = iters - Math.log(Math.log(mag)/Math.log(1e10))/Math.log(2);
					xx = previterx[i][j];
					yy = previtery[i][j];
				}
			} 
			if(nic[i][j] != -1) nm = Math.min(nm, nic[i][j]);
			previterx[i][j] = xx;
			previtery[i][j] = yy;
		}
	}
	for(var i=0;i<canvas.width;i++) {
		for(var j=0;j<canvas.height;j++) {
			xx = previterx[i][j];
			yy = previtery[i][j];
			//if(i%10 == 0 && j%10 == 0) console.log(i + " " + j + " " + xx + " " + yy);
			var isn = nic[i][j] != -1 ? 1 : 0;
			var mag = Math.sqrt(((xx-ccx)*(xx-ccx))+((yy-ccy)*(yy-ccy)));
			var arg = r2d * Math.atan2((xx-ccx),(yy-ccy));
			if(arg < 0) arg += 360;
			var fade = 0;
			var val = 1;
			if(mag > 1) {
				fade = 1-Math.pow(.5, Math.log((1+mag)/2));
				if(colmag == 1) arg = 270;
			} else {
				if(colmag == 1) arg = 270 * mag;
				val = mag;
			}
			arg += colrot;
			while(arg < 0) arg += 360;
			while(arg > 360) arg -= 360;
			var sat = 1 - fade;

			var marg = Math.round(arg*10);
			if(satmag == 1 && mag < 1) sat *= mag; 
			var add = (1-sat)*255;
			if(shademag == 1 && mag < 1) sat *= mag; 
			var r = Math.round((rlookup[marg] * sat) + add);
			var g = Math.round((glookup[marg] * sat) + add);
			var b = Math.round((blookup[marg] * sat) + add);
			if(isn == 1) {				
				var val = ((nic[i][j]-nm)/(iters-nm))*255;
				r = val;
				g = val;
				b = val;
			}
			var idx = ((j) * canvas.width + i) * 4;
			data[idx] = Math.round(r);
			data[idx+1] = Math.round(g);
			data[idx+2] = Math.round(b);
			data[idx+3] = 255;
		}
	}
	ctx.putImageData(img, 0, 0);
	var e = document.getElementById("status");
	e.innerHTML = "x=" + minx + " to " + maxx + " y=" + miny + " to " + maxy + " time " + (Date.now()-time); 
	if(record == 1) record_image();
}


function record_image() {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("POST","record_image",true);
	xmlhttp.send(canvas.toDataURL());
}

function reset() {
	stop();
	previterx = [];
	previtery = [];
	readform();
	render(0);
}

function reset_k() {
	stop();
	previterx = [];
	previtery = [];
	var tmnx = minx;
	var tmxx = maxx;
	var tmny = miny;
	var tmxy = maxy;
	readform();
	minx = tmnx;
	maxx = tmxx;
	miny = tmny;
	maxy = tmxy;
	render(0);
}

function iterate() {
	readuncontroversial();
	var ii = parseInt(document.getElementById("iterations").value);
	if(ii != iters) {
		previterx = [];
		previtery = [];
	}
	iters = parseInt(document.getElementById("iterations").value);
	iters++;
	document.getElementById("iterations").value = iters;
	render(1);
}

canvas.addEventListener("mousedown", mousedown, false);
canvas.addEventListener("mousemove", mousemove, false);
canvas.addEventListener("mouseup", mouseup, false);
canvas.addEventListener("mouseout", mouseout, false);

reset();

function autoiterate() {
	readuncontroversial();
	clearInterval(interval);
	interval = setInterval(iterate, itertime);
}

function stop() {
	clearInterval(interval);
}

function run() {
	update((Date.now() - time) / 1000);
	render();
	time = Date.now();
}

//var time = Date.now();
//setInterval(run, 1000);
