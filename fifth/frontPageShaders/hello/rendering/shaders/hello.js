var helloVS = `#version 300 es

precision highp float;

layout (location=0) in vec3 vertexPos;

void main()
{
    gl_Position =  vec4(vertexPos, 1.0);
}
`

var helloFS = `#version 300 es

precision highp float;

out vec4 fragColor;

uniform vec2 resolution;
uniform float time;

void main()
{
    vec2 uv = 2. * (gl_FragCoord.xy / resolution) - 1.;
    uv.x *= resolution.x / resolution.y;
    uv *= 2.;
    float len = length(uv - vec2(0.5 * (sin(time) + 2. * sin(2. * time)), 0.5 * (cos(time) - 2. * cos(2. * time))));
    float s = 1. - smoothstep(0.1, 0.1 + 0.01 * sin(2. * time), len);
    vec3 col = vec3(1.0, 0., 1.0) * s;
    fragColor = vec4(col, 1.);
}`