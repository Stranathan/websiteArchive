class InputManager
{
    constructor(aRenderer, objs)
    {
        this.objects = objs;

        this.renderer = aRenderer;
        this.gl = aRenderer.gl;

        this.firstMouseBtnRayCastSwitch = false;
        this.cameraRay = vec3.create();
        //
        this.isSpinning = false;
        this.spinSign = 0;
        this.totalAngle = 0;
        this.spinTimeLength = 5;
        this.spinTimer = 0.0;
        this.angle = 0;
        //
        this.firstIntersectPos = vec3.create();
        this.secondIntersectPos = vec3.create();

        window.addEventListener( "mousedown", this.mouseDown);
        window.addEventListener( "mousemove", this.mouseMove);
        window.addEventListener( "mouseup",   this.mouseUp);
    }
    mouseDown = event => 
    {
        // get world ray from camera
        cameraRay(event, this.renderer, this.cameraRay);
        //this.firstIntersectPos = intersectionCard(this.renderer.pos, this.cameraRay);
        this.firstIntersectPos = intersectionCard(this.renderer.pos, this.cameraRay);
        this.firstMouseBtnRayCastSwitch = true;
    }
    mouseMove = event => 
    {
        // see intersection.js --> returns [0, 0, 0] if there's no hit
        if(this.firstMouseBtnRayCastSwitch && vec3.squaredLength(this.firstIntersectPos) > 0)
        {
            let camRay = vec3.create();
            cameraRay(event, this.renderer, camRay);
            
            this.angle = vec3.angle(this.cameraRay, camRay);
            this.spinSign = -Math.sign(this.cameraRay[0] - camRay[0]);
            // let m = mat4.create();
            mat4.rotateY(this.objects[0].modelMatrix, this.objects[0].modelMatrix, this.spinSign * this.angle);
            this.totalAngle += this.angle;


            // we need to get the angle per mouse move, --> set the vector from last
            // move to this vector so the next mouse move calculation is possible
            this.cameraRay = camRay;
        }
    }
    mouseUp = event => 
    {
        // camera rotation:
        if(this.firstMouseBtnRayCastSwitch == true)
        {
            this.firstMouseBtnRayCastSwitch = false;
            this.firstIntersectPos = vec3.create();
            this.isSpinning = true;
            this.spinTimer = this.spinTimeLength;
        }
    }
    update(t, dt)
    {
        if(this.isSpinning)
        {
            mat4.rotateY(
                this.objects[0].modelMatrix,
                this.objects[0].modelMatrix,
                this.spinSign * this.angle * Math.exp(-(this.spinTimeLength - this.spinTimer)));
            this.totalAngle += this.angle;
            this.spinTimer -= dt;

            if(this.spinTimer <= 0)
            {
                console.log(this.totalAngle);
                console.log(this.totalAngle % (Math.PI));
                this.spinTimer = 0;
                this.totalAngle = 0;
                this.isSpinning = false;
            }
        }   
    }
}