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
    // gl_Position =  vec4(vertexPos, 1.0);

    // model test
    //gl_Position =  model * vec4(vertexPos, 1.0);
    
    // view test
    //gl_Position =  model * round(view * vec4(vertexPos, 1.0));

    // projection test
    vec4 pos =   model * round(view * vec4(vertexPos, 1.0));
    pos.z -= 5. * abs(sin(0.2 * time)) + 1.;
    vec4 projPos = projection * pos;
    projPos /= projPos.w;
    gl_Position = projPos;
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