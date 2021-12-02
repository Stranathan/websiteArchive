// cubieWidth = cubieLen / 2 and is a model property, saved in settings
//
// rayDir should be normalized for dot product properties

// if it returns vec3.zero, there was no intersection, should make this more general ideally
function rayCubieSideIntersection(cubiePos, camPos, rayDir)
{
    //console.log("cubiePos ==" + vec3.str(cubiePos));
    let cubieWidth = 1;

    let theIntersectionPos;
    let intersectionPositions = [];

    // points on plane for ray-plane intersection:
    let planeObjects = 
    [
        {point: [cubiePos[0] + cubieWidth, cubiePos[1]             , cubiePos[2]              ], normal: [ 1,  0,  0]},
        {point: [cubiePos[0] - cubieWidth, cubiePos[1]             , cubiePos[2]              ], normal: [-1,  0,  0]},
        {point: [cubiePos[0]             , cubiePos[1] + cubieWidth, cubiePos[2]              ], normal: [ 0,  1,  0]},
        {point: [cubiePos[0]             , cubiePos[1] - cubieWidth, cubiePos[2]              ], normal: [ 0, -1,  0]},
        {point: [cubiePos[0]             , cubiePos[1]             , cubiePos[2] + cubieWidth ], normal: [ 0,  0,  1]},
        {point: [cubiePos[0]             , cubiePos[1]             , cubiePos[2] - cubieWidth ], normal: [ 0,  0, -1]}
    ]

    for(let i in planeObjects)
    {
        // console.log(i);
        // console.log(planeObjects[i].point);
        let intersection = rayPlaneIntersection(camPos, rayDir, planeObjects[i].point,  planeObjects[i].normal);
    
        let intersectionPos = vec3.create();
        
        if(intersection.flag)
        {
            vec3.scaleAndAdd(intersectionPos, camPos, rayDir, intersection.d)
            if(rayQuadIntersection(intersectionPos, cubiePos, cubieWidth))
            {
                intersectionPositions.push(intersectionPos);
            }
        }
    }
    
    // Get shortest intersection
    for(let i in intersectionPositions)
    {
        if(i == 0)
        {
            theIntersectionPos = vec3.fromValues(intersectionPositions[i][0], intersectionPositions[i][1], intersectionPositions[i][2]);
        }
        else
        {
            if(vec3.squaredDistance(intersectionPositions[i], camPos) < vec3.squaredDistance(theIntersectionPos, camPos))
            {
                vec3.set(theIntersectionPos, intersectionPositions[i][0], intersectionPositions[i][1], intersectionPositions[i][2]);
            }
        }
    }

    if(theIntersectionPos)
    {
        return theIntersectionPos;
    }
}

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
