"use strict";

// #--------------- glMatrix LIB ALIASES: ---------------#
var vec2 = glMatrix.vec2;
var vec3 = glMatrix.vec3;
var vec4 = glMatrix.vec4;
var mat2 = glMatrix.mat2;
var mat4 = glMatrix.mat4;

// -------------- Global variables to to be changed eventually --------------
var deltaTime = 0.0167; // just initing to ~60fps, sets to this in update loop
var clickSwitch = false;
var v1, v2; // for mouse camera movement

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

    // -------------- Camera Init --------------
    var camSpeed, camRadius, theta, phi, camSpeedMultiplier; 
    camSpeed = 0.0; // camSpeed is set by update loop, just initing to something
    camSpeedMultiplier = 2.0; // arbitrarily chosen
    var camUp = vec3.fromValues(0.0, 1.0, 0.0); // really world up for gram-schmidt process
    var camPos = vec4.fromValues(0.0, 0.0, 20.0, 1);
    var targetPos = vec3.fromValues(0.0, 0.0, 0.0); // looking at origin, unit quad centered at origin
    var camFront = vec3.create();
    vec3.subtract(camFront, targetPos, [camPos[0], camPos[1], camPos[2]]);
    camRadius = vec3.length(camFront); // get init cam radius;
    theta = Math.acos(camPos[1] / camRadius); // init theta, spherical coordinates
    phi = Math.atan(camPos[0] / camPos[2]); // init phi, spherical coordinates
    vec3.normalize(camFront, camFront);

    // -------------- Input Init --------------
    
    window.addEventListener('keydown', function(event) { onKeyDown(event);},false);

    var canvasHolderDiv = document.getElementById("canvasHolder")
    canvasHolderDiv.addEventListener('mousemove', function(event) { onMouseMove(event);});
    canvasHolderDiv.addEventListener('mousedown', function(event) { onMouseDown(event);});
    canvasHolderDiv.addEventListener('mouseup', function(event) { onMouseUp(event);});
    canvasHolderDiv.addEventListener('wheel', function(event) { onWheelScroll(event);});

    // -------------- Trasformations Init --------------
    var model = mat4.create()
    mat4.scale(model, model, [0.5, 0.5, 0.5]);
    mat4.translate(model, model, [0.0, -5, 0]);
    mat4.rotateX(model, model, -Math.PI / 2);
    var view = null; // dependent on camPos, defined as null so I can init raycasting check;
    var projection = mat4.create();
    mat4.perspective(projection, 0.5 * Math.PI / 2., gl.canvas.width / gl.canvas.height, 1, 50); // mat4.perspective(out, fovy, aspect, near, far)

    //
    function onWheelScroll(event)
    {
        // down
        if (event.deltaY > 0)
        {
           // console.log("down");
        }
        // up
        else if(event.deltaY < 0)
        {
            // console.log("down");
        }
    }
    function onKeyDown(event)
    {
        return;
    }
    var mouseX = 0; // NDC mouse move coords
    var mouseY = 0;
    var mouseClickX = 0; // NDC mouse click coords
    var mouseClickY = 0;
    
    var rayDirWorld; // raycasted ray var
    var rotationAxis = vec3.create(); // rotation axis for mouse move and release cam control
    var rotationAxis2 = vec3.create();
    var spinDecayTimer = 0; // to give inertia to spin
    var angularVel = 0; // just init, set in mouseMove

    function onMouseMove(event)
    {
        mouseX = event.offsetX;
        mouseX = (2. * mouseX / gl.canvas.width - 1.);
        mouseY = event.offsetY;
        mouseY = -1 * (2. * mouseY / gl.canvas.height - 1.);
        
        if(clickSwitch == true)
        {
            // limit possible angle so view transform does divide by zero
            if(v1[1] < 0.95 && v1[1] > -0.95)
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

                v2 = rayDirWorld;
                if(v2[1] < 0.95 && v2[1] > -0.95)
                {
                    let angle = vec3.angle(v1, v2);
                    let angle2 = vec3.angle(v2, v1);

                    vec3.cross(rotationAxis, v1, v2);
                    vec3.cross(rotationAxis2, v2, v1);

                    let rotMat = mat4.create();
                    mat4.rotate(rotMat, rotMat, angle, rotationAxis2);
                    //mat4.fromRotation(rotMat, -angle2, rotationAxis);
                    vec4.transformMat4(camPos, camPos, rotMat);

                    angularVel = angle/deltaTime;
                }
            }
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

        if(view != null)
        {
            let inverseViewMatrix = mat4.create();
            mat4.invert(inverseViewMatrix, view);
            let tmp = vec4.create();
            vec4.transformMat4(tmp, ray_eye, inverseViewMatrix);
            rayDirWorld = vec3.fromValues(tmp[0], tmp[1], tmp[2]);
            rayDirWorld = vec3.normalize(rayDirWorld, rayDirWorld);         
            v1 = rayDirWorld;
            clickSwitch = true;
        }
    }

    function onMouseUp(event)
    {
        spinDecayTimer = 0;

        if(clickSwitch == true)
        {
            clickSwitch = false;
        }
    }

    // Use our boilerplate utils to compile the shaders and link into a program
    var program = createProgramFromSources(gl, utahTeapotHelloVS, utahTeapotHelloFS);

    // look up where the vertex data needs to go.
    var positionAttributeLocation = gl.getAttribLocation(program, "vertexPos");
    var textureAttributeLocation = gl.getAttribLocation(program, "vertexTexCoord");
    var normalAttributeLocation = gl.getAttribLocation(program, "vertexNormal");

    // look up uniform locations
    var resolutionUniformLocation = gl.getUniformLocation(program, "resolution");
    var timeUniformLocation = gl.getUniformLocation(program, "time");
    var modelUniformLocation = gl.getUniformLocation(program, "model");
    var viewUniformLocation = gl.getUniformLocation(program, "view");
    var projectionUniformLocation = gl.getUniformLocation(program, "projection");

    // Create a buffer
    var positionBuffer = gl.createBuffer();

    // Create a vertex array object (attribute state)
    var vao = gl.createVertexArray();

    // and make it the one we're currently working with
    gl.bindVertexArray(vao);

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // -------------- Load Mesh From .obj file --------------
    let bufferData = loadMesh(highResUtahTeapotOBJ);

    var positions = bufferData.vertexBufferData;


    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    var size = 3;          // 3 floats per position read
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data whatever this means
    var stride = 9 * 4;    // 
    var offset = 0;        // start at the beginning of the 24 byte block of buffer

    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
    // Turn on the attribute
    gl.enableVertexAttribArray(positionAttributeLocation);
    
    offset = 3 * 4;    // start 3 floats * 4 bytes into the 24 byte block of buffer
    gl.vertexAttribPointer(textureAttributeLocation, size, type, normalize, stride, offset);
    // Turn on the attribute
    gl.enableVertexAttribArray(textureAttributeLocation);

    offset = 6 * 4;    // start 6 floats * 4 bytes into the 24 byte block of buffer
    gl.vertexAttribPointer(normalAttributeLocation, size, type, normalize, stride, offset);
    // Turn on the attribute
    gl.enableVertexAttribArray(normalAttributeLocation);

    // -------------- Index Buffer Init --------------
    // create the buffer
    const indexBuffer = gl.createBuffer();
    
    // make this buffer the current 'ELEMENT_ARRAY_BUFFER'
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    const indices = bufferData.indexBufferData;

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    // #------------------------------------#

    // Clear the canvas
    //gl.enable(gl.CULL_FACE);
    //gl.frontFace(gl.CCW);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Bind the attribute/buffer set we want.
    gl.bindVertexArray(vao);

    // Resolution only needs to be passed once
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

   
    // init draw
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
        // -------------- AAHH!!!! --------------
        resize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // -------------- Time Update --------------
        deltaTime = (timeStamp - oldTimeStamp) / 1000; // in seconds
        oldTimeStamp = timeStamp;
        seconds += deltaTime;
        
        // -------------- Cam Update --------------
        camSpeed = 3.0 * deltaTime;

        spinDecayTimer += deltaTime;
        if(spinDecayTimer < 5)
        {
            let spinEffectTheta = angularVel * deltaTime;
            spinEffectTheta *= Math.exp(-1.5 * spinDecayTimer);
            
            let rotMat = mat4.create();
            //mat4.fromRotation(rotMat, spinEffectTheta, rotationAxis);
            mat4.fromRotation(rotMat, spinEffectTheta, rotationAxis2);
            vec4.transformMat4(camPos, camPos, rotMat);
        } 
        // -------------- Shader update --------------
        view = mat4.create();
        mat4.lookAt(view, [camPos[0], camPos[1], camPos[2]], [0, 0, 0], camUp); // lookAt(out, eye, center, up)
    
        //mat4.rotateY(model, model, deltaTime);
        gl.uniformMatrix4fv(modelUniformLocation, false, model);
        gl.uniformMatrix4fv(viewUniformLocation, false, view);
        gl.uniformMatrix4fv(projectionUniformLocation, false, projection);

        gl.uniform1f(timeUniformLocation, seconds);

        // -------------- Draw --------------
        gl.drawElements(primitiveType, vertCount, indexType, drawOffset);

        // -------------- Restart Game Loop --------------
        window.requestAnimationFrame(gameLoop);
    }
}

main();
