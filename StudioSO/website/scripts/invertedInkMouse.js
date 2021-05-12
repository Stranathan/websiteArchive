
"use strict";

var canvas = document.getElementById("cc");
var gl = canvas.getContext("webgl2");

//let configurables = { allowTaint: true}; 

html2canvas(document.body).then(textureCanvas =>{
    textureCanvas.id = "textureCanvas";
    document.body.appendChild(textureCanvas);
    main();
});

function main() 
{
    // ------------------ Initialization ----------------
    if (!gl) 
    {
        console.log("omg why isn't this working");
        return;
    }
    // script was deffered, so clientWidth exists and is determined by CSS display width
    var width = gl.canvas.clientWidth;
    var height = gl.canvas.clientHeight;
    // Now we can set the size of the drawingbuffer to match this
    gl.canvas.width = width;
    gl.canvas.height = height;

    // ------------------ DOM Event functions ------------------
    // just initting to offscreen
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

    window.addEventListener('mousedown', function(event) { onMouseDown(event);});
    window.addEventListener('mousemove', function(event) { onMouseMove(event);});
    window.addEventListener('mouseup', function(event) { onMouseUp(event);});
    window.addEventListener('wheel', function(event) { onMouseWheel(event);});    

    // ------------------ Screen Quad Shader ------------------
    var screenQuadShaderProgram = createProgramFromSources(gl, screenQuadShaderVS, screenQuadShaderFS);
    var screenQuadShaderTimeUniformLocation = gl.getUniformLocation(screenQuadShaderProgram, "time");
    var screenQuadShaderResolutionUniformLocation = gl.getUniformLocation(screenQuadShaderProgram, "resolution");
    var screenQuadShaderMousePositionsUniformLocation = gl.getUniformLocation(screenQuadShaderProgram, "mousePositions");

    // ------------------ Screen Quad VAO ------------------
    var screenQuadVAO = gl.createVertexArray();
    var screenQuadVBO = gl.createBuffer();
    gl.bindVertexArray(screenQuadVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, screenQuadVBO);
    var positionLayoutLocation = Math.floor(0);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quadPositions), gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionLayoutLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLayoutLocation);

    // ------------------ Get Texture From TextureCanvas ------------------
    var canvasTexture = gl.createTexture(); // make canvas
    var textureCanvas = document.getElementById("textureCanvas"); // get canvas made by html2canvas
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, canvasTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureCanvas); // This is the important line!
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);

    // ------------------ Time Init ------------------
    var oldTimeStamp = 0.0;
    var seconds = 0.0;
    var deltaTime;

    // -------------- Mouse State Init --------------
    var timeout;
    var idle = false;

    // ------------------ Start Render Loop ------------------
    window.requestAnimationFrame(renderLoop);

    function renderLoop(timeStamp)
    {
        // ------------------ Time update ------------------s
        deltaTime = (timeStamp - oldTimeStamp) / 1000; // in seconds
        oldTimeStamp = timeStamp;
        seconds += deltaTime;

        // ------------------ Viewing Pass ------------------
        resize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(screenQuadShaderProgram);
        gl.uniform1f(screenQuadShaderTimeUniformLocation, seconds);
        gl.uniform2fv(screenQuadShaderMousePositionsUniformLocation, mousePositions);
        gl.uniform2f(screenQuadShaderResolutionUniformLocation, gl.canvas.width, gl.canvas.height);

        gl.bindTexture(gl.TEXTURE_2D, canvasTexture); // RDNT
        gl.bindVertexArray(screenQuadVAO); // RDNT
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // ------------------ Restart Loop ------------------
        window.requestAnimationFrame(renderLoop);
    }

    function onMouseDown(event)
    {
    }
    function onMouseMove(event)
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
    }
    function onMouseUp(event)
    {
    }
    function onMouseWheel(event)
    {
    }
}