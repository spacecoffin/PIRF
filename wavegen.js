/*
 *  wavegen.js
 *  writes desired waveform into given buffer
 */

 //outlets = 3

// Process arguments
if (jsarguments.length>1) {
	buffer_name = jsarguments[1];
} else {
	post("Must give buffer as argument\n");
}

var buf = new Buffer(buffer_name);

/*
 *  FILL waveforms
 */

function sin()
{
	if (arguments.length==1) {
		buf.send("fill", "sin", arguments[0]);
	} else if (arguments.length>1) {
		buf.send("fill", "sin", arguments[0], arguments[1]);
	}
}


function cos()
{
	if (arguments.length==1) {
		buf.send("fill", "cos", arguments[0]);
	} else if (arguments.length>1) {
		buf.send("fill", "cos", arguments[0], arguments[1]);
	}
}


function sinc()
{
	buf.send("fill", "sinc", arguments[0], arguments[1]);
}


/*
 *  EXPR waveforms
 */

function saw()
{
	// 1st argument: direction
	// 2nd argument: span
	// 3rd argument: frequency
	// e.g. "ramp up half 1"

	var samples = new Array;
	var framecount = buf.framecount();
	
	var direction = "up";
	var span = "full";
	var freq = 1.0;
	var offset_pct = 0.0;

	if (arguments.length>0) {
		direction = arguments[0];
	}
	if (arguments.length>1) {
		span = arguments[1];
	}
	if (arguments.length>2) {
		freq = arguments[2];
	}
	if (arguments.length>3) {
		offset_pct = arguments[3];
	}

	var period = framecount/freq;
	var offset = Math.floor(period*offset_pct);
	var scaling_multiplier = 1.0;
	var scaling_summand = 0.0;

	switch (direction) {
		case "up":
			scaling_multiplier = 1.0;
			scaling_summand = 0.0;
			break;
		case "down":
			scaling_multiplier = -1.0;
			scaling_summand = 1.0;
			break;
		default:
			post("Direction argument must be either 'up' or 'down'.");
			return;
	}

	for (var i=0; i<framecount; i++) {
		samples[i] = (((i+offset)%period)/(period-1))*scaling_multiplier+scaling_summand;
	}
	buf.poke(1, 0, samples);

	switch (span) {
		case "full":
			buf.send("apply", "gain", "2.");
			buf.send("apply", "offset", "-1.");
			break;
		case "half":
			break;
		default:
			post("Span argument must be either 'full' or 'half'.");
			return;
	}
}


function tri()
{
	// 1st argument: direction
	// 2nd argument: span
	// 3rd argument: frequency
	// e.g. "ramp up half 1"

	var samples = new Array;
	var framecount = buf.framecount();
	
	var direction = "up";
	var span = "full";
	var freq = 1.0;

	if (arguments.length>0) {
		direction = arguments[0];
	}
	if (arguments.length>1) {
		span = arguments[1];
	}
	if (arguments.length>2) {
		freq = arguments[2];
	}

	var period = framecount/freq;
	var flip = 1.0;

	switch (direction) {
		case "up":
			flip = -1.0;
			break;
		case "down":
			break;
		default:
			post("Direction argument must be either 'up' or 'down'.");
			return;
	}

	for (var i=0; i<framecount; i++) {
		amp_scalar = flip*(4.0/period)
		abs_term = Math.abs((i%period)-(period/2.0))
		samples[i] = amp_scalar*(abs_term-(period/4.0))
	}
	buf.poke(1, 0, samples);

	switch (span) {
		case "full":
			break;
		case "half":
			buf.send("apply", "gain", "0.5");
			buf.send("apply", "offset", "0.5");
			break;
		default:
			post("Span argument must be either 'full' or 'half'.");
			return;
	}
}



