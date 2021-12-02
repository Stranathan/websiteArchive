var businessCardShaderVS = `#version 300 es

precision highp float;

layout (location=0) in vec3 vertexPos;
layout (location=1) in vec2 a_texcoord;
// layout (location=1) in vec3 vertexNormal;
// layout (location=2) in vec4 vertexColor;

out vec2 v_texcoord;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main()
{
    gl_Position = projection * view * model * vec4(vertexPos, 1.0);
    //gl_Position = projection * view * vec4(vertexPos, 1.0);
    v_texcoord = a_texcoord;
}
`

var businessCardShaderFS = `#version 300 es

precision highp float;

//in vec4 v_Col;
in vec2 v_texcoord;

out vec4 fragColor;

uniform vec2 resolution;
uniform float time;

uniform sampler2D u_texture;

void main()
{
    //vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.y;
    vec3 col = vec3(1., 0., 0.9);
    vec4 texSample = texture(u_texture, vec2(v_texcoord.x, -v_texcoord.y));
    fragColor = vec4(texSample.xyz, 1.0);
}`