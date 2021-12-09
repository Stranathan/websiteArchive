/*
 *     A RubiksCube is a cubie vao that is instanced according to
 *     a transformation matrix array resembling a rubiks cube
 */

class BusinessCardRenderable
{
    constructor(aRenderer, mMatrix)
    {
        this.renderer = aRenderer;
        //
        this.intersectionParam = 0;
        this.rayDir = vec3.create();
        //
        this.halfLen = CARD_PARAMS[0];
        this.halfWidth = CARD_PARAMS[1]
        this.halfThickness = CARD_PARAMS[2];

        this.modelData = [
            
            // FRONT
             this.halfLen,  this.halfWidth,   this.halfThickness,      0.469, 0.684,
            -this.halfLen,  this.halfWidth,   this.halfThickness,      0.0,   0.684,
            -this.halfLen, -this.halfWidth,   this.halfThickness,      0.0,   0.0,

             this.halfLen,  this.halfWidth,   this.halfThickness,      0.469, 0.684,
            -this.halfLen, -this.halfWidth,   this.halfThickness,      0.0,   0.0,
             this.halfLen, -this.halfWidth,   this.halfThickness,      0.469, 0.0,
            // BACK
            this.halfLen,  this.halfWidth,   -this.halfThickness,      -0.469, 0.684,
            -this.halfLen,  this.halfWidth,  -this.halfThickness,      -0.0,   0.684,
            -this.halfLen, -this.halfWidth,  -this.halfThickness,      -0.0,   0.0,

             this.halfLen,  this.halfWidth,  -this.halfThickness,      -0.469, 0.684,
            -this.halfLen, -this.halfWidth,  -this.halfThickness,      -0.0,   0.0,
             this.halfLen, -this.halfWidth,  -this.halfThickness,      -0.469, 0.0,
            // LEFT SIDE
            this.halfLen,  this.halfWidth,   -this.halfThickness,      0.9, 0.9,
            this.halfLen,  this.halfWidth,    this.halfThickness,      0.9, 0.9,
            this.halfLen, -this.halfWidth,    this.halfThickness,      0.9, 0.9,

            this.halfLen,  this.halfWidth,   -this.halfThickness,      0.9, 0.9,
            this.halfLen, -this.halfWidth,    this.halfThickness,      0.9, 0.9,
            this.halfLen, -this.halfWidth,   -this.halfThickness,      0.9, 0.9,
            // RIGHT SIDE
           -this.halfLen,  this.halfWidth,   -this.halfThickness,      0.9, 0.9,
           -this.halfLen,  this.halfWidth,    this.halfThickness,      0.9, 0.9,
           -this.halfLen, -this.halfWidth,    this.halfThickness,      0.9, 0.9,

           -this.halfLen,  this.halfWidth,   -this.halfThickness,      0.9, 0.9,
           -this.halfLen, -this.halfWidth,    this.halfThickness,      0.9, 0.9,
           -this.halfLen, -this.halfWidth,   -this.halfThickness,      0.9, 0.9,

            // TOP
            this.halfLen,  this.halfWidth,   -this.halfThickness,      0.9, 0.9,
           -this.halfLen,  this.halfWidth,   -this.halfThickness,      0.9, 0.9,
           -this.halfLen,  this.halfWidth,    this.halfThickness,      0.9, 0.9,

            this.halfLen,  this.halfWidth,   -this.halfThickness,      0.9, 0.9,
           -this.halfLen,  this.halfWidth,    this.halfThickness,      0.9, 0.9,
            this.halfLen,  this.halfWidth,    this.halfThickness,      0.9, 0.9,

            //BOTTOM
            // TOP
            this.halfLen,  -this.halfWidth,   -this.halfThickness,      0.9, 0.9,
           -this.halfLen,  -this.halfWidth,   -this.halfThickness,      0.9, 0.9,
           -this.halfLen,  -this.halfWidth,    this.halfThickness,      0.9, 0.9,

            this.halfLen,  -this.halfWidth,   -this.halfThickness,      0.9, 0.9,
           -this.halfLen,  -this.halfWidth,    this.halfThickness,      0.9, 0.9,
            this.halfLen,  -this.halfWidth,    this.halfThickness,      0.9, 0.9,
        ];
        
        this.vao;
        this.vbo;
        //
        this.modelMatrix = mMatrix;
        //
        this.vertCount = this.modelData.length / 5;
        this.primitiveType = this.renderer.gl.TRIANGLES;
        this.program;
        this.uniforms;

        // set program & vao
        this.setVAO();
        this.setProgram();

        // add it to renderer (RAII)
        this.renderer.addARenderable(this);
    }
    setVAO()
    {
        this.vao = this.renderer.gl.createVertexArray();
        this.renderer.gl.bindVertexArray(this.vao);
        this.vbo = this.renderer.gl.createBuffer();
        this.renderer.gl.bindBuffer(this.renderer.gl.ARRAY_BUFFER, this.vbo);
        this.renderer.gl.bufferData(this.renderer.gl.ARRAY_BUFFER, new Float32Array(this.modelData), this.renderer.gl.STATIC_DRAW);
        this.renderer.gl.vertexAttribPointer(positionAttribLoc, 3, this.renderer.gl.FLOAT, false, (5 * 4), 0);
        this.renderer.gl.enableVertexAttribArray(positionAttribLoc);
        this.renderer.gl.vertexAttribPointer(texCoordAttribLoc, 2, this.renderer.gl.FLOAT, false, (5 * 4), (3 * 4));
        this.renderer.gl.enableVertexAttribArray(texCoordAttribLoc);
        // this.renderer.gl.vertexAttribPointer(positionAttribLoc, 3, this.renderer.gl.FLOAT, false, (10 * 4), 0);
        // this.renderer.gl.enableVertexAttribArray(positionAttribLoc);
        // this.renderer.gl.vertexAttribPointer(normalAttribLoc, 3, this.renderer.gl.FLOAT, false, (10 * 4), (3 * 4));
        // this.renderer.gl.enableVertexAttribArray(normalAttribLoc);
        // this.renderer.gl.vertexAttribPointer(colorAttribLoc, 4, this.renderer.gl.FLOAT, false, (10 * 4), (6 * 4));
        // this.renderer.gl.enableVertexAttribArray(colorAttribLoc);
    }
    setProgram()
    {
        this.program = createProgramFromSources(this.renderer.gl, businessCardShaderVS, businessCardShaderFS);
        this.uniforms = 
        { 
            resolution: this.renderer.gl.getUniformLocation(this.program, "resolution"),
            time: this.renderer.gl.getUniformLocation(this.program, "time"),
            intersectionParam: this.renderer.gl.getUniformLocation(this.program, "intersectionParam"),
            viewPos: this.renderer.gl.getUniformLocation(this.program, "viewPos"),
            rayDir: this.renderer.gl.getUniformLocation(this.program, "rayDir"),
            model: this.renderer.gl.getUniformLocation(this.program, "model"),
            view: this.renderer.gl.getUniformLocation(this.program, "view"),
            projection: this.renderer.gl.getUniformLocation(this.program, "projection")
        };
    }

