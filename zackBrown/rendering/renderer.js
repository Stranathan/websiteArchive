class Renderer 
{
    constructor(gl, pos, up)
    {
        this.gl = gl;
        this.pos = pos;
        this.up = up;
        this.target = vec3.fromValues(0.0, 0.0, 0.0);
        this.aspectRatio = this.gl.canvas.width / this.gl.canvas.height;
        //
        this.maxRadius = 5; // ijwebfibn
        //
        this.view = mat4.create();
        this.projection = mat4.create();
        this.renderables = new Array();
        //
        this.loaded = false;
        this.texture = this.gl.createTexture();
        this.image = new Image();
        //this.image.src = "misc/card.png";
        this.image.src = "misc/cardImages/ZackBrown-02.png"
        this.image.addEventListener('load', this.imageLoad);
        //
        this.init();
    }
    init()
    {
        // Set camera transformation matrices:
        mat4.lookAt(this.view, [this.pos[0], this.pos[1], this.pos[2]], this.target, [this.up[0], this.up[1], this.up[2]]);
        mat4.perspective(this.projection, Math.PI / 4., (this.gl.canvas.width / this.gl.canvas.height), 1, 100);
        
        // Set GL state
        this.gl.clearColor(CLEAR_COL[0], CLEAR_COL[1], CLEAR_COL[2], CLEAR_COL[3]); // see settings
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.BLEND)
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        // use texture unit 0
        this.gl.activeTexture(this.gl.TEXTURE0 + 0);
        // bind to the TEXTURE_2D bind point of texture unit 0
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        // Fill the texture with a 1x1 blue pixel.
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE,
                        new Uint8Array([0, 0, 255, 255]));
        // Load image resources
        // image load callback
    }
    imageLoad = event => 
    {
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.image);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        this.loaded = true;
    }
    addARenderable(aRenderable)
    {
        this.renderables.push(aRenderable);
    }
    render(time)
    {
        if(this.loaded)
        {
            resize(this.gl.canvas);
            this.gl.clear(this.gl.DEPTH_BUFFER_BIT | this.gl.COLOR_BUFFER_BIT);
            this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
            this.aspectRatio = this.gl.canvas.width / this.gl.canvas.height;

            mat4.lookAt(this.view, [this.pos[0], this.pos[1], this.pos[2]], this.target, [this.up[0], this.up[1], this.up[2]]); 
            mat4.perspective(this.projection, Math.PI / 4., (this.gl.canvas.width / this.gl.canvas.height), 1, 100);
        
            for(let i in this.renderables)
            {
                this.renderables[i].render(time);
            }
        }
    }
    update(t, dt)
    {
        this.render(t);
    }
}