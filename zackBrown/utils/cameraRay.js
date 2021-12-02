
function cameraRay(event, renderer, rayVector)
{
    // Normalized mouse coords
    let mouseClickX = event.offsetX;
    mouseClickX = (2. * mouseClickX / renderer.gl.canvas.width - 1.);
    let mouseClickY = event.offsetY;
    mouseClickY = -1 * (2. * mouseClickY / renderer.gl.canvas.height - 1.);

    // #---------- RAY CASTING -------------#
    // RAY IN NDC SPACE
    let ray_clip = vec4.fromValues(mouseClickX, mouseClickY, -1.0, 1.0);
    let inverseProjectionMatrix = mat4.create();
    mat4.invert(inverseProjectionMatrix, renderer.projection);

    vec4.transformMat4(ray_clip, ray_clip, inverseProjectionMatrix);
    // we only needed to un-project the x,y part,
    // so let's manually set the z, w part to mean "forwards, and not a point
    let ray_eye = vec4.fromValues(ray_clip[0], ray_clip[1], -1.0, 0.0);

    let inverseViewMatrix = mat4.create();
    mat4.invert(inverseViewMatrix, renderer.view);
    let tmp = vec4.create();
    vec4.transformMat4(tmp, ray_eye, inverseViewMatrix);
    
    // let clickRayDirWorld = vec3.fromValues(tmp[0], tmp[1], tmp[2]);
    // vec3.normalize(clickRayDirWorld, clickRayDirWorld);

    vec3.set(rayVector, tmp[0], tmp[1], tmp[2]);
    vec3.normalize(rayVector, rayVector);
}