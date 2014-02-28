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

var pv = [];

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

var system = 2;
var labels = [];
var defparam = [];
var p0 = [];
var pi = [];
var pj = [];

function setsystemform() {
	var sys = parseInt(document.getElementById("system").value);
	setsystem(sys);
}

function setsystem(sys) {
	system = sys;

	var initmm = [];
	var initxyz = [];
	
	switch(system) {
		case 0: // Lorenz
			labels = ["sigma", "rho", "beta"];
			defparam = [10, 28, 2.666667];
			initmm = [-10,10,-28,28,-0,50];
			initxyz = [-1, 0, 0,
					   -56, 112, 0,
					   -50, 0 , 175];
			document.getElementById("perframe").value = 10;
			document.getElementById("deltat").value = 0.001;
			break;
		case 1: // Rossler
			labels = ["a", "b", "c"];
			defparam = [0.2, 0.2, 5.7];
			initmm = [-25,25,-25,25,0,50];
			initxyz = [-24, 55, 0,
					   -29, 0, 49,
					   0, 0 , 0];
			document.getElementById("perframe").value = 10;
			document.getElementById("deltat").value = 0.01;
			break;
		case 2: // Rabinovich-Fabrikant
			labels = ["gamma", "alpha"];
			defparam = [0.1, 0.98];
			initmm = [-2,2,-2,2,0,2];
			initxyz = [-6, 12, 0,
					   -6, 0, 12,
					   1, 0 , 0];
   			document.getElementById("perframe").value = 10;
			document.getElementById("deltat").value = 0.001;
			break;
		case 3: // Chua - from http://www.chuacircuits.com/sim.php
			labels = ["c1", "c2", "c3", "m0", "m1"];
			defparam = [15.6, 1, 28, -1.143, -0.714];
			initmm = [-2,2,-2,2,-2,2];
			initxyz = [-3,6,0,
					   -1,0,2,
					   0,0,0];
   			document.getElementById("perframe").value = 10;
			document.getElementById("deltat").value = 0.002;
			break;					   
	}
	
	document.getElementById("minx").value = initmm[0];
	document.getElementById("maxx").value = initmm[1];
	document.getElementById("miny").value = initmm[2];
	document.getElementById("maxy").value = initmm[3];
	document.getElementById("minz").value = initmm[4];
	document.getElementById("maxz").value = initmm[5];
	
	document.getElementById("x0").value = initxyz[0];
	document.getElementById("xi").value = initxyz[1];
	document.getElementById("xj").value = initxyz[2];
	document.getElementById("y0").value = initxyz[3];
	document.getElementById("yi").value = initxyz[4];
	document.getElementById("yj").value = initxyz[5];
	document.getElementById("z0").value = initxyz[6];
	document.getElementById("zi").value = initxyz[7];
	document.getElementById("zj").value = initxyz[8];
	
	
	var phtml = "";
	for(var i=0;i<labels.length;i++) {
		phtml += labels[i] + " = <input type='text' id='p" + i + "0' value='" + defparam[i] + "' size='8'></input> + screen_x (0-1) * <input type='text' id='p" + i +
			"i' value='0' size='8'></input> + screen_y (0-1, bottom=0) * <input type='text' id='p" + i + "j' value='0' size='8'></input><br>\n";
	}
	document.getElementById("params").innerHTML = phtml;
	
	//sigma = <input type='text' id='sigma0' value='10' size='8'></input> + screen_x (0-1) * <input type='text' id='sigmai' value='0' size='8'></input> + screen_y (0-1, bottom=0) * <input type='text' id='sigmaj' value='0' size='8'></input><br>
	//rho = <input type="text" id="rho0" value="28" size="8"></input> + screen_x (0-1) * <input type="text" id="rhoi" value="0" size="8"></input> + screen_y (0-1, bottom=0) * <input type="text" id="rhoj" value="0" size="8"></input><br>
	//beta = <input type="text" id="beta0" value="2.666667" size="8"></input> + screen_x (0-1) * <input type="text" id="betai" value="0" size="8"></input> + screen_y (0-1, bottom=0) * <input type="text" id="betaj" value="0" size="8"></input><br>
	reset();

}

