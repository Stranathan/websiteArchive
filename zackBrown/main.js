"use strict";

function main()
{
    var canvas = document.getElementById("cc");
    var gl = canvas.getContext("webgl2");

    if (!gl) 
    {
        return;
    }

    var processManager = new ProcessManager(gl);

    processLoop();

    function processLoop() 
    {
        requestAnimationFrame(processLoop);        
        processManager.update();
    };
}

main();
