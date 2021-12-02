class ProcessManager
{
    constructor(gl)
    {
        //
        this.processes = new Array();
        this.objects = new Array();
        //
        this.previous = window.performance.now();
        this.time = 0;
        this.deltaTime = 0;
        //
        this.init(gl);
    }
    init(gl)
    {
        var renderer = new Renderer(gl, CAM_POS, WORLD_UP)

        // Objects
        var card = new BusinessCard(renderer);
        this.objects.push(card);

        // Processes
        //var renderer = new Renderer(gl, CAM_POS, WORLD_UP)
        var inputManager = new InputManager(renderer, this.objects);
        this.processes.push(renderer);
        this.processes.push(inputManager);
    }
    update()
    {
        // time delta
        var now = window.performance.now();
        var delta = (now - this.previous);
        this.previous = now;
        this.deltaTime = delta / 1000.0;       
        this.time += this.deltaTime;

        // GET INPUT

        // UPDATE STATE

        // RENDER
        for(let i in this.objects)
        {
            this.objects[i].update(this.time, this.deltaTime);
        }

        // update
        for(let i in this.processes)
        {
            this.processes[i].update(this.time, this.deltaTime);
        }
    }
}