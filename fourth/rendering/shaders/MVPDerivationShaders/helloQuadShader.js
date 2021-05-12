var matrixTestVS = `#version 300 es

precision highp float;

in vec3 vertexPos;

uniform float time;
uniform mat4 view;
uniform mat4 projection;
uniform mat4 model;

void main() 
{
    // helloQuad
    gl_Position =  vec4(vertexPos, 1.0);
}
`

var matrixTestFS = `#version 300 es

precision highp float;

out vec4 fragColor;

uniform float time;
uniform vec2 resolution;

#define PI (3.1415)

void main()
{
    vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy)/ resolution.y;
    vec3 col = 0.5 + 0.5*cos(time +uv.xyx + vec3(0,2,4));
    fragColor = vec4(col, 1.);
}
`