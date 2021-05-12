"use strict";

// before I forget, the magic numbers 10 are initing mosue stuff to be offscreen

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

    var program = createProgramFromSources(gl, mouseEffectVS, mouseEffectFS);
    // -------------- Attribs Init --------------
    var positionAttributeLocation = gl.getAttribLocation(program, "vertexPos");
    // -------------- Uniforms Init --------------
    var resolutionUniformLocation = gl.getUniformLocation(program, "resolution");
    var timeUniformLocation = gl.getUniformLocation(program, "time");
    var mousePositionsUniformLocation = gl.getUniformLocation(program, "mousePositions");
    
    // init to offscreen
    var mousePositions = 
    [
        10, 10,
        10, 10,
        10, 10,
        10, 10,
        10, 10,

        10, 10,
        10, 10,
        10, 10,
        10, 10,
        10, 10,
        
        10, 10,
        10, 10,
        10, 10,
        10, 10,
        10, 10,
        
        10, 10,
        10, 10,
        10, 10,
        10, 10,
        10, 10,
        
    ];
    
    // -------------- VBO & VAO Init --------------
    var positionBuffer = gl.createBuffer();
    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // full screen quad
    var positions = 
    [
        -1, +1, 0,
        -1, -1, 0,
        +1, +1, 0,
        +1, -1, 0,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 3;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer

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

    // -------------- Init Draw --------------

    resize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);
    gl.bindVertexArray(vao);
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    var primitiveType = gl.TRIANGLES;
    var drawOffset = 0;
    var vertCount = indices.length;
    var indexType = gl.UNSIGNED_SHORT;

    gl.drawElements(primitiveType, vertCount, indexType, drawOffset);

    // -------------- Time Init --------------
    var oldTimeStamp = 0.0;
    var seconds = 0.0;

    // -------------- Mouse State Init --------------
    var timeout;
    var idle = false;
    // -------------- Start Render Loop --------------
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
        gl.uniform2fv(mousePositionsUniformLocation, mousePositions);
        gl.drawElements(primitiveType, vertCount, indexType, drawOffset);

        // restart game loop
        window.requestAnimationFrame(gameLoop);
    }

    canvas.addEventListener('mousemove',(event) =>
    {
        // NDC mouse coords to agree with shader
        let xx = ( event.clientX - .5 * gl.canvas.width ) / gl.canvas.height;
        let yy = -( event.clientY - .5 * gl.canvas.height ) / gl.canvas.height;

        mousePositions.shift(); // pop first element
        mousePositions.shift(); // pop first element
        mousePositions.push(xx); // push onto end
        mousePositions.push(yy); // push onto end

        //console.log("the last coordinate = (" + mousePositions[mousePositions.length - 2] + ", " + mousePositions[mousePositions.length - 1] + ")");
        idle = false;

        clearTimeout(timeout);
        timeout = setTimeout
        (
            function()
            {
                let idleTimer = 0;
                let circRad = .0008;
                function* idleAnimation()
                {
                    while(idle)
                    {
                        let cos = Math.cos(2.2 * idleTimer - 1.);
                        let sin = Math.sin(2.2 * idleTimer - 1.);
                        
                        mousePositions[38] = mousePositions[38] + (cos * circRad);
                        mousePositions[39] = mousePositions[39] + (sin * circRad);
                        
                        let cos2 = Math.cos(2.9 * idleTimer - cos);
                        let sin2 = Math.sin(2.9 * idleTimer - sin);

                        mousePositions[36] = mousePositions[36] - (cos2 * circRad);
                        mousePositions[37] = mousePositions[37] - (sin2 * circRad);

                        idleTimer += 8/1000; // seconds
                        yield delay(8);
                    }
                    
                }

                function* tailDecay()
                {
                    let numCircles = Math.round(mousePositions.length / 2);
                    for(let ii = 0; ii < numCircles; ii++)
                    {
                        let xxx = mousePositions[38];
                        let yyy = mousePositions[39];
                                                
                        mousePositions.shift();
                        mousePositions.shift();
    
                        mousePositions.push(xxx);
                        mousePositions.push(yyy);

                        yield delay(8);
                        if(ii == Math.round(numCircles - 1))
                        {
                            idle = true;
                            console.log("animation finished");
                            wait(idleAnimation);
                        }
                    }
                }
                wait(tailDecay);
            }, 
            20 // how long to wait before starting timeout
        );
        
    });
}

main();
