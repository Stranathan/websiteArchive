"use strict";

// ---------------- glMatrix Lib Aliases ----------------
var vec2 = glMatrix.vec2;
var vec3 = glMatrix.vec3;
var vec4 = glMatrix.vec4;
var mat4 = glMatrix.mat4;

// ---------------- Global GL context Init ----------------
var canvas = document.getElementById("cc");
var gl = canvas.getContext("webgl2");

// ---------------- Global GL context Init ----------------
var svgElements = document.body.querySelectorAll('svg');
svgElements.forEach(function(item) {
    item.setAttribute("width", item.getBoundingClientRect().width);
    item.setAttribute("height", item.getBoundingClientRect().height);
    item.style.width = null;
    item.style.height= null;
});

// ---------------- html2canvas ----------------
html2canvas(document.getElementById("header-container")).then(headerTextureCanvas =>{
    headerTextureCanvas.id = "headerTextureCanvas";
    document.body.appendChild(headerTextureCanvas);
});
html2canvas(document.body).then(bodyTextureCanvas =>{
    bodyTextureCanvas.id = "bodyTextureCanvas";
    document.body.appendChild(bodyTextureCanvas);
    
	document.getElementById("root-container").style.display = "none";
	
	main();
});

function main() 
{
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

    // ------------------ Input Handling Init ------------------
    window.addEventListener('mousedown', function(event) { onMouseDown(event);});
    window.addEventListener('mousemove', function(event) { onMouseMove(event);});
    window.addEventListener('mouseup', function(event) { onMouseUp(event);});
    window.addEventListener('wheel', function(event) { onMouseWheel(event);});    

    // ------------------ Renderables Init ------------------
    var renderables = [];

    // ------------------ Camera/s Init------------------
    var targetHeight = 0.8
    var camRadius = 2;
    var camPos = vec4.fromValues(0, targetHeight, -camRadius, 1.);
    var camUp = vec4.fromValues(0.0, 1.0, 0.0, 1.0); // really world up for gram-schmidt process
    var targetPos = vec4.fromValues(0.0, targetHeight, 0.0, 1.0);

    // ------------------ MVP Init------------------
    var view = mat4.create();
    mat4.lookAt(view, [camPos[0], camPos[1], camPos[2]], [targetPos[0], targetPos[1], targetPos[2]], [camUp[0], camUp[1], camUp[2]]);
    var projection = mat4.create();
    let fieldOfVision = 0.5 * Math.PI / 2.;
    let aspectRatio = gl.canvas.width / gl.canvas.height;
    mat4.perspective(projection, fieldOfVision, aspectRatio, 1, 100);

    // ------------------ Shader Programs Init ----------------
    var headerAnimationProgram = createProgramFromSources(gl, headerAnimationVS, headerAnimationFS);
    var bodyAnimationProgram = createProgramFromSources(gl, bodyAnimationVS, bodyAnimationFS);

    // ------------------ Uniforms binding points
    var headerAnimationTimeUniformLocation = gl.getUniformLocation(headerAnimationProgram, "time");
    var headerAnimationResolutionUniformLocation = gl.getUniformLocation(headerAnimationProgram, "resolution");
    var headerAnimationModelUniformLocation = gl.getUniformLocation(headerAnimationProgram, "model");
    var headerAnimationViewUniformLocation = gl.getUniformLocation(headerAnimationProgram, "view");
    var headerAnimationProjectionUniformLocation = gl.getUniformLocation(headerAnimationProgram, "projection");
    var headerAnimationMousePositionsUniformLocation = gl.getUniformLocation(headerAnimationProgram, "mousePositions");

    var bodyAnimationTimeUniformLocation = gl.getUniformLocation(bodyAnimationProgram, "time");
    var bodyAnimationResolutionUniformLocation = gl.getUniformLocation(bodyAnimationProgram, "resolution");
    var bodyAnimationModelUniformLocation = gl.getUniformLocation(bodyAnimationProgram, "model");
    var bodyAnimationViewUniformLocation = gl.getUniformLocation(bodyAnimationProgram, "view");
    var bodyAnimationProjectionUniformLocation = gl.getUniformLocation(bodyAnimationProgram, "projection");
    var bodyAnimationMousePositionsUniformLocation = gl.getUniformLocation(bodyAnimationProgram, "mousePositions");

    // ------------------ Header Quad VAO Init ------------------
    // ---- Attribs
    var headerQuadVAO = gl.createVertexArray();
    var headerQuadVBO = gl.createBuffer();
    gl.bindVertexArray(headerQuadVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, headerQuadVBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unitQuadWithTexCoords), gl.STATIC_DRAW); // see utils/gridQuad.js
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, (5 * 4), 0);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, (5 * 4), (3 * 4));
    gl.enableVertexAttribArray(1);

    // ---- init transform for header
    let headerTransform = mat4.create();
    mat4.translate(headerTransform, headerTransform, [0, 1.5, 0]); // translate up to header position
    mat4.scale(headerTransform, headerTransform, [1.525, 0.1, 1]);
	
    // ---- Add to render queue
    renderables.push(
        {tag: "headerQuad",
         transform: headerTransform,
         vao: headerQuadVAO,
         primitiveType: gl.TRIANGLES,
         arrayedTriCount: 6,
         program: headerAnimationProgram,
         uniformLocations: {time: headerAnimationTimeUniformLocation, 
                            resolution: headerAnimationResolutionUniformLocation,
                            model: headerAnimationModelUniformLocation,
                            view: headerAnimationViewUniformLocation,
                            projection :headerAnimationProjectionUniformLocation,
                            theMousePositions:headerAnimationMousePositionsUniformLocation
                           }
        });
    // ------------------ Body Quad VAO Init ------------------
    // ---- Attribs
    var bodyQuadVAO = gl.createVertexArray();
    var bodyQuadVBO = gl.createBuffer();
    gl.bindVertexArray(bodyQuadVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, bodyQuadVBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unitQuadWithTexCoords), gl.STATIC_DRAW); // see utils/gridQuad.js
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, (5 * 4), 0);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, (5 * 4), (3 * 4));
    gl.enableVertexAttribArray(1);

    // ---- init transform for body
    let bodyTransform = mat4.create();
    mat4.scale(bodyTransform, bodyTransform, [1.6, 1.6, 1]);
	mat4.translate(bodyTransform, bodyTransform, [0., 0., 0.1]); // translate positively into z to be behind header

    // ---- Add to render queue
    renderables.push(
        {tag: "bodyQuad",
        transform: bodyTransform,
        vao: bodyQuadVAO,
        primitiveType: gl.TRIANGLES,
        arrayedTriCount: 6,
        program: bodyAnimationProgram,
        uniformLocations: {time: bodyAnimationTimeUniformLocation, 
                           resolution: bodyAnimationResolutionUniformLocation,
                           model: bodyAnimationModelUniformLocation,
                           view: bodyAnimationViewUniformLocation,
                           projection: bodyAnimationProjectionUniformLocation,
                           theMousePositions: bodyAnimationMousePositionsUniformLocation
                        }
        });
 
    // 
    // ------------------ Make textures From Generated screen shot canvases ------------------
    var headerTex = gl.createTexture(); // make canvas
    var theHeaderCanvas = document.getElementById("headerTextureCanvas"); // get canvas made by html2canvas
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, headerTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, theHeaderCanvas); // This is the important line!
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);

	var bodyTex = gl.createTexture(); // make canvas
    var thebodyCanvas = document.getElementById("bodyTextureCanvas"); // get canvas made by html2canvas
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, bodyTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, thebodyCanvas); // This is the important line!
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
	gl.generateMipmap(gl.TEXTURE_2D);
	gl.bindTexture(gl.TEXTURE_2D, null);
	//var thebodyCanvas = document.getElementById("bodyTextureCanvas").style.display = "none";
	
    // ------------------ WebGL State Init ----------------
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.DEPTH_TEST);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // -------------- Mouse State Init --------------
    var timeout;
    var idle = false;
    
    // ------------------ Time Init ------------------
    var oldTimeStamp = 0.0;
    var seconds = 0.0;
    var deltaTime = 0.0;

    // ------------------ Start Render Loop ------------------
    window.requestAnimationFrame(renderLoop);

    function renderLoop(timeStamp)
    {
        // ------------------ Time Update ------------------
        deltaTime = (timeStamp - oldTimeStamp) / 1000;
        oldTimeStamp = timeStamp;
        seconds += deltaTime;

        view = mat4.create();
        mat4.lookAt(view, [camPos[0] + Math.cos(seconds), camPos[1], camPos[2] + Math.sin(seconds)], targetPos, [camUp[0], camUp[1], camUp[2]]); 
        // ------------------ Render call ------------------
        resize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        if (renderables.length != 0)
        {
            for(let i = 0; i < renderables.length; i++)
            {
                // bind vao
                gl.bindVertexArray(renderables[i].vao);
                gl.useProgram(renderables[i].program);
                
                if(renderables[i].tag == "headerQuad")
                {
                    gl.bindTexture(gl.TEXTURE_2D, headerTex);
                }
                else
                {
                    gl.bindTexture(gl.TEXTURE_2D, bodyTex);
                }
                // pass uniforms
                for( let uniform in renderables[i].uniformLocations)
                {
                    switch(uniform)
                    {
                        case "time":
                            gl.uniform1f(renderables[i].uniformLocations[uniform], seconds);
                            break;
                        case "resolution":
                            gl.uniform2f(renderables[i].uniformLocations[uniform], gl.canvas.width, gl.canvas.height);
                            break;
                       
                        case "theMousePositions":
                            gl.uniform2fv(renderables[i].uniformLocations[uniform], mousePositions);
                            break;
                        case "model":
                            gl.uniformMatrix4fv(renderables[i].uniformLocations[uniform], false, renderables[i].transform);
                            break;
                        case "view":
                            gl.uniformMatrix4fv(renderables[i].uniformLocations[uniform], false, view); // this is ok as long as we only have one camera
                            break;
                        case "projection":
                            gl.uniformMatrix4fv(renderables[i].uniformLocations[uniform], false, projection); //  ``
                            break;
                        default:
                            console.log("some weird uniform was attached to the renderable and it doesn't know what to do");
                    }
                }
                gl.drawArrays(renderables[i].primitiveType, 0, renderables[i].arrayedTriCount);
            }
        }
        // ------------------ Restart Render Loop ------------------
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
        let speed = 0.05;
        let delta = speed * (event.deltaY) / 3.;
        // translate the camPos, targetPos, and header by same transform
        mat4.translate(camPos, camPos, [0, delta, 0]);
        mat4.translate(targetPos, targetPos, [0, delta, 0]);
        mat4.translate(renderables[1].transform, renderables[1].transform, [0, delta, 0]);

        view = mat4.create();
        mat4.lookAt(view, [camPos[0], camPos[1], camPos[2]], targetPos, [camUp[0], camUp[1], camUp[2]]);
    }
}