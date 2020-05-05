/**
Multicircular view
*/


inlets = 1;
outlets = 2;

border = 0;

var gdebug = 0;
var bgcolor = [0, 0, 0, 0];
var stepcolor0 = [80/255, 85/255, 105/255, 1];
var stepcolor1 = [186/255, 190/255, 193/255, 1];

var activecolor0 = [241/255, 173/255, 45/255, 1];
var activecolor1 = [241/255, 173/255, 45/255, 1];
var activecolor2 = [241/255, 173/255, 45/255, 1];
var activecolor3 = [241/255, 173/255, 45/255, 1];

var circbgcolor = [45/255, 45/255, 65/255, 1];
var npadding = 0.01;
var thickness = 1;
var innerarea = 0.83; // 0.9
var roundcorners = 0;
var drawstepmode = 0;
var spacing = 1.51; // 1.0
var offthicknessmul = 1.0; // thickness multiplier when the node is off.

declareattribute("bgcolor");
declareattribute("gdebug");
declareattribute("circbgcolor");
declareattribute("npadding");
declareattribute("thickness");
declareattribute("spacing");
declareattribute("roundcorners");
declareattribute("innerarea");


//================================================================//
// P5 like graphics class
//================================================================//

function P5Color (r, g, b, a) {
	this.r = r;
	this.g = g;
	this.b = b;
	this.a = (a === undefined ? 1.0 : a);
}

P5Color.prototype.darker = function (amount) {
	amount = amount || 0.1;
	amount = 1 - amount;
	return new P5Color (this.r * amount, this.g * amount, this.b * amount, this.a);
}

P5Color.prototype.brighter = function (amount) {
	amount = amount || 0.1;
	amount = 1 + amount;
	return new P5Color (this.r * amount, this.g * amount, this.b * amount, this.a);
}

//================================================================//

function P5 (g, box) 
{
	this.mgraphics = g;
	this.box = box;

	this.CENTERED = 'centered';
	this.DEFAULT = 'default';

	this.width = 0;
	this.height = 0;

	this.textMode_ = this.CENTERED;
}

// convert 8 bit color value to rgb32
P5.prototype.c8 = function (c) {
	return c / 255.;
}

P5.prototype.color = function (r, g, b, a) {
	if (r !== undefined 
		&& g === undefined 
		&& b === undefined 
		&& a === undefined)
	{
		return new P5Color(r, r, r, 1.0);
	}
	else 
	{
		return new P5Color(r, g, b, a);
	}
}

P5.prototype.color8 = function(r, g, b, a) {
	return this.color(this.c8(r), this.c8(g), this.c8(b), this.c8(a));
}

P5.prototype.init = function () 
{
	mgraphics.init();
	mgraphics.autofill = 0;
	mgraphics.relative_coords = 0;

	this.fillColor = new P5Color(0, 0, 0, 1);
	this.strokeColor = new P5Color(0, 0, 0, 1);
	this.lineWidth = 1.0;

	this.mstack = [];
}

P5.prototype.fill_color = function () 
{
	mgraphics.set_source_rgba(
		this.fillColor.r, 
		this.fillColor.g, 
		this.fillColor.b, 
		this.fillColor.a
		);
}

P5.prototype.stroke_color = function () 
{
	//mgraphics.set_line_width (this.lineWidth);
	mgraphics.set_source_rgba(
		this.strokeColor.r, 
		this.strokeColor.g, 
		this.strokeColor.b, 
		this.strokeColor.a
		);
}

P5.prototype.strokeWeight = function (v) {
	mgraphics.set_line_width (v);
}

P5.prototype.render_ = function () 
{
	if (this.fillColor !== undefined)
	{
		this.fill_color();
		if (this.strokeColor !== undefined)
		{
			mgraphics.fill_preserve();
			this.stroke_color();
			mgraphics.stroke();
		}
		else 
		{
			mgraphics.fill();
		}
	}
	else if (this.strokeColor !== undefined) 
	{
		this.stroke_color();
		mgraphics.stroke();
	}
}

P5.prototype.line = function (x, y, x1, y1) 
{
	mgraphics.move_to(x, y);
	mgraphics.line_to(x1, y1);
	this.render_();
}

P5.prototype.circle = function (x, y, radius) 
{
	mgraphics.arc(x, y, radius, 0, Math.PI*2);
	this.render_();
}

P5.prototype.arc = function (x, y, radius, startAngle, endAngle)
{
	mgraphics.arc(x, y, radius, startAngle, endAngle);
	this.render_();	
}

