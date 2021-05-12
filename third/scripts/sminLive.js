"use strict";

function main() 
{
    var canvas = document.getElementById("cc");
    var gl = canvas.getContext("webgl2");
    if (!gl) 
    {
        return;
    }

    // script was deffered, so clientWidth exists and is determined by CSS display width
    var width = gl.canvas.clientWidth;
    var height = gl.canvas.clientHeight;
    // Now we can set the size of the drawingbuffer to match this
    gl.canvas.width = width;
    gl.canvas.height = height;

    var program = createProgramFromSources(gl, sminVS, sminFS);

    var positionAttributeLocation = gl.getAttribLocation(program, "vertexPos");
    // uniform binding points
    var resolutionUniformLocation = gl.getUniformLocation(program, "resolution");
    var timeUniformLocation = gl.getUniformLocation(program, "time");

    // -------------- RWTT VAO Init --------------
    var positionBuffer = gl.createBuffer();
    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    var positions = 
    [
        -1, +1, 0,
        -1, -1, 0,
        +1, +1, 0,
        +1, -1, 0,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    var size = 3;          
    var type = gl.FLOAT;   
    var normalize = false; 
    var stride = 0;        
    var offset = 0;        

    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
    gl.enableVertexAttribArray(positionAttributeLocation);
   

    // -------------- Index Buffer Init --------------
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        
    const indices = 
    [
        0, 1, 2,
        2, 1, 3
    ];

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    // -------------- Init GL State --------------
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

   
    // rendering worlds with two triangles.
    var primitiveType = gl.TRIANGLES;
    var drawOffset = 0;
    var vertCount = indices.length;
    var indexType = gl.UNSIGNED_SHORT;
    gl.drawElements(primitiveType, vertCount, indexType, drawOffset);

    // ----------------------------------------

    resize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // -------------- TIME INIT --------------
    var oldTimeStamp = 0.0;
    var seconds = 0.0;

    // -------------- START GAME LOOP --------------
    window.requestAnimationFrame(gameLoop);

    function gameLoop(timeStamp)
    {
        resize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // time update
        let deltaTime = (timeStamp - oldTimeStamp) / 1000; // in seconds
        oldTimeStamp = timeStamp;
        seconds += deltaTime;

        gl.uniform1f(timeUniformLocation, seconds);
        // just in case it get's resized I guess
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        
        // draw
        gl.drawElements(primitiveType, vertCount, indexType, drawOffset);

        // restart game loop
        window.requestAnimationFrame(gameLoop);
    }
}

main();
