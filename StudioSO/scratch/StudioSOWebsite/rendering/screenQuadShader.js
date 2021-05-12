var screenQuadShaderVS = `#version 300 es

precision highp float;

layout (location=0) in vec3 vertexPos;

void main()
{
    gl_Position = vec4(vertexPos, 1.0);
}
`

var screenQuadShaderFS = `#version 300 es

precision highp float;

out vec4 fragColor;

uniform float time;
uniform vec2 resolution;
uniform vec2 mouse;
uniform sampler2D tex;

void main()
{
    vec2 uv = gl_FragCoord.xy / resolution;
    //
    vec2 uvMouse = uv;
    uvMouse.x *= resolution.x / resolution.y;
    vec2 mousePos = vec2(mouse.x / resolution.x, 1. - (mouse.y / resolution.y));
    mousePos.x *= resolution.x / resolution.y;

    // -------------------
    float len = length(uvMouse - mousePos);
    float circleMask = smoothstep(0.15, 0.15, len);
    
    vec3 invertedTex = (vec3(1.) - texture(tex, uv).xyz) * (1. - circleMask);
    vec3 texSample = texture(tex, uv).xyz * circleMask;
    vec3 col = texSample + invertedTex;

    fragColor = vec4(col, 1.);
}
`
