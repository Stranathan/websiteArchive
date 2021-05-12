var grumVS = `#version 300 es

precision highp float;

in vec3 vertexPos;

uniform float time;
// transformation matrices
uniform mat4 view;
uniform mat4 projection;
uniform mat4 model;

out vec3 v_Barycentric;


float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

#define OCTAVES 6
float fbm (in vec2 st) {
    // Initial values
    float value = 0.0;
    float amplitude = .5;
    float frequency = 0.;
    //
    // Loop of octaves
    for (int i = 0; i < OCTAVES; i++) {
        value += amplitude * noise(st);
        st *= 2.;
        amplitude *= .5;
    }
    return value;
}

void main() 
{
    v_Barycentric = vec3(0.0);
    v_Barycentric[int(mod(float(gl_VertexID), 3.0))] = 1.0;
    float fbmNoise = 2. * fbm(vertexPos.xy - 0.5 * time * random(vertexPos.xy));
    vec3 pos = vec3(vertexPos.x, vertexPos.y, vertexPos.z + fbmNoise);
    gl_Position = projection * view * model * vec4(pos, 1.0);
}
`

var grumFS = `#version 300 es

precision highp float;

in vec3 v_Barycentric;
out vec4 fragColor;

uniform float time;
uniform vec2 resolution;

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
    vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy)/ resolution.y;

    vec3 col = mix(vec3(0.0), vec3(0.5), edgeFactor());

    // 
    //fragColor.rgb = mix(vec3(0.0), vec3(0.8), edgeFactor());
    fragColor = vec4(0.0, 0.0, 0.0, (1.0-edgeFactor())*0.95);
}
`