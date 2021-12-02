function rayQuadIntersection(rayPlaneIntersectionPos)
{
    let w = 1.75;
    let h = 1.0;

	return (
          -w <= rayPlaneIntersectionPos[0] &&
           w >= rayPlaneIntersectionPos[0] &&
          -h <= rayPlaneIntersectionPos[1] &&
           h >= rayPlaneIntersectionPos[1]
         );
}
//function rayPlaneIntersection(ro, rd, pointOnPlane, normal)
function rayPlaneIntersection(ro, rd)
{  
    // ---------
    // d = (pointOnPlane - ro) dot normal / ( rd dot normal)
    // ---------
    let pointOnPlane = vec3.fromValues(0., 0., 0.);
    let normal = vec3.fromValues(0., 0., 1);
	let denominator = vec3.dot(rd, normal);

	if( denominator == 0)
    {
        return {d: 0, flag: false};
    }
    else
    {
        let fromCam2PointOnPlane = vec3.create();
        let numerator = vec3.subtract(fromCam2PointOnPlane, pointOnPlane,  ro)
        let d = vec3.dot( numerator , normal ) / denominator;
        
        // if ray direction is going away from the plane
        if(d < 0)
        {
            return {d: 0, flag: false};
        }
        else
        {
            return {d: d, flag: true};
        }
    }
}

function intersectionCard(ro, rd)
{
    let intersectionObj = rayPlaneIntersection(ro, rd);

    if(intersectionObj.flag)
    {
        let p = vec3.create();
        let s = vec3.create();
        vec3.scale(s, rd, intersectionObj.d);
        vec3.add(p, ro, s);

        if(rayQuadIntersection(p))
        {
            console.log("gotHim");
            return p;
        }
        else
        {
            console.log("missedHim");
            return ([0., 0., 0.]);
        }
    }
}