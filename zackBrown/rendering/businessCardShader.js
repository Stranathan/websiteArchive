var businessCardShaderVS = `#version 300 es

precision highp float;

layout (location=0) in vec3 vertexPos;
layout (location=1) in vec2 a_texcoord;
// layout (location=1) in vec3 vertexNormal;
// layout (location=2) in vec4 vertexColor;

out vec2 v_texcoord;
out vec3 v_intersectionPos;
out vec3 v_pos;

//
uniform vec3 viewPos;
uniform vec3 rayDir;
uniform float intersectionParam;
//
uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main()
{
    gl_Position = projection * view * model * vec4(vertexPos, 1.0);
    vec3 tmpPos = viewPos + intersectionParam * rayDir;
    v_intersectionPos = vec3( tmpPos ) ;
    v_texcoord = a_texcoord;
    v_pos = vec3(vertexPos );
}
`

var businessCardShaderFS = `#version 300 es

precision highp float;

in vec2 v_texcoord;
in vec3 v_intersectionPos;
in vec3 v_pos;

out vec4 fragColor;
//
//
uniform vec2 resolution;
uniform float time;

uniform sampler2D u_texture;

void main()
{
    //vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.y;
    float len = length(v_pos - v_intersectionPos);
    vec3 col = vec3(len);
    vec4 texSample = texture(u_texture, vec2(v_texcoord.x, -v_texcoord.y));
    fragColor = vec4(texSample.xyz * len, 1.0);
}`