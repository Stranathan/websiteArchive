function generateMesh(numQuadsX, numQuadsY, quadEdgeLen)
{
    // *-----* *-----* *-----*
    //  --1--   --2--   --3--
    // *-----* *-----* *-----*
    
    // *-----* *-----* *-----*
    //  --4--   --5--   --6--
    // *-----* *-----* *-----*

    // *-----* *-----* *-----*
    //  --7--   --8--   --9--
    // *-----* *-----* *-----*

    var vertPositions = [];
    var vertAttribArrayData = [];

    for(let yy = 0; yy < numQuadsY + 1; yy++)
    {
        let yPos = yy * quadEdgeLen;

        for(let xx = 0; xx < numQuadsX + 1; xx++)
        {
            let xPos = xx * quadEdgeLen;
            vertPositions.push([xPos, yPos, 0]);
        }
    }
    console.log(vertPositions);

    var edgeVertexNum = numQuadsX;
    for(let i = 0; i < vertPositions.length - 4; i++)
    {
        // this is like a quad pass
        if(i != edgeVertexNum)
        {
            vertAttribArrayData.push(vertPositions[i + numQuadsX + 1]);
            vertAttribArrayData.push(vertPositions[i]);
            vertAttribArrayData.push(vertPositions[i + 1]);
            vertAttribArrayData.push(vertPositions[i + numQuadsX + 1]);
            vertAttribArrayData.push(vertPositions[i + 1]);
            vertAttribArrayData.push(vertPositions[i + numQuadsX + 2]);
        }
        if(i == edgeVertexNum)
        {
            edgeVertexNum += numQuadsX + 1;
        }
    }

    var flattenedVertAttribArrayData = vertAttribArrayData.flat();
    
    return {
        vertexBufferData: flattenedVertAttribArrayData,
    };
}