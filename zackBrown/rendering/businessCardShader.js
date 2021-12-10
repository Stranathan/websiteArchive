var businessCardShaderVS = `#version 300 es

precision highp float;

layout (location=0) in vec3 vertexPos;
layout (location=1) in vec2 a_texcoord;
// layout (location=1) in vec3 vertexNormal;
// layout (location=2) in vec4 vertexColor;

out vec2 v_texcoord;
out vec3 v_intersectionPos;
out vec3 v_pos;
out vec3 v_mousePositions[20];
//
uniform vec3 viewPos;
uniform vec3 rayDir;
uniform float intersectionParam;
uniform float tValues[20];
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
    v_pos = vec3(vertexPos ); // CHANGE ME

    for(int i = 0; i < 20; i++)
    {
        v_mousePositions[i] = viewPos + tValues[i] * rayDir;
    }
    // v_tValues = tValues;
}
`

var businessCardShaderFS = `#version 300 es

precision highp float;

in vec2 v_texcoord;
in vec3 v_intersectionPos;
in vec3 v_pos;
in vec3 v_mousePositions[20];
//
out vec4 fragColor;
//
uniform vec2 resolution;
uniform float time;
uniform sampler2D u_texture;

float smin( float a, float b, float k )
{
    float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
    return mix( b, a, h ) - k*h*(1.0-h);
}

void main()
{
    // float len = smoothstep(0.3, 0.31, length(v_pos - v_intersectionPos));
    // vec3 col = vec3(len);
    vec4 texSample = texture(u_texture, vec2(v_texcoord.x, -v_texcoord.y));
    // fragColor = vec4(texSample.xyz * len, 1.0);

    // -------------------------------------------

    float val = length(v_pos - v_mousePositions[0]);
    float nextVal;

    for(int i = 1; i < 20; i++)
    {
        nextVal = length(v_pos - v_mousePositions[i]);
        val = smin(val, nextVal, float(i) * 0.2 / 19.0); 
    }
    vec3 col = vec3(smoothstep(0.2, 0.21, val));
    fragColor = vec4(texSample.xyz * col, 1.);
}`