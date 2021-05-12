// var objModelDataString = '';

// $.get('utahTeapotLowResMesh.txt', 
// function(data) 
// {
    
//     objModelDataString += String(data);
// }, 
// 'text');

// console.log(objModelDataString)

function showGetResult()
{
    var result = null;
    $.ajax(
    {
        url: 'utahTeapotLowResMesh.txt',
        type: 'get',
        dataType: 'text',
        async: false,
        success: function(data) 
        {
            result = data;
        } 
    });
    return result;
}

var modelString = String(showGetResult());

console.log(modelString);