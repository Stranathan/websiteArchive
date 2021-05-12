var trefoilVS = `#version 300 es

precision highp float;

layout (location=0) in vec3 vertexPos;

void main()
{
    gl_Position =  vec4(vertexPos, 1.0);
}
`

var trefoilFS = `#version 300 es

precision highp float;

out vec4 fragColor;

uniform vec2 resolution;
uniform float time;

float normalizeOnRange(float a, float b, float x)
{
    float xx = clamp(x, a, b);
    return (b - xx)/(b - a);
}
float smin( float a, float b, float k )
{
    float h = max( k-abs(a-b), 0.0 )/k;
    return min( a, b ) - h*h*k*(1.0/4.0);
}
float circ(float rad, float blur, vec2 st){
    
    float s = 1. - smoothstep(rad, rad + blur, length(st));
    return s;
}

vec2 trefoilPos(float time, float scale, float offset)
{
    return vec2(scale * (sin(time - offset) + 2. * sin(2. * (time - offset))) ,
                -scale * (cos(time - offset) - 2. * cos(2. * (time - offset)))
                );
}

#define C_RADIUS (0.05)
#define PATH_SCALE (0.3)
#define NUM_CIRCLES (30)
void main()
{
    vec2 uv = 2. * gl_FragCoord.xy/resolution.xy - 1.;
    uv.x *= resolution.x / resolution.y;
    uv.y += 0.15;

    float val = 1.;
    for(int i = 0; i < NUM_CIRCLES; i++)
    {
        float ii = float(i);
        float aval = length(uv - trefoilPos(time * (1.5/ii), PATH_SCALE, ii));
        val = smin(val, aval, .3 * ii / float(NUM_CIRCLES));
    }
    vec3 col = vec3(smoothstep(C_RADIUS, C_RADIUS / 10., val));
    fragColor = vec4(col,1.0);
}`