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
    float len = length(uv - vec2(0., 1.));
    float s = 1. - smoothstep(0.3, 0.31, len);
    vec3 col = vec3(1.0, 0., 1.0) * s;
    fragColor = vec4(col, 1.);
}`