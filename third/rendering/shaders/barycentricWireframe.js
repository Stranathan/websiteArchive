
var barycentricWireframeVS = `#version 300 es

precision highp float;

//
in vec3 vertexPos;

//in vec3 vertexTexCoord;
//in vec3 vertexNormal;

// transformation matrices
uniform mat4 view;
uniform mat4 projection;
uniform mat4 model;

uniform float time;

//
//out vec3 v_Vertex;
//out vec3 v_TexCoord;
//out vec3 v_Normal;
out vec3 v_Barycentric;

float when_gt(float x, float y) 
{
    return max(sign(x - y), 0.0);
}
float when_lt(float x, float y)
{
    return max(sign(y - x), 0.0);
}
void main() 
{
    v_Barycentric = vec3(0.0);
    v_Barycentric[int(mod(float(gl_VertexID), 3.0))] = 1.0;

   
    vec3 radialDir = normalize(vertexPos);
    float radius = 4.;
    float firstExpansionRate = smoothstep(0., 2., time);
    float secondExpansionRate = smoothstep(2., 4., time);

    vec3 offset = radius * radialDir * firstExpansionRate - radius * radialDir * secondExpansionRate;
    vec3 pos = vertexPos + offset;
    
    if(time > 4.)
    {
        pos = vertexPos;
    }
    gl_Position = projection * view * model * vec4(pos, 1.0);
}
`;

var barycentricWireframeFS = `#version 300 es

precision highp float;

// in vec3 v_Vertex;
// in vec3 v_TexCoord;
// in vec3 v_Normal;
in vec3 v_Barycentric;

out vec4 fragColor;

uniform float time;

#define PI (3.1415)

float edgeFactor()
{
    // like the avergae of dFdx & dFdy
    vec3 d = fwidth(v_Barycentric);
    // 
    vec3 val = smoothstep(vec3(0.0), d*4.5, v_Barycentric);

    // return the min of any of the vector's components
    return min(min(val.x, val.y), val.z);
}

void main()
{
    vec3 col = mix(vec3(0.0), vec3(0.5), edgeFactor());
    if(gl_FrontFacing)
    {
        fragColor = vec4(col, (1.0-edgeFactor())*0.95);
    }
    else
    {
        fragColor = vec4(col, (1.0-edgeFactor())*0.7);
    }
}   
`;

var rwwttVS = `#version 300 es
    precision highp float;
    //
    in vec3 vertexPos;
    //
    //
    uniform float time;
    uniform vec2 resolution;

    void main()
    {
      gl_Position =  vec4(vertexPos, 1.0);
    }
`;

var rwwttFS = `#version 300 es
    precision highp float;

    out vec4 fragColor;

    uniform float time;
    uniform vec2 resolution;
    uniform sampler2D screenTexture;

    float when_gt(float x, float y) 
    {
        return max(sign(x - y), 0.0);
    }
    float random(vec2 uv)
    {
        return fract(sin(uv.x * 100. + uv.y * -5674. * 1.12) * 5674.);
    }
    void main()
    {
        vec2 uv = (gl_FragCoord.xy -.5 * resolution.xy ) / resolution.y;
        vec2 texCoord = gl_FragCoord.xy / resolution.xy;
        
        float speedish = 2.;
        
        float circle1 = length(uv);
        circle1 = 1. - smoothstep(0.1 * speedish * time,
                                0.11 * speedish * time,
                                circle1);
        
        float offsetTime = (time - 2.);
        float circle2 = length(uv);
        circle2 = when_gt(time, 2.) * 
                (1. - smoothstep(0.1 * (speedish * offsetTime * when_gt(time, 2.)),
                                0.11 * (speedish * offsetTime * when_gt(time, 2.)),
                                circle2));
        float rand = random(uv - vec2(0., time));
        float circleMask = rand * (1. - circle2) * circle1;
        vec3 col = 0.5 + 0.5*cos(time + uv.xyx + vec3(0,2,4));
        
        fragColor = texture(screenTexture, texCoord) + (1. - circleMask) * vec4(col, 1.);
    }
`;