function readform() {
	canvas.width = parseFloat(document.getElementById("gwidth").value);
	canvas.height = parseFloat(document.getElementById("gheight").value);
	canvas2.height = canvas.height;
	canvas2.width = canvas.height;
	perframe = parseInt(document.getElementById("perframe").value);
	deltat = parseFloat(document.getElementById("deltat").value);

	p0 = [];
	pi = [];
	pj = [];

	pv = [];
	for(var i=0;i<labels.length;i++) {
		p0[i] = parseFloat(document.getElementById("p" + i + "0").value);	
		pi[i] = parseFloat(document.getElementById("p" + i + "i").value);	
		pj[i] = parseFloat(document.getElementById("p" + i + "j").value);	
		pv.push([]);
	}
	
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
			y = (yv[i][j] - miny)/(maxy-miny);
			z = (zv[i][j] - minz)/(maxz-minz);
			var f = 1.0;
			if(isNaN(x) || isNaN(y) || isNaN(z)) {
				x=0;
				y=0;
				z=0;			
			//} else if(x<-10 || y<-10 || z<-10 || x>10 || y>10 || z>10) {
			//	f = 0;
				//var f = (10/Math.max(x,-x,y,-y,z,-z));
			} else {
				x = Math.max(0, Math.min(1,x));
				y = Math.max(0, Math.min(1,y));
				z = Math.max(0, Math.min(1,z));			
			}
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
	pv = [];
	for(var i=0;i<labels.length;i++) {
		pv.push([]);
	}
	simtime = 0;
	frames = 0;
	citer = 0;
	xrot = 0;
	yrot = 0;
	zrot = 0;
	zoom = 10;
	xpoints = [];
	ypoints = [];
	zpoints = [];
	document.getElementById("citer").value = citer;
	for(var i=0;i<canvas.width;i++) {
		xv.push([]);
		yv.push([]);
		zv.push([]);
		for(var j=0;j<labels.length;j++) {
			pv[j].push([]);
		}
		for(var j=0;j<canvas.height;j++) {
			xv[i][j] = x0 + (xi * i/canvas.width) + (xj * j/canvas.height);
			yv[i][j] = y0 + (yi * i/canvas.width) + (yj * j/canvas.height);
			zv[i][j] = z0 + (zi * i/canvas.width) + (zj * j/canvas.height);
			for(var k=0;k<labels.length;k++) {
				pv[k][i][j] = p0[k] + (pi[k] * i/canvas.width) + (pj[k] * j/canvas.height);
			}			
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
				switch(system) {
					case 0: // Lorenz
						xv[i][j] += deltat * (pv[0][i][j]*(yy-xx));
						yv[i][j] += deltat * ((xx*(pv[1][i][j]-zz)) - yy);
						zv[i][j] += deltat * ((xx*yy) - (pv[2][i][j]*zz));
						break;
					case 1: // Rossler
						xv[i][j] += deltat * (-yy-zz);
						yv[i][j] += deltat * (xx + (pv[0][i][j] * yy));
						zv[i][j] += deltat * (pv[1][i][j] + zz*(xx-pv[2][i][j]));
						break;
					case 2: // Rabinovich-Fabrikant
						xv[i][j] += deltat * (yy*(zz-1+(xx*xx)) + pv[0][i][j]*xx);
						yv[i][j] += deltat * (xx*((3*zz)+1-(xx*xx)) + pv[0][i][j]*yy);
						zv[i][j] += deltat * (-2*zz*(pv[1][i][j]+(xx*yy)));
						break;
					case 3: // Chua
						xv[i][j] += deltat * (pv[0][i][j]*(yy-xx-((pv[4][i][j]*xx) + ((pv[3][i][j]-pv[4][i][j])*.5*(Math.abs(xx+1)-Math.abs(xx-1))))));
						yv[i][j] += deltat * (pv[1][i][j]*(xx-yy+zz));
						zv[i][j] += deltat * (-pv[2][i][j]*yy);
						break;
				}
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
	var pvv = [];
	for(var k=0;k<labels.length;k++) {	
		e.innerHTML += " " + labels[k] + " " + pv[k][i][j];	
		pvv[k] = pv[k][i][j];
	}
	calculate_points((x0 + (xi * i/canvas.width) + (xj * j/canvas.height)), (y0 + (yi * i/canvas.width) + (yj * j/canvas.height)), (z0 + (zi * i/canvas.width) + (zj * j/canvas.height)),
		pvv);
	render_c2();
}

function calculate_points(xx, yy, zz, pvv) {
	xpoints = [];
	ypoints = [];
	zpoints = [];
	var xp = 0;
	xcentre = (maxx + minx)/2;
	ycentre = (maxy + miny)/2;
	zcentre = (maxz + minz)/2;
	/*for(var i=0;i<canvas.width;i++) {
		for(var j=0;j<canvas.height;j++) {
			xp++;
			xcentre+=xv[i][j];
			ycentre+=yv[i][j];
			zcentre+=zv[i][j];		
		}
	}
	xcentre /= xp;
	ycentre /= xp;
	zcentre /= xp;	*/
	
	for(var t=0;t<frames*perframe;t++) {
		var xxt = xx;
		var yyt = yy;
		var zzt = zz;
		switch(system) {
			case 0: // Lorenz
				xx += deltat * (pvv[0]*(yyt-xxt));
				yy += deltat * ((xxt*(pvv[1]-zzt)) - yyt);
				zz += deltat * ((xxt*yyt) - (pvv[2]*zzt));
			break;
			case 1: // Rossler
				xx += deltat * (-yyt-zzt);
				yy += deltat * (xxt + (pvv[0] * yyt));
				zz += deltat * (pvv[1] + zzt*(xxt-pvv[2]));
			break;
			case 2: // Rabinovich-Fabrikant
				xx += deltat * (yyt*(zzt-1+(xxt*xxt)) + pvv[0]*xxt);
				yy += deltat * (xxt*((3*zzt)+1-(xxt*xxt)) + pvv[0]*yyt);
				zz += deltat * (-2*zzt*(pvv[1]+(xxt*yyt)));
			break;
			case 3: // Chua
				xx += deltat * (pvv[0]*(yyt-xxt-((pvv[4]*xxt) + ((pvv[3]-pvv[4])*.5*(Math.abs(xxt+1)-Math.abs(xxt-1))))));
				yy += deltat * (pvv[1]*(xxt-yyt+zzt));
				zz += deltat * (-pvv[2]*yyt);
				break;
		}

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

function reset_cam() {
	xrot = 0;
	yrot = 0;
	zrot = 0;
	zoom = 10;
	if(xpoints.length > 0) render_c2();
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

	citer=0;
	for(var i=0;i<pdex.length;i++) {
		var ii = pdex[i];
		//ctx2.strokeStyle = '#fff';
		var	x = (xpoints[ii+citer] - minx)/(maxx-minx);
		x = Math.max(0, Math.min(1,x));
		var	y = (ypoints[ii+citer] - miny)/(maxy-miny);
		y = Math.max(0, Math.min(1,y));
		var	z = (zpoints[ii+citer] - minz)/(maxz-minz);
		z = Math.max(0, Math.min(1,z));
		
		var p1 = cl[ii];
		var xp1 = (p1[0][0]*zoom)+(canvas2.width/2);
		var yp1 = (canvas2.height/2)-(p1[1][0]*zoom);
		var xp2 = xp1;
		var yp2 = yp1;
		var iii = ii;
		while(((xp2-xp1)*(xp2-xp1))+((yp2-yp1)*(yp2-yp1)) < 4) {
			iii++;
			if(iii >= cl.length) break;
			var p2 = cl[iii];
			xp2 = (p2[0][0]*zoom)+(canvas2.width/2);
			yp2 = (canvas2.height/2)-(p2[1][0]*zoom);
		}
		if(iii < cl.length) {
			ctx2.beginPath();
			ctx2.strokeStyle = "rgb(" + Math.floor(x*256) + "," + Math.floor(y*256) + "," + Math.floor(z*256) + ")";
			ctx2.moveTo(xp1,yp1);
			ctx2.lineTo(xp2,yp2);
			ctx2.stroke();		
		}
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

setsystemform();
