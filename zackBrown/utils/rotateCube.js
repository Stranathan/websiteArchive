/*
* matrixTranslationIndexNum = model matrix index number corresponding to a x, y, or z translation
* this is used to match cubies for rotation
* mat4 aMat4 = mat4(1.0, 0.0, 0.0, 0.0,  // 1. column
                    0.0, 1.0, 0.0, 0.0,  // 2. column
                    0.0, 0.0, 1.0, 0.0,  // 3. column
                    T_x, T_y, T_z, 1.0); // 4. column
*
*/

function rotateCubePlane(renderer, anAngle, theSubArr, theSelectedIndex, matrixTranslationIndexNum)
{
    let rotationMat = mat4.create();

    switch(matrixTranslationIndexNum) 
    {
        case 12:
            mat4.rotateX(rotationMat, rotationMat, anAngle);
            break;
        case 13:
            mat4.rotateY(rotationMat, rotationMat, anAngle);
            break;
        case 14:
            mat4.rotateZ(rotationMat, rotationMat, anAngle);
            break;
        default:
            console.log("some strange matrix index was given to rotateCubePlane")
    }

    let count = 0;
    //console.log(renderer.instancedRenderables[0].attribMatrixData[theSelectedIndex][12]);

    for(let i = 0; i < NUM_CUBIES; i++)
    {
        // if the cubie matrix's x||y||z translation matches the selected cubie's matrix's x||y||z translation, rotate it
        // beware of floating point errors
        if( renderer.renderables[0].cubieTransforms[i               ][matrixTranslationIndexNum] == 
            renderer.renderables[0].cubieTransforms[theSelectedIndex][matrixTranslationIndexNum]
            )
        {
            count++;

            // transform matrix with rotation
            mat4.multiply(renderer.renderables[0].cubieTransforms[i], rotationMat, renderer.renderables[0].cubieTransforms[i]);

            // Round to nearest integer to avoid floating point errors
            for( let j = 0; j < 15; j++)
            {
                renderer.renderables[0].cubieTransforms[i][j] = Math.round(renderer.renderables[0].cubieTransforms[i][j]);
            }

            // make a substitution buffer so you don't have to replace entire buffer
            for(let j = 0; j < 16; j++)
            {
                // index into float32 array to the matrix in question
                // renderer.instancedRenderables[0].fl32[(i * 16) + j] = renderer.renderables[0].cubieTransforms[i][j];
                // faster and easier, just update a substitue matrix fl32 and then offset into buffer correctly and replace one matrix instead of 27:
                theSubArr[j] = renderer.renderables[0].cubieTransforms[i][j];
            }
            renderer.gl.bufferSubData(renderer.gl.ARRAY_BUFFER, i * 16 * 4, theSubArr); //gl.bufferSubData(gl.ARRAY_BUFFER, offset, renderer.instancedRenderables[0].fl32);
        }
        // no need to do more than 9 cubes, this will only help us if selectedIndex is in the first or second 9
        if(count >= 9)
        {
            break;
        }
    }

}