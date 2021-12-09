function rayQuadIntersection(rayPlaneIntersectionPos, cubiePos, cubieWidth)
{
	return (
          (cubiePos[0] - cubieWidth) <= rayPlaneIntersectionPos[0] &&
          (cubiePos[0] + cubieWidth) >= rayPlaneIntersectionPos[0] &&
          (cubiePos[1] - cubieWidth) <= rayPlaneIntersectionPos[1] &&
          (cubiePos[1] + cubieWidth) >= rayPlaneIntersectionPos[1] &&
          (cubiePos[2] - cubieWidth) <= rayPlaneIntersectionPos[2] &&
          (cubiePos[2] + cubieWidth) >= rayPlaneIntersectionPos[2]
         );
}

function rayPlaneIntersection(ro, rd, pointOnPlane, normal)
{  
	let denominator = vec3.dot(rd, normal);
  
	if( denominator == 0)
    {
        return {d: 0, flag: false, p: pointOnPlane};
    }
    else
    {
        let fromCam2PointOnPlane = vec3.create();
        let numerator = vec3.subtract(fromCam2PointOnPlane, pointOnPlane,  ro)
        let d = vec3.dot( numerator , normal ) / denominator;
        
        // if ray direction is going away from the plane
        if(d < 0)
        {
            return {d: 0, flag: false, p: pointOnPlane};
        }
        else
        {
            return {d: d, flag: true, p: pointOnPlane};
        }
    }
}