    render(time)
    {
        this.renderer.gl.bindVertexArray(this.vao);
        this.renderer.gl.useProgram(this.program);
        //
        this.renderer.gl.uniform1f(this.uniforms["time"], time);
        this.renderer.gl.uniform2f(this.uniforms["resolution"], this.renderer.gl.canvas.width, this.renderer.gl.canvas.height);
        this.renderer.gl.uniform3f(this.uniforms["viewPos"], this.renderer.pos[0], this.renderer.pos[1], this.renderer.pos[2]);
        this.renderer.gl.uniform3f(this.uniforms["rayDir"], this.rayDir[0], this.rayDir[1], this.rayDir[2]);
        this.renderer.gl.uniform1f(this.uniforms["intersectionParam"], this.intersectionParam);
        this.renderer.gl.uniformMatrix4fv(this.uniforms["model"], false, this.modelMatrix); 
        this.renderer.gl.uniformMatrix4fv(this.uniforms["view"], false, this.renderer.view); 
        this.renderer.gl.uniformMatrix4fv(this.uniforms["projection"], false, this.renderer.projection);
        //
        this.renderer.gl.drawArrays(this.primitiveType, 0, this.vertCount);
        // this.renderer.gl.drawArraysInstanced(this.primitiveType, 0, this.vertCount, NUM_CUBIES);
    }
}