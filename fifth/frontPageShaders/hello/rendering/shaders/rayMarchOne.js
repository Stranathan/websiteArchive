var rayMarchOneVS = `#version 300 es

precision highp float;

layout (location=0) in vec3 vertexPos;

void main()
{
    gl_Position =  vec4(vertexPos, 1.0);
}
`
var rayMarchOneFS = `#version 300 es

precision highp float;

out vec4 fragColor;

uniform vec2 resolution;
uniform float time;

#define RAYMARCH_STEPS 70
#define MIN_DIST .001

float sdSphere( vec3 p, float s )
{
  return length(p)-s;
}

float map(vec3 p)
{
    vec3 q = mod(p + 1.0, 2.) - 1.0;
    return sdSphere(q, .2);
}

float raymarch(vec3 ro, vec3 rd)
{
	float t = 0.0;
    
    for(int i = 0; i < RAYMARCH_STEPS; ++i)
    {
        vec3 p = ro + rd * t; 
    	float d = map(p);
        
        if (d < MIN_DIST){
        	break;
        }
        
        t += min(d, 1.0);
    }
    return t;
}

#define tc 0.05

void main()
{
    vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy)/resolution.y;
    vec3 ro = vec3(sin(tc * time) + 2. * sin(2. * tc * time), 1.3, cos(tc * time) - 2. * cos(2. * tc * time));
	//vec3 rd = normalize(vec3(uv, 2.));
    
    //--------------------------------
    vec3 worldUp = vec3(0.0, 1.0, 0.0);
    vec3 target = vec3(0.);
    vec3 forward = normalize(ro - target);
    vec3 right = normalize(cross(worldUp, forward));
    vec3 up = cross(forward, right);
    
    float focalLen = 2.0;
    vec3 newOrigin = ro - focalLen * forward;
    vec3 newUV = newOrigin + uv.x * right + newOrigin + uv.y * up;
    vec3 rd = normalize(newUV - (newOrigin - ro));
    //--------------------------------

    float dist = raymarch(ro, rd);
    
    float fog = 1.0 / (0.3 + dist * dist * 0.002);
    
    fog = clamp(fog, 0., 1.);
    fragColor = vec4(fog * vec3(0.43, 0.50, 0.56),1.0);
}`