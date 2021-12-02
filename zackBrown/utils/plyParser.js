function plyParser(modelString)
{
    let vertCount = 0;
    let attribData = [];

    let modelStringArray = modelString.split("\n");
    let indexToSliceTo;

    // find out where the vertex data ends and the face data begins in the .ply file
    for(let i = 0 ; i < modelStringArray.length; i++)
    {
        if(modelStringArray[i][0] == "4" || modelStringArray[i][0] == "3")
        {
            indexToSliceTo = i;
            break;
        }
    }
    // console.log(modelStringArray);

    // create two arrays of the vertex data and face data (still as strings)
    let vertexDataStrArr  = modelStringArray.slice(0,              indexToSliceTo);
    let vertexDataFloatArr = [];
    let faceDataStrArr = modelStringArray.slice(indexToSliceTo, modelStringArray.length);
    let faceDataIntArr = [];

    // parse along empty spaces to sperate and replace the with numbers -- float for vertex data and ints for face data
    for(let i in vertexDataStrArr)
    {
        let aStringLine = vertexDataStrArr[i].split(" ");
        
        for(let str in aStringLine)
        {
            aStringLine[str] = parseFloat(aStringLine[str]);
        }
        vertexDataFloatArr.push(aStringLine);
    }
    // console.log(vertexDataStrArr);
    // console.log(vertexDataFloatArr);
    for(let i in faceDataStrArr)
    {
        let aStringLine = faceDataStrArr[i].split(" ");
        
        for(let str in aStringLine)
        {
            aStringLine[str] = parseInt(aStringLine[str]);
        }

        faceDataIntArr.push(aStringLine);
    }
    // console.log(faceDataStrArr);
    // console.log(faceDataIntArr);
    
    for(let i in faceDataIntArr)
    {
        // if it starts with 4 or 3, you have a quadrilateral or triangle
        // quadrilateral:
        // 0 1 2
        // 0 2 3
        if(faceDataIntArr[i][0] == 4)
        {
            attribData.push(vertexDataFloatArr[faceDataIntArr[i][1]]);
            attribData.push(vertexDataFloatArr[faceDataIntArr[i][2]]);
            attribData.push(vertexDataFloatArr[faceDataIntArr[i][3]]);

            attribData.push(vertexDataFloatArr[faceDataIntArr[i][1]]);
            attribData.push(vertexDataFloatArr[faceDataIntArr[i][3]]);
            attribData.push(vertexDataFloatArr[faceDataIntArr[i][4]]);

            vertCount += 6;
        }
        else if(faceDataIntArr[i][0] == 3)
        {
            attribData.push(vertexDataFloatArr[faceDataIntArr[i][1]]);
            attribData.push(vertexDataFloatArr[faceDataIntArr[i][2]]);
            attribData.push(vertexDataFloatArr[faceDataIntArr[i][3]]);
            
            vertCount += 3;
        }
        else
        {
            console.log("yikes");
        }
    }
    //console.log(attribData);
    attribData = attribData.flat();
    return {modelData: attribData, vertCount: vertCount};
}