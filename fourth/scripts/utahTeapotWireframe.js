"use strict";

// -------------- glMatrix Lib Aliases: --------------
var vec2 = glMatrix.vec2;
var vec3 = glMatrix.vec3;
var vec4 = glMatrix.vec4;
var mat2 = glMatrix.mat2;
var mat4 = glMatrix.mat4;

// -------------- Global variables to to be changed eventually --------------
var deltaTime = 0.0167; // just initing to ~60fps, sets to this in update loop
var clickSwitch = false;
var mouseClickWorldVector1, mouseClickWorldVector2; // for mouse camera movement

function main() 
{
    var canvas = document.getElementById("cc");
    var gl = canvas.getContext("webgl2");
    if (!gl) 
    {
        return;
    }

    // script was deferred, so clientWidth exists and is determined by CSS display width
    var width = gl.canvas.clientWidth;
    var height = gl.canvas.clientHeight;
    // Now we can set the size of the drawingbuffer to match this
    gl.canvas.width = width;
    gl.canvas.height = height;

    // -------------- Camera Init --------------
    var camSpeed, camRadius, theta, phi, camSpeedMultiplier; 
    camSpeed = 0.0; // camSpeed is set by update loop, just initing to something
    camSpeedMultiplier = 2.0; // arbitrarily chosen
    var camUp = vec3.fromValues(0.0, 1.0, 0.0); // really world up for gram-schmidt process
    var camPos = vec4.fromValues(0.0, 0.0, 18.0, 1);
    var targetPos = vec3.fromValues(0.0, 0.0, 0.0); // looking at origin, unit quad centered at origin
    var camFront = vec3.create();
    vec3.subtract(camFront, targetPos, [camPos[0], camPos[1], camPos[2]]);
    camRadius = vec3.length(camFront); // get init cam radius;
    theta = Math.acos(camPos[1] / camRadius); // init theta, spherical coordinates
    phi = Math.atan(camPos[0] / camPos[2]); // init phi, spherical coordinates
    vec3.normalize(camFront, camFront);

    // -------------- Input Init --------------
    //var canvasHolderDiv = document.getElementById("canvasHolder");
    window.addEventListener('mousemove', function(event) { onMouseMove(event);});
    window.addEventListener('mousedown', function(event) { onMouseDown(event);});
    window.addEventListener('mouseup', function(event) { onMouseUp(event);});
    //canvasHolderDiv.addEventListener('wheel', function(event) { onWheelScroll(event);});
    var arrowDiv = document.getElementById("down-arrow");

    // -------------- Trasformations Init --------------
    var model = mat4.create();

    // be careful about order
    mat4.scale(model, model, [0.5, 0.5, 0.5]);
    mat4.translate(model, model, [0.0, -5, 0]);
    mat4.rotateX(model, model, -Math.PI / 2);


    var view = mat4.create();
    mat4.lookAt(view, [camPos[0], camPos[1], camPos[2]], [0, 0, 0], camUp); // lookAt(out, eye, center, up)
    var projection = mat4.create();
    mat4.perspective(projection, 0.5 * Math.PI / 2., gl.canvas.width / gl.canvas.height, 1, 50); // mat4.perspective(out, fovy, aspect, near, far)

    function onWheelScroll(event)
    {
        // console.log(window.scrollY);
        return;
    }
    var mouseX = 0; // NDC mouse move coords
    var mouseY = 0;
    var mouseClickX = 0; // NDC mouse click coords
    var mouseClickY = 0;
    
    var rayDirWorld; // raycasted ray var
    var rotationAxis = vec3.create(); // rotation axis for mouse move and release cam control
    var spinDecayTimer = 0; // to give inertia to spin
    var angularVel = 0; // just init, set in mouseMove

    function onMouseMove(event)
    {
        mouseX = event.offsetX;
        mouseX = (2. * mouseX / gl.canvas.width - 1.);
        mouseY = event.offsetY;
        mouseY = -1 * (2. * mouseY / gl.canvas.height - 1.);
        
        if(clickSwitch == true && window.scrollY < 100)
        {
            // RAY IN NDC SPACE
            let ray_clip = vec4.fromValues(mouseX, mouseY, -1.0, 1.0);
            let inverseProjectionMatrix = mat4.create();
            mat4.invert(inverseProjectionMatrix, projection);

            vec4.transformMat4(ray_clip, ray_clip, inverseProjectionMatrix);
            // we only needed to un-project the x,y part,
            // so let's manually set the z, w part to mean "forwards, and not a point
            let ray_eye = vec4.fromValues(ray_clip[0], ray_clip[1], -1.0, 0.0);

            let inverseViewMatrix = mat4.create();
            mat4.invert(inverseViewMatrix, view);
            let tmp = vec4.create();
            vec4.transformMat4(tmp, ray_eye, inverseViewMatrix);
            rayDirWorld = vec3.fromValues(tmp[0], tmp[1], tmp[2]);
            rayDirWorld = vec3.normalize(rayDirWorld, rayDirWorld);

            mouseClickWorldVector2 = rayDirWorld;
 
            let angle = vec3.angle(mouseClickWorldVector1, mouseClickWorldVector2);
            vec3.cross(rotationAxis, mouseClickWorldVector1, mouseClickWorldVector2);
    
            let rotMat = mat4.create();
            mat4.rotate(rotMat, rotMat, angle / 2, rotationAxis);
            vec4.transformMat4(camPos, camPos, rotMat);

            mouseClickWorldVector1 = mouseClickWorldVector2;
            angularVel = angle/deltaTime;
        }
        else if(window.scrollY > 100)
        {
            angularVel = 0;
            return;
        }
    }
    function onMouseDown(event)
    {
        mouseClickX = event.offsetX;
        mouseClickX = (2. * mouseClickX / gl.canvas.width - 1.);
        mouseClickY = event.offsetY;
        mouseClickY = -1 * (2. * mouseClickY / gl.canvas.height - 1.);

        
        console.log(window.scrollY);
        // #---------- RAY CASTING -------------#
        // RAY IN NDC SPACE
        let ray_clip = vec4.fromValues(mouseClickX, mouseClickY, -1.0, 1.0);
        let inverseProjectionMatrix = mat4.create();
        mat4.invert(inverseProjectionMatrix, projection);

        vec4.transformMat4(ray_clip, ray_clip, inverseProjectionMatrix);
        // we only needed to un-project the x,y part,
        // so let's manually set the z, w part to mean "forwards, and not a point
        let ray_eye = vec4.fromValues(ray_clip[0], ray_clip[1], -1.0, 0.0);

        let inverseViewMatrix = mat4.create();
        mat4.invert(inverseViewMatrix, view);
        let tmp = vec4.create();
        vec4.transformMat4(tmp, ray_eye, inverseViewMatrix);
        rayDirWorld = vec3.fromValues(tmp[0], tmp[1], tmp[2]);
        rayDirWorld = vec3.normalize(rayDirWorld, rayDirWorld);  

        // keep the view matrix from freaking out

        mouseClickWorldVector1 = rayDirWorld;
        clickSwitch = true;
    }

    function onMouseUp(event)
    {
        spinDecayTimer = 0;

        if(clickSwitch == true)
        {
            clickSwitch = false;
        }
    }
    // -------------- Shader --------------
    // -------------- Program 1 --------------
    var program = createProgramFromSources(gl, barycentricWireframeVS, barycentricWireframeFS);

    var positionAttributeLocation = gl.getAttribLocation(program, "vertexPos");
    var resolutionUniformLocation = gl.getUniformLocation(program, "resolution");
    var timeUniformLocation = gl.getUniformLocation(program, "time");
    var modelUniformLocation = gl.getUniformLocation(program, "model");
    var viewUniformLocation = gl.getUniformLocation(program, "view");
    var projectionUniformLocation = gl.getUniformLocation(program, "projection");
    
    // -------------- Program 2 --------------
    var program2 = createProgramFromSources(gl, rwwttVS, rwwttFS);
    var positionAttributeLocation2 = gl.getAttribLocation(program2, "vertexPos");
    var resolutionUniformLocation2 = gl.getUniformLocation(program2, "resolution");
    var timeUniformLocation2 = gl.getUniformLocation(program2, "time");
    var textureUniformLocation = gl.getUniformLocation(program2, "screenTexture");

    // -------------- Load Mesh From .obj file --------------
    var meshBufferData = loadMesh(highResUtahTeapotOBJ);

    // -------------- utahTeapotVAO --------------
    var utahTeapotVAO = gl.createVertexArray();
    var utahTeapotVBO = gl.createBuffer();
    gl.bindVertexArray(utahTeapotVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, utahTeapotVBO);
    var utahTeapotVertexData = meshBufferData.vertexBufferData;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(utahTeapotVertexData), gl.STATIC_DRAW);
    var size = 3;
    var type = gl.FLOAT;
    var normalize = false; 
    var stride = 0;
    var offset = 0;
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
    gl.enableVertexAttribArray(positionAttributeLocation);
    
    // -------------- screenQuadVAO --------------
    const screenQuadData = 
    [
        -1, +1, 0,
        -1, -1, 0,
        +1, -1, 0,

        -1, +1, 0,
        +1, -1, 0,
        +1, +1, 0
    ]
    var screenQuadVAO = gl.createVertexArray();
    var screenQuadVBO= gl.createBuffer();
    gl.bindVertexArray(screenQuadVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, screenQuadVBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(screenQuadData), gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionAttributeLocation2, size, type, normalize, stride, offset);
    gl.enableVertexAttribArray(positionAttributeLocation2);
    
    // -------------- Screen texture for screenQuad --------------
    const targetTextureWidth = gl.canvas.width;
    const targetTextureHeight = gl.canvas.height;
    const targetTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, targetTexture);
    {
        // define size and format of level 0
        const level = 0;
        const internalFormat = gl.RGBA;
        const border = 0;
        const format = gl.RGBA;
        const type = gl.UNSIGNED_BYTE;
        const data = null;
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                    targetTextureWidth, targetTextureHeight, border,
                    format, type, data);

        // set the filtering so we don't need mips
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }

    // -------------- MSAA renderbuffer, its associated Framebuffer  --------------
    // -------------- and another framebuffer to sample for post processing --------------

    var sampleSize = gl.getParameter(gl.MAX_SAMPLES); // because 4 looks ugly
    // MSAA RBO
    var msaaRenderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, msaaRenderbuffer);
    gl.renderbufferStorageMultisample(gl.RENDERBUFFER, sampleSize, gl.RGBA8, targetTextureWidth, targetTextureHeight);
    // Depth Buffer for MSAA FBO
    var depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorageMultisample(gl.RENDERBUFFER, sampleSize, gl.DEPTH_COMPONENT16, targetTextureWidth, targetTextureHeight);

    // MSAA FBO
    var msaaFramebuffer = gl.createFramebuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, msaaRenderbuffer);
    gl.bindFramebuffer(gl.FRAMEBUFFER, msaaFramebuffer);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, msaaRenderbuffer);
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

    // RESOLVED FBO INIT
    var intermediateTextureFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, intermediateTextureFramebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, targetTexture, 0);
    // Unbind
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); // Should be a superfluous call

    // -------------- Init GL State --------------
    //gl.enable(gl.CULL_FACE);
    //gl.frontFace(gl.CCW);
    resize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.SAMPLE_ALPHA_TO_COVERAGE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // -------------- Init Draw State --------------
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = Math.round(meshBufferData.vertexBufferData.length / 3);

    // -------------- Time Init --------------
    var oldTimeStamp = 0.0;
    var seconds = 0.0;

    // -------------- Start Render Loop --------------
    window.requestAnimationFrame(renderLoop);

    function renderLoop(timeStamp)
    {
        if(window.scrollY >= 50)
        {   
            arrowDiv.style.display = "none"
        }
        else if(window.scrollY < 50)
        {
            arrowDiv.style.display = "block"
        }
        // -------------- AAHH!!!! --------------
        resize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // -------------- Time Update --------------
        deltaTime = (timeStamp - oldTimeStamp) / 1000; // in seconds
        oldTimeStamp = timeStamp;
        seconds += deltaTime;
        
        // -------------- Cam Update --------------
        if(spinDecayTimer < 5)
        {
            spinDecayTimer += 1.3 * deltaTime;
            let spinEffectTheta = angularVel * deltaTime;
            spinEffectTheta *= Math.exp(-2 * spinDecayTimer);
            
            let rotMat = mat4.create();
            mat4.fromRotation(rotMat, spinEffectTheta, rotationAxis);
            vec4.transformMat4(camPos, camPos, rotMat);
        }
        // -------------- First Pass --------------
        gl.bindFramebuffer(gl.FRAMEBUFFER, msaaFramebuffer); // bind to our framebuffer attached to msaa renderbuffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindVertexArray(utahTeapotVAO);
        gl.useProgram(program); 
        view = mat4.create();
        mat4.lookAt(view, [camPos[0], camPos[1], camPos[2]], [0, 0, 0], camUp); // lookAt(out, eye, center, up)
        gl.uniformMatrix4fv(modelUniformLocation, false, model);
        gl.uniformMatrix4fv(viewUniformLocation, false, view);
        gl.uniformMatrix4fv(projectionUniformLocation, false, projection);
        gl.uniform1f(timeUniformLocation, seconds);
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        //
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(primitiveType, offset, count);
        
        // -------------- Second Pass --------------
        // blit the color data from msaa render buffer into framebuffer for post processing
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, msaaFramebuffer);
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, intermediateTextureFramebuffer);
        gl.clearBufferfv(gl.COLOR, 0, [1.0, 1.0, 1.0, 1.0]);
        gl.blitFramebuffer(0, 0, targetTextureWidth, targetTextureHeight,
                            0, 0, targetTextureWidth, targetTextureHeight,
                            gl.COLOR_BUFFER_BIT, gl.LINEAR);
        gl.bindFramebuffer(gl.FRAMEBUFFER, msaaFramebuffer);
        
        gl.bindTexture(gl.TEXTURE_2D, targetTexture);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(1, 1, 1, 1);
        
        gl.bindVertexArray(screenQuadVAO);
        gl.useProgram(program2); 
        gl.uniform1f(timeUniformLocation2, seconds);
        gl.uniform2f(resolutionUniformLocation2, gl.canvas.width, gl.canvas.height);
        
        // Unbind framebuffer to allow default framebuffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(primitiveType, offset, 6);
       
        // -------------- Restart Render Loop --------------
        window.requestAnimationFrame(renderLoop);
    }
}

main();