P5.prototype.rect = function (x, y, w, h, rr) 
{
	if (rr !== undefined)
	{
		mgraphics.rectangle_rounded(x, y, w, h, rr, rr);
	}
	else 
	{
		mgraphics.rectangle(x, y, w, h);
	}
	this.render_();
}

P5.prototype.map = function (x, imin, imax, omin, omax) 
{
	return ((x - imin) * (imax - imin) / (omax - omin)) + omin;
}

P5.prototype.background = function(col) 
{
	mgraphics.set_source_rgba(col.r, col.g, col.b, col.a);
	mgraphics.rectangle(0, 0, this.width, this.height);
	mgraphics.fill();
}

P5.prototype.translate=function(tx, ty) 
{
	mgraphics.translate(tx, ty);
}

P5.prototype.rotate=function(a) 
{
	mgraphics.rotate(a);
}

P5.prototype.noStroke=function() 
{
	this.strokeColor = undefined;
}

P5.prototype.stroke=function(col) 
{
	if (Array.isArray(col)) {
		this.strokeColor = {r: col[0], g: col[1], b: col[2], c: (col[3] === undefined) ? 1. : col[3]};
	}
	else {
		this.strokeColor = col;
	}
}

P5.prototype.fill=function(col) 
{
	this.fillColor = col;
}

P5.prototype.noFill=function() 
{
	this.fillColor = undefined;
}

P5.prototype.update = function () {
	var nw = this.box.rect[2] - this.box.rect[0];
	var nh = this.box.rect[3] - this.box.rect[1];
	if (nw != this.width || nh != this.height) {
		this.width = nw;
		this.height = nh;
		return true;
	}
	return false;
}

// TODO
P5.prototype.push = function () {mgraphics.save();}
P5.prototype.pop = function () {mgraphics.restore();}

P5.prototype.textSize = function (fontsize) 
{
	mgraphics.set_font_size(fontsize);
}

P5.prototype.textFace = function (face)
{
	mgraphics.select_font_face(face, "normal", "normal");
}

// P5.prototype.getTextSize = function (txt)
// {
// 	var mm = mgraphics.text_measure(txt);
// 	return {width: mm[0], height: mm[1]};
// }

P5.prototype.textMode = function (defaultOrCentered)
{
	this.textMode_ = defaultOrCentered;
}

P5.prototype.redraw = function (defaultOrCentered)
{
	mgraphics.redraw();
}

P5.prototype.text = function (txt, x, y)
{
	if (this.fillColor != null)
		this.fill_color();
	else if (this.strokeColor != null)
		this.stroke_color();

	if (this.textMode_ === this.CENTERED)
	{
		var mm = mgraphics.text_measure(txt);
		mgraphics.move_to(x - (mm[0]/2), y + (mm[1]/4));
	}
	else
	{
		mgraphics.move_to(x, y);
	}
	mgraphics.show_text(txt.toString());
}

//================================================================//
// Object code
//================================================================//

function hsbaToRGBA (hsba) {
	/* We will split hue into 6 sectors. */
	var hue = hsba[0] * 6; 
	var sat = hsba[1];
	var val = hsba[2];

	var RGBA = [];

	if (sat === 0) {
		RGBA = [val, val, val, hsba[3]]; /* Return early if grayscale. */
	} else {
		var sector = Math.floor(hue);
		var tint1 = val * (1 - sat);
		var tint2 = val * (1 - sat * (hue - sector));
		var tint3 = val * (1 - sat * (1 + sector - hue));
		var red, green, blue;
		if (sector === 1) {
			/* Yellow to green. */
			red = tint2;
			green = val;
			blue = tint1;
		} else if (sector === 2) {
			/* Green to cyan. */
			red = tint1;
			green = val;
			blue = tint3;
		} else if (sector === 3) {
			/* Cyan to blue. */
			red = tint1;
			green = tint2;
			blue = val;
		} else if (sector === 4) {
			/* Blue to magenta. */
			red = tint3;
			green = tint1;
			blue = val;
		} else if (sector === 5) {
			/* Magenta to red. */
			red = val;
			green = tint1;
			blue = tint2;
		} else {
			/* Red to yellow (sector could be 0 or 6). */
			red = val;
			green = tint3;
			blue = tint1;
		}
		RGBA = [red, green, blue, hsba[3]];
	}
	return RGBA;
}

function copyColor(src)
{
	return [src[0], src[1], src[2], src[3]];
}

function CircObject (numSteps, numPulses, spread)
{
	numSteps = numSteps === undefined ? 16 : numSteps;
	numPulses = numPulses === undefined ? 4 : numPulses;
	spread = spread === undefined ? false : spread > 0;

	this.activations = this.createFrom(numSteps, numPulses, spread);
	this.radius = 1;
	this.changed = 1;
	this.stepheight = 6;
	this.stepIndex = 0;
	this.active = true;
	this.offcolor = copyColor(stepcolor0);
	this.oncolor = copyColor(stepcolor1);
	this.activecolor = copyColor(activecolor0);
	this.drawstepmode = drawstepmode;
	this.offthicknessmul = offthicknessmul; // divide thickness for off nodes
}

