// let angle = vec3.angle(this.cameraRay, camRay);
// this.totalAngle += angle;


// let rotationMat = mat4.create();

// if(true)
// {
//     switch(this.matrixTranslationIndexNum) 
//     {
//         case 12:
//             mat4.rotateX(rotationMat, rotationMat, rotAngle);
//             break;
//         case 13:
//             mat4.rotateY(rotationMat, rotationMat, rotAngle);
//             break;
//         case 14:
//             mat4.rotateZ(rotationMat, rotationMat, rotAngle);
//             break;
//         default:
//             // code block
//     }

//     let count = 0;
//         //console.log(this.renderer.instancedRenderables[0].attribMatrixData[this.theSelectedIndex][12]);

//     for(let i = 0; i < NUM_CUBIES; i++)
//     {
//         // if the cubie matrix's x||y||z translation matches the selected cubie's matrix's x||y||z translation, rotate it
//         // beware of floating point errors
//         if( this.renderer.renderables[0].cubieTransforms[i                    ][this.matrixTranslationIndexNum] == 
//             this.renderer.renderables[0].cubieTransforms[this.theSelectedIndex][this.matrixTranslationIndexNum]
//             )
//         {
//             count++;

//             // transform matrix with rotation
//             mat4.multiply(this.renderer.renderables[0].cubieTransforms[i], rotationMat, this.renderer.renderables[0].cubieTransforms[i]);

//             // Round to nearest integer to avoid floating point errors
//             for( let k = 0; k < 15; k++)
//             {
//                 this.renderer.renderables[0].cubieTransforms[i][k] = Math.round(this.renderer.renderables[0].cubieTransforms[i][k]);
//             }
            
//             //this.renderer.renderables[0].cubieTransforms[i][13] = Math.round(this.renderer.renderables[0].cubieTransforms[i][13]);
//             //this.renderer.renderables[0].cubieTransforms[i][14] = Math.round(this.renderer.renderables[0].cubieTransforms[i][14]);

//             // make a substitution buffer so you don't have to replace entire buffer
//             for(let j = 0; j < 16; j++)
//             {
//                 // index into float32 array to the matrix in question
//                 // this.renderer.instancedRenderables[0].fl32[(i * 16) + j] = this.renderer.renderables[0].cubieTransforms[i][j];
//                 // faster and easier, just update a substitue matrix fl32 and then offset into buffer correctly and replace one matrix instead of 27:
//                 this.theSubArr[j] = this.renderer.renderables[0].cubieTransforms[i][j];
//             }
//             this.gl.bufferSubData(this.gl.ARRAY_BUFFER, i * 16 * 4, this.theSubArr); //gl.bufferSubData(gl.ARRAY_BUFFER, offset, this.renderer.instancedRenderables[0].fl32);
//         }
//         // no need to do more than 9 cubes, this will only help us if selectedIndex is in the first or second 9
//         if(count >= 9)
//         {
//             break;
//         }
//     }
// }
