// Note before I forget:
//      Parsing of face data is hardcoded to account for an extra space at the end of the line 
//
//      These are virtually the same file and should probably be consolidated with an init options arguments

function loadMesh(string) 
{
    // the vertices' position data
    var arrayOfVertPositions = [];

    var arrayOfVertTexCoords = [];
    var arrayOfVertNormals = [];

    // this is an array of each face line saved in an array
    // ex) faces[2] = [[2, 2, 2],  [7, 7, 7], [ 8, 8, 8 ], [ 3, 3, 3 ]]
    var faces = [];
    var vertAttribArrayData = [];
    var drawIndices = [];

    var lines = string.split("\n"); // split by line ending/ return
    // so this will be a massive array of arrays where each element is the line
    for ( var i = 0 ; i < lines.length ; i++ ) 
    {
        let elementInLine = lines[i].split(' '); // split line according to spaces
        switch(elementInLine[0])
        {
            case "v":
                elementInLine.shift(); // remove first element of line
                for(let ii = 0; ii < elementInLine.length; ii++)
                {
                    elementInLine[ii] = parseFloat(elementInLine[ii]);
                    // change each string to a float, if you try to feed array to parseFloat
                    // or parseInt, it will parse first element and truncate everything else.
                }
                arrayOfVertPositions.push(elementInLine);
                break;
            case "vt":
                elementInLine.shift(); // remove first element of line
                for(let ii = 0; ii < elementInLine.length; ii++)
                {
                    elementInLine[ii] = parseFloat(elementInLine[ii]); 
                    // change each string to a float, if you try to feed array to parseFloat
                    // or parseInt, it will parse first element and truncate everything else.
                }
                arrayOfVertTexCoords.push(elementInLine);
                break;
            case "vn":
                elementInLine.shift(); // remove first element of line
                for(let ii = 0; ii < elementInLine.length; ii++)
                {
                    elementInLine[ii] = parseFloat(elementInLine[ii]); 
                    // change each string to a float, if you try to feed array to parseFloat
                    // or parseInt, it will parse first element and truncate everything else.
                }
                arrayOfVertNormals.push(elementInLine);
                break;
            case "f":
                elementInLine.shift();
                elementInLine.pop();

                let interleavedAttribDataArr = [];

                for(let ii = 0; ii < elementInLine.length; ii++)
                {
                    // split the interleaved indices 
                    let interleavedAttribData = elementInLine[ii].split("/");
                    // turn each index string into an int
                    for(let j = 0; j < interleavedAttribData.length; j++)
                    {
                        interleavedAttribData[j] = parseInt(interleavedAttribData[j]);
                    }
                    interleavedAttribDataArr.push(interleavedAttribData);
                }

                faces.push(interleavedAttribDataArr);
                break;
        }
    }
    // console.log(arrayOfVertPositions);
    // console.log(arrayOfVertTexCoords);
    // console.log(arrayOfVertNormals);
    var triCount = 0;
    var quadCount = 0;
    var vertCount = 0;

    // for each line in the faces data
    for(let ff = 0; ff < faces.length; ff++)
    {
        let tmpArr = [];

        switch(faces[ff].length)
        {
            case 6:
                console.log("6 vert polygon in list");
            case 5:
                console.log("5 vert polygon in list");
            case 4:
                quadCount += 1;

                for(let kk = 0; kk < faces[ff].length; kk++)
                {
                    // OBJ indices start at 1, so we have to subtract 1 to index at zero
                    // I think I need to be careful here because javascript saves everything as floats
                    let vertPosIndex = Math.round(faces[ff][kk][0] - 1);
                    tmpArr.push(arrayOfVertPositions[vertPosIndex]);
                     // push vert pos
                    // vertAttribArrayData.push(arrayOfVertTexCoords[vertTexIndex]); // push vert tex
                    // vertAttribArrayData.push(arrayOfVertNormals[vertNormIndex]); // push vert norm
                }
                // fill out vertex positions and
                // check to see if barycentric coord has already been pushed since things share coordinates
                
                vertAttribArrayData.push(tmpArr[0]);
                vertAttribArrayData.push(tmpArr[1]);
                vertAttribArrayData.push(tmpArr[2]);

                vertAttribArrayData.push(tmpArr[0]);
                vertAttribArrayData.push(tmpArr[2]);
                vertAttribArrayData.push(tmpArr[3]);
                break;

            case 3:
                
                for(let kk = 0; kk < faces[ff].length; kk++)
                {
                    // OBJ indices start at 1, so we have to subtract 1 to index at zero
                    // I think I need to be careful here because javascript saves everything as floats
                    let vertPosIndex = Math.round(faces[ff][kk][0] - 1);
                    tmpArr.push(arrayOfVertPositions[vertPosIndex]);
                     // push vert pos
                    // vertAttribArrayData.push(arrayOfVertTexCoords[vertTexIndex]); // push vert tex
                    // vertAttribArrayData.push(arrayOfVertNormals[vertNormIndex]); // push vert norm
                }
                
               
                vertAttribArrayData.push(tmpArr[0]);
                
                vertAttribArrayData.push(tmpArr[1]);
                
                vertAttribArrayData.push(tmpArr[2]);

                break;
        }
    
    }
    //console.log("# of tris = " + triCount + " and the # of quads = " + quadCount);
    // concatenate everything into interleaved array to reference via draw indices
    //var mergedVertAttribArrayData = [].concat.apply([], vertAttribArrayData);
    
    var flattenedVertAttribArrayData = vertAttribArrayData.flat();
    
    return {
        vertexBufferData: flattenedVertAttribArrayData,
    };
}