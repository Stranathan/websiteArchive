"use strict";

function main() 
{
	var canvas = document.getElementById("leCanvas");
	var body = document.getElementById("body");
	var gl = canvas.getContext("webgl");

	if (!gl)
	{
		return;
	}

	// init  canvas & context
	resize(gl.canvas);
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	
	// Get String literals for shader source
	var vertexShaderSource = document.getElementById("vert-shader").text;
	var fragmentShaderSource = document.getElementById("frag-shader").text;

	// helper functions to create and use program
	var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
	var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
	var program = createProgram(gl, vertexShader, fragmentShader);
	gl.useProgram(program);
	
	// create some VRAM binding points
	var bufferBindingNum = gl.getAttribLocation(program, "a_position");
	var resolutionUniformLocation = gl.getUniformLocation(program, "iResolution");
	var mouseUniformLocation = gl.getUniformLocation(program, "iMouse");
	var timeUniformLocation = gl.getUniformLocation(program, "iTime");

	// Create a buffer object
	var positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

	/*
	change to glDrawElements to remove redudant vertex data
	(2)###########(3)
	################
	################
	################
	(0)###########(1)
	*/
	var vertices = 
	[
		0, 0, // 0
		canvas.clientWidth, canvas.clientHeight,// 1
		0, canvas.clientHeight, // 2
		0, 0,
		canvas.clientWidth, 0,
		canvas.clientWidth, canvas.clientHeight,
	];

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	gl.vertexAttribPointer(bufferBindingNum, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(bufferBindingNum);

	var then = 0;
	var mouseX = canvas.clientWidth / 2.0;
	var mouseY = canvas.clientHeight / 2.0;
	
	body.addEventListener('mousemove', function(event) { onmouseMove(event);}); // on body to get mousePos accross full window 

	function onmouseMove(event)
	{
		mouseX = event.clientX;
		mouseY = event.clientY;
	}

	requestAnimationFrame(drawCall);

	// now: some JavaScript dark magic
	function drawCall(now) 
	{
		now *= 0.001; // Convert to seconds
		var deltaTime = now - then;
		then = now;

		// No need to redudantly change OpenGL state
		// program is already bound & we're not switching shaders

		// uniforms
		gl.uniform2f(mouseUniformLocation, mouseX, -mouseY + gl.canvas.height);
		gl.uniform1f(timeUniformLocation, now);
		gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

		// draw call
		gl.drawArrays(gl.TRIANGLES, 0, 6);

		// JavaScript
		requestAnimationFrame(drawCall); // Call drawScene again next frame
	}
}

main();