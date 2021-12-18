class InputManager
{
    constructor(aRenderer, objs)
    {
        this.objects = objs;

        this.renderer = aRenderer;
        this.gl = aRenderer.gl;
        //
        this.cameraRay = vec3.create();
        this.mouseMoveCameraRay = vec3.create();
        this.p1 = vec3.create();
        this.p2 = vec3.create();
        this.mousePos = [0, 0];
        //
        this.mouseIsHittingCard = true;
        //
        this.tTime = 0.5; // modded seconds in update
        this.tIndex = 0;
        this.tValues = [
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        ];
        //;
        this.cardClicked = false;
        this.isSpinning = false;
        this.spinSign = 0;
        this.totalAngle = 0;
        this.spinTimeLength = 5;
        this.spinTimer = 0.0;
        this.angle = 0;
        
        window.addEventListener( "mousedown", this.mouseDown);
        window.addEventListener( "mousemove", this.mouseMove);
        window.addEventListener( "mouseup",   this.mouseUp);
    }
    mouseDown = event => 
    {
        // get world ray from camera
        cameraRay(event, this.renderer, this.cameraRay, this.mousePos);
        this.cardClicked = aabbRayIntersect(cardAsABox, {ro: this.renderer.pos, rd: this.cameraRay}).hit;
        let t = this.checkPlaneIntersection(this.cameraRay);
        this.rayPosFromParam(t, this.cameraRay, this.p1)
        //console.log(vec3.str(this.p1));
    }

    mouseMove = event => 
    {
        if(this.cardClicked)
        {
            let camRay = vec3.create();
            cameraRay(event, this.renderer, camRay, this.mousePos);
            this.angle = vec3.angle(this.cameraRay, camRay) / ANGLE_SPEED_MULTIPLIER;
            let t = this.checkPlaneIntersection(camRay);
            // get position on plane
            this.rayPosFromParam(t, camRay, this.p2);
            this.spinSign = Math.sign((this.p2[0] - this.p1[0]) * (-1 * vec3.dot(camRay, WORLD_FORWARD))); // correcting for camera rotation
            let rotMat = mat4.create();
            mat4.rotateY(rotMat, rotMat, this.angle * -this.spinSign);
            vec4.transformMat4(this.renderer.pos, this.renderer.pos, rotMat);
            // (IAN) don't forget to rotate up vec if decide to rotate around a differet
            //
            this.totalAngle += this.angle;
            // we need to get the angle per mouse move, --> set the vector from last
            // move to this vector so the next mouse move calculation is possible
            this.cameraRay = camRay;
        }
        
        // Update mouse position
        let mouseClickX = event.offsetX;
        this.mousePos[0] = (2. * mouseClickX / this.renderer.gl.canvas.width - 1.);
        let mouseClickY = event.offsetY;
        this.mousePos[1] = -1 * (2. * mouseClickY / this.renderer.gl.canvas.height - 1.);

        // check to see if mouse is over card for use in update (cheaper than doing in update)
        cameraRayNoEvent(this.renderer, this.mouseMoveCameraRay, this.mousePos)
        // raycast
        this.mouseIsHittingCard = aabbRayIntersect(cardAsABox, {ro: this.renderer.pos, rd: this.mouseMoveCameraRay}).hit;
   
        // move all t-positions down
        for(let i = this.tValues.length - 1; i > 0; i--)
        {
            this.tValues[i] = this.tValues[i - 1];
        }

        console.log(this.tValues);
    }
    mouseUp = event => 
    {
        // camera rotation:
        if(this.cardClicked)
        {
            this.p1 = vec3.create();
            this.p2 = vec3.create();

            this.cardClicked = false;
            this.isSpinning = true;
            this.spinTimer = this.spinTimeLength;
        }
    }
    checkPlaneIntersection(aRay)
    {
        let ro = [this.renderer.pos[0], this.renderer.pos[1], this.renderer.pos[2]];
        let pointOnAPlane = [0, 0, 0];
        // which plane are we testing for intersection?
        if(vec3.dot(aRay, WORLD_FORWARD) > 0)
        {
            // then it's the front plane
            // A is our point on the plane :: preload
            pointOnAPlane = cardAsABox.A;
        }
        else
        {
            // it's the back plane
            // B is our point on the back plane :: preload
            pointOnAPlane = cardAsABox.B;
        }
        // get the parametric data for ray length for this plane
        let intersectionData = rayPlaneIntersection(ro, aRay, pointOnAPlane, WORLD_FORWARD)
        return intersectionData.d;
    }
    rayPosFromParam(t, aRayDir, p)
    {
        let ro = [this.renderer.pos[0], this.renderer.pos[1], this.renderer.pos[2]];
        let tRd = vec3.create();
        vec3.scale(tRd, aRayDir, t);
        vec3.add(p, tRd, ro);
    }
    update(t, dt)
    {
        cameraRayNoEvent(this.renderer, this.mouseMoveCameraRay, this.mousePos)
        // let tParam = 0;
        if(this.mouseIsHittingCard)
        {
            //tParam = this.checkPlaneIntersection(this.mouseMoveCameraRay);
            this.tValues[0] = this.checkPlaneIntersection(this.mouseMoveCameraRay);
        }
        // send uniform data to card renderable
        this.renderer.renderables[0].intersectionParam = 0; //tParam;
        this.renderer.renderables[0].rayDir = this.mouseMoveCameraRay;
        this.renderer.renderables[0].tValues = this.tValues;

        if(this.isSpinning)
        {
            let rotMat = mat4.create();
            mat4.rotateY(rotMat, rotMat,  -this.spinSign * this.angle * Math.exp(-(this.spinTimeLength - this.spinTimer)));
            //mat4.rotateY(rotMat, rotMat, 0);
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