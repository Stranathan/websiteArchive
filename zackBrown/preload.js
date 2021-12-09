// ------------- glMatrix Lib Aliases -------------
var vec2 = glMatrix.vec2;
var vec3 = glMatrix.vec3;
var vec4 = glMatrix.vec4;
var mat2 = glMatrix.mat2;
var mat3 = glMatrix.mat3;
var mat4 = glMatrix.mat4;

// ------------- Attribute binding points -------------
var positionAttribLoc = 0;
var texCoordAttribLoc = 1;
//var normalAttribLoc = 1;
//var colorAttribLoc = 2;
//var modelMatrixAttribLoc = 3;

// ------------- Renderer Init Settings -------------
var CAM_POS = vec4.fromValues(0, 0, -5, 1);
var WORLD_UP = vec4.fromValues(0, 1, 0, 1);
var CLEAR_COL = vec4.fromValues(0.14, 0.14, 0.14, 1.);
//
var CARD_THICKNESS = 0.0125;
var CARD_PARAMS  = [1.75, 1, CARD_THICKNESS]; // len / 2, width 
var cardAsABox = {A: [-1.75, -1, CARD_THICKNESS], B: [1.75, 1, -CARD_THICKNESS]}; 


var REL_DIST = vec3.create();
vec3.subtract(REL_DIST, [-1.75, -1, CARD_THICKNESS], [CAM_POS[0], CAM_POS[1], CAM_POS[2]]);
var ll = vec3.length(REL_DIST);