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
    var camPos = vec4.fromValues(0.0, 0.0, 25.0, 1);
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
    window.addEventListener('keydown', function(event) { onKeyDown(event);},false);

    // -------------- Trasformations Init --------------
    var model = mat4.create();

    // be careful about order
    // mat4.translate(model, model, [0, 0, 0]);
    // mat4.scale(model, model, [0.5, 0.5, 0.5]);
    // mat4.rotateX(model, model, Math.PI / 2);

    var view = mat4.create();
    mat4.lookAt(view, [camPos[0], camPos[1], camPos[2]], [0, 0, 0], camUp); // lookAt(out, eye, center, up)
    var projection = mat4.create();
    mat4.perspective(projection, 0.5 * Math.PI / 2., gl.canvas.width / gl.canvas.height, 1, 50); // mat4.perspective(out, fovy, aspect, near, far)

    function onWheelScroll(event)
    {
        // console.log(window.scrollY);
        return;
    }

    function onKeyDown(event)
    {
        let angleDelta = Math.PI / 2.0;
        let numSteps = 25;
        let animationAngleDelta = angleDelta / numSteps;

        if (event.keyCode == "87")
        {
            let tmp = vec3.create();
            let camTmp = vec3.fromValues(camPos[0], camPos[1], camPos[2]);
            vec3.set(tmp, 2.0 * camSpeed * camFront[0], 2.0 * camSpeed * camFront[1], 2.0 * camSpeed * camFront[2]);
            vec3.add(camTmp, camTmp, tmp);
            vec4.set(camPos, camTmp[0], camTmp[1], camTmp[2], 1.0);
            // get new radius after translation backward
            // no need to make more stuff
            vec3.subtract(tmp, [camPos[0], camPos[1], camPos[2]], targetPos);
            camRadius = glMatrix.vec3.length(tmp);
        }
        else if (event.keyCode == "83")
        {
            let tmp = vec3.create();
            let camTmp = vec3.fromValues(camPos[0], camPos[1], camPos[2]);
            vec3.set(tmp, 2.0 * camSpeed * camFront[0], 2.0 * camSpeed * camFront[1], 2.0 * camSpeed * camFront[2]);
            vec3.subtract(camTmp, camTmp, tmp);
            vec4.set(camPos, camTmp[0], camTmp[1], camTmp[2], 1.0);
            // get new radius after translation backward
            // no need to make more stuff
            vec3.subtract(tmp, [camPos[0], camPos[1], camPos[2]], targetPos);
            camRadius = vec3.length(tmp);
        }
        else if (event.keyCode == "68")
        {
            // azimuthal movement
            phi += 2 * camSpeed;
            let xx = camRadius * Math.sin(theta) * Math.sin(phi); // spherical coordinates
            let zz = camRadius * Math.sin(theta) * Math.cos(phi);

            vec4.set(camPos, xx, camPos[1], zz, 1.0);
            // reset the front vector so zooming in and out still works
            vec3.subtract(camFront, targetPos, [camPos[0], camPos[1], camPos[2]]);
            vec3.normalize(camFront, camFront);
        }
        else if (event.keyCode == "65")
        {
            phi -= 2.0 * camSpeed;
            let xx = camRadius * Math.sin(theta) * Math.sin(phi); // spherical coordinates
            let zz = camRadius * Math.sin(theta) * Math.cos(phi);
            vec4.set(camPos, xx, camPos[1], zz, 1.0);
            // reset the front vector so zooming in and out still works
            vec3.subtract(camFront, targetPos, [camPos[0], camPos[1], camPos[2]]);
            vec3.normalize(camFront, camFront);
        }
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
    var gridProgram = createProgramFromSources(gl, gridVS, gridFS);
    //  Attrib binding points
    var positionAttributeLocation = gl.getAttribLocation(gridProgram, "vertexPos");
    //  Uniform binding points
    var resolutionUniformLocation = gl.getUniformLocation(gridProgram, "resolution");
    var timeUniformLocation = gl.getUniformLocation(gridProgram, "time");
    var modelUniformLocation = gl.getUniformLocation(gridProgram, "model");
    var viewUniformLocation = gl.getUniformLocation(gridProgram, "view");
    var projectionUniformLocation = gl.getUniformLocation(gridProgram, "projection");
    
    // -------------- Generate Mesh --------------
    var numQuadsX = 20;
    var numQuadsY = 20;
    var sideLength = 1;
    var bufferData = generateMesh(numQuadsX, numQuadsY, sideLength);

    // be careful about order
    mat4.translate(model, model, [(-numQuadsX / 2) * sideLength, + 2, 0]);
    mat4.scale(model, model, [0.5, 0.5, 0.5]);
    mat4.rotateX(model, model, Math.PI / 2);

    // -------------- Mesh VAO --------------
    var meshVAO = gl.createVertexArray();
    gl.bindVertexArray(meshVAO);
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); 

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bufferData.vertexBufferData), gl.STATIC_DRAW);

    var size = 3;          
    var type = gl.FLOAT;   
    var normalize = false; 
    var stride = 0;        
    var offset = 0;        

    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
    gl.enableVertexAttribArray(positionAttributeLocation);
    
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
    var drawOffset = 0;
    var count = numQuadsX * numQuadsY * 6; // 6 verts per quad

    // -------------- Time Init --------------
    var oldTimeStamp = 0.0;
    var seconds = 0.0;

    // -------------- Start Render Loop --------------
    window.requestAnimationFrame(renderLoop);

    function renderLoop(timeStamp)
    {
        // -------------- AAHH!!!! --------------
        resize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // -------------- Time Update --------------
        deltaTime = (timeStamp - oldTimeStamp) / 1000; // in seconds
        oldTimeStamp = timeStamp;
        seconds += deltaTime;
        
        // -------------- Cam Update --------------
        camSpeed = 3.0 * deltaTime;
        // -------------- First Pass --------------
        gl.bindVertexArray(meshVAO);
        gl.useProgram(gridProgram); 
        view = mat4.create();
        mat4.lookAt(view, [camPos[0], camPos[1], camPos[2]], [0, 0, 0], camUp); // lookAt(out, eye, center, up)
        gl.uniformMatrix4fv(modelUniformLocation, false, model);
        gl.uniformMatrix4fv(viewUniformLocation, false, view);
        gl.uniformMatrix4fv(projectionUniformLocation, false, projection);
        gl.uniform1f(timeUniformLocation, seconds);
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        //
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(primitiveType, drawOffset, count);
        
        // -------------- Restart Render Loop --------------
        window.requestAnimationFrame(renderLoop);
    }
}

main();