CircObject.prototype.createFrom = function (steps, pulses, spread)
{
	steps = Math.max(1, steps);
	var narray = new Array(steps);

	if (pulses > 0 && spread == true)
	{
		var i;
		for ( i = 0; i < steps; ++i)
			narray[i] = 0;

		const div = steps / pulses;

		for (var i = 0; i < pulses; ++i) 
			narray[ Math.round(i * div) ] = 1;
	}
	else 
	{
		for (var i = 0; i < steps; ++i)
			narray[i] = i < pulses ? 1 : 0;
	}
	post(narray, '\n');
	return narray;
}

CircObject.prototype.createPoint = function(angle, radius) 
{
	return {
		x: Math.cos(angle) * radius,
		y: Math.sin(angle) * radius,
		a: angle
	};
}

CircObject.prototype.rebuild = function ()
{
	if (this.changed == 1)
	{
		post("rebuild object\n");
		const HalfPi = Math.PI * 0.5;
		const TwoPi = Math.PI * 2;
		const sides = this.activations.length;
		this.vertices = [];

		for (var i = 0; i < sides; ++i)
		{	
			const angle = i * (TwoPi / sides) - HalfPi;
			this.vertices.push(this.createPoint(angle, this.radius));
		}

		this.changed = 0;
	}
}

CircObject.prototype.isPulse = function (idx)
{
	return this.activations[idx] != 0;
}

CircObject.prototype.modulofix = function (x, m) {
  return (x % m + m) % m;
}

CircObject.prototype.isActiveStep = function (idx) {
	return idx == this.stepIndex;
}

CircObject.prototype.setStepIndex = function (idx) {
	this.stepIndex = this.modulofix(idx, this.activations.length);
}

CircObject.prototype.draw = function ()
{
	this.rebuild();

	const rad = this.radius;
	const proportionOfSegment = 0.98;
	const sa = (Math.PI * proportionOfSegment / this.vertices.length);
	const rectwon2 = (Math.sin(sa) * this.radius * 0.8);
	const roundCornerSize = roundcorners ? rectwon2 * 0.6 : 0;
	const circleWidth = rad;
	const thisdrawmode = this.drawstepmode;

	const arcsizefactor = roundcorners ? (this.vertices.length > 16 ? 1.8 : 1.1) : 1.8;
	mgraphics.set_line_cap (roundcorners ? "round":"butt");
	const arcsize = ((Math.PI * arcsizefactor) / this.vertices.length);
	const arcstart = (Math.PI - arcsize) / 2;
	const arcend   = arcstart + arcsize;
	const arcwidth = this.stepheight;


	const isActive = this.active;
	const fade = isActive ? 1.1 : 0.7;

	const col1 = p5.color(
		this.offcolor[0] * fade, this.offcolor[1] * fade, 
		this.offcolor[2] * fade, this.offcolor[3]
		);

	const col2 = p5.color(
		this.oncolor[0] * fade, this.oncolor[1] * fade, 
		this.oncolor[2] * fade, this.oncolor[3]
		);

	const colA = p5.color(
		this.activecolor[0] * fade, this.activecolor[1] * fade, 
		this.activecolor[2] * fade, this.activecolor[3]
		);

	var This = this;

	if (thisdrawmode == 1)
	{
		arcwidth *= 0.9;
		p5.strokeWeight (1);
		p5.stroke(col1);
		p5.noFill();
		p5.circle (0, 0, rad);
	}

	this.vertices.forEach (
		function (x, i) {

			const isActiveStep = This.isActiveStep(i);
			const ispulse = This.isPulse(i);

			const narcw = arcwidth * (isActiveStep ? 1.1 : 1)
				* (ispulse ? 1. : This.offthicknessmul);

			with (p5) 
			{
				push();
				rotate(x.a - (Math.PI*0.5));

				// circle mode
				if (thisdrawmode == 1)
				{
					translate(0, rad);
					strokeWeight((isActiveStep ? 1.5 : 1.));
					stroke(isActiveStep ? colA : col2);

					if (isActiveStep) {
						fill((ispulse ? colA : col1));
					}
					else {
						fill((ispulse ? col2 : col1));
					}
					
					circle(0, 0, narcw);
				}
				else 
				// default: rectangular mode
				{
					strokeWeight(narcw);
					noFill();

					if (isActiveStep) {
						stroke((ispulse ? colA : colA.darker(0.4)));
					}
					else {
						stroke((ispulse ? col2 : col1));
					}
					
					arc(0, 0, rad, arcstart, arcend);
				}

				pop();
			}
		}
	);
}



