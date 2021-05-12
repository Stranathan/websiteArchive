var utahTeapotHelloVS = `#version 300 es

precision highp float;

//
in vec3 vertexPos;
in vec3 vertexTexCoord;
in vec3 vertexNormal;

// transformation matrices
uniform mat4 view;
uniform mat4 projection;
uniform mat4 model;

//
out vec3 v_Vertex;
out vec3 v_TexCoord;
out vec3 v_Normal;

void main() 
{
    vec4 tmpPos = projection * view * model * vec4(vertexPos, 0.0);
    v_Vertex = vec3(tmpPos);

    vec4 tmpNorm = projection * view * model * vec4(vertexNormal, 0.0);
    v_Normal = vec3(tmpNorm);

    v_TexCoord = vertexTexCoord;

    gl_Position = projection * view * model * vec4(vertexPos, 1.0);
}
`

var utahTeapotHelloFS = `#version 300 es

precision highp float;

in vec3 v_Vertex;
in vec3 v_TexCoord;
in vec3 v_Normal;

out vec4 fragColor;

uniform float time;

#define PI (3.1415)

void main() {

  vec3 to_light;
  vec3 u_Light_position = vec3(sin(time) * 50., cos(time) * 50., 0.);

  vec3 vertex_normal;
  float cos_angle;

  // Calculate a vector from the fragment location to the light source
  to_light = u_Light_position - v_Vertex;
  to_light = normalize( to_light );

  // The vertex's normal vector is being interpolated across the primitive
  // which can make it un-normalized. So normalize the vertex's normal vector.
  vertex_normal = normalize( v_Normal );

  // Calculate the cosine of the angle between the vertex's normal vector
  // and the vector going to the light.
  cos_angle = dot(vertex_normal, to_light);
  cos_angle = clamp(cos_angle, 0.0, 1.0);

  // lambertian model
  vec3 col = vec3(0.65, 0., 0.) * cos_angle;

  fragColor = vec4(col, 1.);
}
`