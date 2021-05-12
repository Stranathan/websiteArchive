var mouseEffectVS = `#version 300 es

precision highp float;

in vec3 vertexPos;

void main()
{
    gl_Position = vec4(vertexPos, 1.0);
}
`
var mouseEffectFS = `#version 300 es

precision highp float;

out vec4 fragColor;

uniform float time;
uniform vec2 resolution;
uniform vec2 mousePositions[20];

float circle(vec2 uv, vec3 circlePosAndRadius)
{
    return (1. - smoothstep(circlePosAndRadius.z, circlePosAndRadius.z + 0.005, length(uv - circlePosAndRadius.xy)));
}
vec3 when_gt(vec3 x, vec3 y) 
{
    return max(sign(x - y), 0.0);
}
float when_gt(float x, float y) 
{
    return max(sign(x - y), 0.0);
}
vec3 when_lt(vec3 x, vec3 y) 
{
    return max(sign(y - x), 0.0);
}
float when_lt(float x, float y) 
{
    return max(sign(x - y), 0.0);
}
float smin( float a, float b, float k )
{
    float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
    return mix( b, a, h ) - k*h*(1.0-h);
}
float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

#define OCTAVES 6
float fbm (in vec2 st) {
    // Initial values
    float value = 0.0;
    float amplitude = .5;
    float frequency = 0.;
    //
    // Loop of octaves
    for (int i = 0; i < OCTAVES; i++) {
        value += amplitude * noise(st);
        st *= 2.;
        amplitude *= .5;
    }
    return value;
}
void main()
{
    vec2 uv = ( gl_FragCoord.xy -.5 * resolution.xy ) / resolution.y;

    float distFieldContraction = 32.; // [4, 10] :: [i = 20, i = 1]

    float val = distFieldContraction * length(uv - mousePositions[0]);

    float nextVal;

    float interpolationVar;

    for(int i = 1; i < 20; i++)
    {
        interpolationVar = float(i) / 20.; // could do something fancier with easing function
        distFieldContraction = mix(16., 8., interpolationVar);
        nextVal = distFieldContraction * length(uv - mousePositions[i]);
        val = smin(val, nextVal, 0.9); 
    }
    vec3 col = vec3(smoothstep(1.5, 1.5 + 0.02, val));
    
    fragColor = vec4(col, when_lt(col, vec3(0.95)));
}
`