//================================================================//
// Main code
//================================================================//

var CircObjectsContainer = [];
var p5 = new P5(mgraphics, this.box);

p5.init();

if (CircObjectsContainer.length < 1) {
	add(16, 4, true);
}

function list()
{
	var a = arrayfromargs(arguments);
	if (a.length > 0) 
	{
		post(a[0], '\n');
	}
	mgraphics.redraw();
}

function map (x, min, max, omin, omax)
{
	return (x - min) / (min - max) * (omax - omin) + omin;
}

function clear() {
	CircObjectsContainer = [];
	mgraphics.redraw();
}

function setsteps(numSteps, sequence)
{

}

function setpulses(numPulses, sequence)
{
	
}

function setoffthicknessmul(number, idx)
{
	if (idx === undefined) 
	{
		offthicknessmul = number;
		CircObjectsContainer.forEach(function(x) {x.offthicknessmul = number;});
	}
	else 
	{
		var current = prGetSequence(idx);
		current.offthicknessmul = number;
	}
	mgraphics.redraw();	
}

function setindex(idx, sequence)
{
	var current = prGetSequence(sequence);
	current.setStepIndex(idx);
	mgraphics.redraw();	
}

function setdrawmode(mode, idx) {
	if (idx === undefined) 
	{
		drawstepmode = mode;
		CircObjectsContainer.forEach(function(x) {x.drawstepmode = drawstepmode;});
	}
	else 
	{
		var current = prGetSequence(idx);
		current.drawstepmode = mode;
	}
	mgraphics.redraw();	
}

function prGetSequence(sequence)
{
	sequence = (sequence === undefined) ? 0 : Math.min (Math.max(0, sequence), CircObjectsContainer.length-1);
	return CircObjectsContainer [sequence];
}

prGetSequence.local = 1;

function getstepindex(sequence)
{
	var current = prGetSequence(sequence);
	outlet(0, "stepindex", current.stepIndex);
}

function setactive(sequence, yorn, deactivateAll)
{
	yorn = yorn === undefined ? 1 : yorn;
	if (yorn == 1 && deactivateAll > 0)
	{
		CircObjectsContainer.forEach(function (x, i){
			x.active = (i == sequence);
		});
	}
	else 
	{
		var current = prGetSequence(sequence);
		current.active = yorn;
	}
	
	mgraphics.redraw();	
}

function setactivecolor(sequence, r, g, b, a)
{
	var current = prGetSequence(sequence);
	current.activecolor[0] = r;
	current.activecolor[1] = g;
	current.activecolor[2] = b;
	current.activecolor[3] = (a === undefined ? 1 : a);
	mgraphics.redraw();
}

function add(numSteps, numPulses, spread) 
{
	const numContainers = CircObjectsContainer.length;
	if (numContainers < 4) 
	{
		var nobj = new CircObject(numSteps, numPulses, spread);
		//nobj.active = (numContainers == 0);
		CircObjectsContainer.push(nobj);
	}
	mgraphics.redraw();
}

function pop() 
{
	if (CircObjectsContainer.length > 0) 
	{
		CircObjectsContainer.pop();
	}
	mgraphics.redraw();
}

function onclick(x,y) 
{
	post("mouse", x, y);
	mgraphics.redraw();
}

function paint() 
{
	const RadiusDivider = 8;

	const backgroundColor = p5.color(bgcolor[0], bgcolor[1], bgcolor[2], bgcolor[3]);
	const circlecolor = p5.color(circbgcolor[0], circbgcolor[1], circbgcolor[2], circbgcolor[3]);

	// global code
	p5.update();
	p5.background(backgroundColor);
	p5.translate(p5.width / 2, p5.height / 2);

	const padding = npadding;
	const minSize = Math.min(p5.width, p5.height);
	const radius = (minSize / 2) - (minSize * padding);

	p5.noStroke();
	p5.fill (circlecolor);
	p5.circle(0, 0, radius);

	// object code

	var maxsize = CircObjectsContainer.length;
	var cradius = radius * innerarea;

	const radonsize = (radius / RadiusDivider) * spacing;

	for (var i = 0; i < maxsize; ++i)
	{
		var o = CircObjectsContainer[i];
		o.radius = cradius;
		o.stepheight = Math.min (radius * 0.05 * thickness, radonsize);
		o.draw ();
		cradius -= radonsize;
	};
}

function bang() 
{
	p5.redraw();
}

