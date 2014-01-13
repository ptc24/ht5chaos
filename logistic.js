// Logistic Map Graph
// copyright (c) 2014 Peter Corbett - see LICENSE

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

canvas.width = 1600;
canvas.height = 600;

var rendered = 0;
var started = 0;
var maxparam = 100;
var alpha = 0.2;
var iters = 100;
var inititers = 0;
var rainbow = 0;
var initr = 3.59;
var initvalinc = 0.0001;
var linewidth = 1;

var background = '#fff';
var backrect = '#000';
var linecol = '#000';

function readform() {
	canvas.width = parseFloat(document.getElementById("gwidth").value);
	canvas.height = parseFloat(document.getElementById("gheight").value);
	background = document.getElementById("background").value;
	backrect = document.getElementById("backrect").value;
	iters = parseInt(document.getElementById("iterations").value);
	inititers = parseInt(document.getElementById("inititers").value);
	maxparam = parseInt(document.getElementById("variations").value);
	rainbow = document.getElementById("rainbow").checked ? 1 : 0;
	linecol = document.getElementById("linecol").value;
	alpha = parseFloat(document.getElementById("alpha").value);
	initr = parseFloat(document.getElementById("r").value);
	initval = parseFloat(document.getElementById("initval").value);
	initvalinc = parseFloat(document.getElementById("initvalinc").value);
	rinc = parseFloat(document.getElementById("rinc").value);
	linewidth = parseInt(document.getElementById("linewidth").value);
}

function render() {
	ctx.fillStyle = background;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.lineStyle = backrect;
	ctx.lineWidth = 1;
	ctx.rect(0,0,canvas.width,canvas.height);
	ctx.stroke();
	
	ctx.lineWidth = linewidth;
	for(var param=0;param<maxparam;param++) {
		//var val = 0.6;
		var val = initval + (param*initvalinc);
		var r = initr + (param*rinc);
		for(var ii=0;ii<inititers;ii++) val = r * val * (1-val);
		//var r = 4 * param / 100.0;
		for(var t=0;t<=iters;t++) {
			var x = t * canvas.width / iters;
			if(t > 0) {
				val = r * val * (1-val);
			}
			y = (1-val) * canvas.height;
			if(t == 0) {
				ctx.beginPath();
				ctx.moveTo(x, y);
				
				if(rainbow == 1) {
					var rgb = tinycolor({h:param*360/maxparam,s:100,v:100}).toRgb();
					ctx.strokeStyle = "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + "," + alpha + ")";
				} else {
					ctx.strokeStyle = linecol;
				}
			} else {
				ctx.lineTo(x,y);
			}
		}
		ctx.stroke();		
	}
}

function reset() {
	readform();
	render();
}

reset();