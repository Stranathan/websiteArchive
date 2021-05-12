var noiseOneVS = `#version 300 es

precision highp float;

layout (location=0) in vec3 vertexPos;

void main()
{
    gl_Position =  vec4(vertexPos, 1.0);
}
`

var noiseOneFS = `#version 300 es

precision highp float;

out vec4 fragColor;

uniform vec2 resolution;
uniform float time;

float random (vec2 st)
{
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

float when_gt(float x, float y)
{
    return max(sign(x - y), 0.0);
}

void main()
{
    vec2 uv = 2. * (gl_FragCoord.xy / resolution) - 1.;
    uv.x *= resolution.x / resolution.y;
    uv.x -= 0.5 * clamp(0.5 * time, 0., 2.) * sin(time);
    float rndFloat = random(floor(uv * 10. + vec2(1.23 * time, 0.)));
    
    float whiteCells = when_gt(rndFloat, 0.5);

    float rndFloat2 = random(floor(uv * 20. + vec2(0., 2.56 * time)));
    
    whiteCells *= when_gt(rndFloat2, 0.5);
    
    float rndFloat3 = random(floor(uv * 50. + vec2(4.32 * time, 4.32 * time)));

    whiteCells *= when_gt(rndFloat3, 0.5);

    vec3 col = vec3(whiteCells);

    // Output to screen
    fragColor = vec4(col,1.0);
}`