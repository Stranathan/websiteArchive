class BusinessCard
{
    constructor(renderer)
    {
        this.modelMatrix = mat4.create();
        mat4.translate(this.modelMatrix, this.modelMatrix, [0., 0., 0.]);
        var renderable = new BusinessCardRenderable(renderer, this.modelMatrix);
    }
    
    update(t, dt)
    {
        //let m = mat4.create();
        //mat4.rotateY(this.modelMatrix, m, t)
        //mat4.rotateY(this.modelMatrix, this.modelMatrix, t);
    }
}