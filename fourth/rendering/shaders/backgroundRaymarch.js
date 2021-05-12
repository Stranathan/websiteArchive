var backgroundRaymarchVS = `#version 300 es

precision highp float;

in vec3 vertexPos;

uniform float time;
uniform mat4 view;
uniform mat4 projection;
uniform mat4 model;

void main()
{
    gl_Position = vec4(vertexPos, 1.0);
}
`

var backgroundRaymarchFS = `#version 300 es

precision highp float;

out vec4 fragColor;

uniform float time;
uniform vec2 resolution;

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
float when_gt(float x, float y) 
{
    return max(sign(x - y), 0.0);
}
float random (vec2 st) 
{
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))
                 * 43758.5453123);
}
void main()
{
    vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy)/ resolution.y;
    vec3 ro = vec3(0., 1., 0.) - vec3(.0, 0., time);

    // zoinks
    // vec3 rd = normalize(vec3(uv,0.) - (ro - iTime));
    vec3 rd = normalize(vec3(uv,2.0));

    float dist = raymarch(ro, rd);

    float fog = 1.0 / (0.3 + (dist * dist * 0.002));
    fog = clamp(fog, 0., 1.3);    

    fragColor = vec4(fog * vec3(0.43, 0.50, 0.56),1.0);
}
`
