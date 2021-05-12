
"use strict";

var canvas = document.getElementById("cc");
var gl = canvas.getContext("webgl2");

html2canvas(document.body).then(function(textureCanvas) {
    textureCanvas.id = "textureCanvas";
    document.body.appendChild(textureCanvas);
    console.log(textureCanvas.id);
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
    var mouseMoveX = 2; // offscreen init
    var mouseMoveY = 2;

    window.addEventListener('mousedown', function(event) { onMouseDown(event);});
    window.addEventListener('mousemove', function(event) { onMouseMove(event);});
    window.addEventListener('mouseup', function(event) { onMouseUp(event);});
    window.addEventListener('wheel', function(event) { onMouseWheel(event);});

    // ------------------ Hardcoding Attribs and accounting for potential JS weirdness ------------------
    var positionLayoutLocation = Math.floor(0);

    // ------------------ Screen Quad Shader ------------------
    var screenQuadShaderProgram = createProgramFromSources(gl, screenQuadShaderVS, screenQuadShaderFS);
    var screenQuadShaderTimeUniformLocation = gl.getUniformLocation(screenQuadShaderProgram, "time");
    var screenQuadShaderResolutionUniformLocation = gl.getUniformLocation(screenQuadShaderProgram, "resolution");
    var screenQuadShaderMouseUniformLocation = gl.getUniformLocation(screenQuadShaderProgram, "mouse");

    
    // ------------------ Screen Quad VAO ------------------
    var screenQuadVAO = gl.createVertexArray();
    var screenQuadVBO = gl.createBuffer();
    gl.bindVertexArray(screenQuadVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, screenQuadVBO);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quadPositions), gl.STATIC_DRAW);
    var size = 3;          
    var type = gl.FLOAT;
    var normalize = false; 
    var stride = 0;
    var offset = 0;
    gl.vertexAttribPointer(positionLayoutLocation, size, type, normalize, stride, offset);
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
        gl.uniform2f(screenQuadShaderMouseUniformLocation, mouseMoveX, mouseMoveY);
        gl.uniform2f(screenQuadShaderResolutionUniformLocation, gl.canvas.width, gl.canvas.height);

        gl.bindTexture(gl.TEXTURE_2D, canvasTexture); // RDNT
        gl.bindVertexArray(screenQuadVAO); // RDNT
        gl.drawArrays(gl.TRIANGLES, offset, 6);

        // ------------------ Restart Loop ------------------
        window.requestAnimationFrame(renderLoop);
    }

    function onMouseDown(event)
    {
    }
    function onMouseMove(event)
    {
        mouseMoveX = event.offsetX;
        mouseMoveY = event.offsetY;
        console.log(mouseMoveY);
    }
    function onMouseUp(event)
    {
    }
    function onMouseWheel(event)
    {
 
    }
}