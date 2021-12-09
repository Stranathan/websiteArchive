class InputManager
{
    constructor(aRenderer, objs)
    {
        this.objects = objs;

        this.renderer = aRenderer;
        this.gl = aRenderer.gl;

        this.cameraRay = vec3.create();
        this.mouseMoveCameraRay = vec3.create();
        //
        this.cardClicked = false;
        this.isSpinning = false;
        this.spinSign = 0;
        this.totalAngle = 0;
        this.spinTimeLength = 5;
        this.spinTimer = 0.0;
        this.angle = 0;
        //
        window.addEventListener( "mousedown", this.mouseDown);
        window.addEventListener( "mousemove", this.mouseMove);
        window.addEventListener( "mouseup",   this.mouseUp);
    }
    mouseDown = event => 
    {
        // get world ray from camera
        cameraRay(event, this.renderer, this.cameraRay);
        this.cardClicked = aabbRayIntersect(cardAsABox, {ro: this.renderer.pos, rd: this.cameraRay});
    }
    mouseMove = event => 
    {
        if(this.cardClicked)
        {
            let camRay = vec3.create();
            cameraRay(event, this.renderer, camRay);

            this.angle = vec3.angle(this.cameraRay, camRay) / 1.1;
            this.spinSign = Math.sign(this.cameraRay[0] - camRay[0]);
            let rotMat = mat4.create();
            mat4.rotateY(rotMat, rotMat, this.spinSign * this.angle);
            vec4.transformMat4(this.renderer.pos, this.renderer.pos, rotMat);
            // (IAN) don't forget to rotate up vec if decide to rotate around a differet
            //
            this.totalAngle += this.angle;
            // we need to get the angle per mouse move, --> set the vector from last
            // move to this vector so the next mouse move calculation is possible
            this.cameraRay = camRay;
        }
        
        cameraRay(event, this.renderer, this.mouseMoveCameraRay);
        let tParams = aabbRayIntersect(cardAsABox, {ro: this.renderer.pos, rd: this.mouseMoveCameraRay});
        let minParam = 100;

        //console.log(tParams);
        //console.log("!!!!!!!!!!");
        if(tParams.hit)
        {
            for(let t in tParams)
            {
                let indexedParam = tParams[t];
                if(Math.sign(indexedParam) > 0 && indexedParam != true)
                {
                    // (IAN) Delete this hacky magic number
                    if(indexedParam < minParam && indexedParam > 4.9)
                    {
                        minParam = indexedParam;
                    }
                }
            }
        }
        
        console.log(minParam);
        this.renderer.renderables[0].intersectionParam = minParam;
        this.renderer.renderables[0].rayDir = this.mouseMoveCameraRay;
    }
    mouseUp = event => 
    {
        // camera rotation:
        if(this.cardClicked)
        {
            this.cardClicked = false;
            this.isSpinning = true;
            this.spinTimer = this.spinTimeLength;
        }
    }
    update(t, dt)
    {
        if(this.isSpinning)
        {
            // mat4.rotateY(
            //     this.objects[0].modelMatrix,
            //     this.objects[0].modelMatrix,
            //     this.spinSign * this.angle * Math.exp(-(this.spinTimeLength - this.spinTimer)));

            let rotMat = mat4.create();
            mat4.rotateY(rotMat, rotMat, this.spinSign * this.spinSign * this.angle * Math.exp(-(this.spinTimeLength - this.spinTimer)));
            vec4.transformMat4(this.renderer.pos, this.renderer.pos, rotMat);

            this.totalAngle += this.angle;
            this.spinTimer -= dt;

            if(this.spinTimer <= 0)
            {
                //console.log(this.totalAngle);
                //console.log(this.totalAngle % (Math.PI));
                this.spinTimer = 0;
                this.totalAngle = 0;
                this.isSpinning = false;
            }
        }   
    }
}