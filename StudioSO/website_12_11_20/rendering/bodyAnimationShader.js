var bodyAnimationVS = `#version 300 es

precision highp float;

layout (location=0) in vec3 vertexPos;
layout (location=1) in vec2 texCoord;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;

out vec2 v_texcoord;

void main()
{
    gl_Position = projection * view * model * vec4(vertexPos, 1.0);
    v_texcoord = texCoord;
}
`

var bodyAnimationFS = `#version 300 es

precision highp float;

in vec2 v_texcoord;

out vec4 fragColor;

uniform float time;
uniform vec2 resolution;
uniform vec2 mousePositions[20];
uniform sampler2D tex;

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

void main()
{
    // vec2 texUV = gl_FragCoord.xy / resolution;
    
    // -------------------
    vec2 uv = ( gl_FragCoord.xy -.5 * resolution.xy ) / resolution.y;

    float maxContraction = 16.;
    float minContraction = 8.;
    float distFieldContraction = maxContraction;

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
    
    float theMask = smoothstep(0.75, 0.75 + 0.02, val);

    // -------------------
    vec3 theTexSample = texture(tex, vec2(-v_texcoord.x, v_texcoord.y)).xyz;
    vec3 invertedTex = (vec3(1.) - theTexSample) * (1. - theMask);
    vec3 texSample = theTexSample * theMask;
    vec3 col = texSample + invertedTex;

    fragColor = vec4(col, 1.0);
}
`
