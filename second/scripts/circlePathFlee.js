var canvasWidth;
var canvasHeight;
var vehicle1;
var positionVectorArr;
var mouseVector;

// dom stuff
var homeA;
var hazelnutsA;
var redA;
var gypsyA;
var homeA;
var denemeA;
var featheredA;

function preload()
{
  canvasWidth = windowWidth;
  canvasHeight = windowHeight;
}

function windowResized()
{
  resizeCanvas(windowWidth, windowHeight);
}

function setup()
{
  // animation
  positionVectorArr = new Array();
  var xInit = canvasWidth/2;
  var yInit = canvasHeight/2;
  var radius = Math.min(windowWidth/3, windowHeight/3);

  // console.log("windowWidth: " + windowWidth/4 + "windowHeight: " +  windowHeight/4)
  // console.log(radius);

  var numberOfPoints = 50;
  var angleIncrement = 2 * Math.PI/numberOfPoints;

  createCanvas(canvasWidth, canvasHeight);
  vehicle1 = new SimpleVehicle(xInit, yInit, windowHeight/25, 4, .3);

  for(var i = 0; i< 2 * Math.PI; i+= angleIncrement)
  {
    //console.log("pushed");
    let xPoint = xInit + Math.cos(i) * radius;
    let yPoint = yInit + Math.sin(i) * radius;
    let temp = createVector(xPoint, yPoint);
    positionVectorArr.push(temp)

  }

  mouseVector = createVector(mouseX, mouseY);

  // DOM elements
  var websiteLinkDiv = createDiv();
  websiteLinkDiv.size(radius, radius * 9/16);

  websiteA = createA('../index.html', 'Home');
  websiteA.parent(websiteLinkDiv);

  websiteA.style('color', '#F0B464');

  websiteLinkDiv.position(xInit - radius * sqrt(3)/2 - windowWidth/12/1.2, yInit - radius - windowHeight/12);


  var hzlDiv = createDiv();
  hzlDiv.size(radius, radius * 9/16);

  hazelnutsA = createA('../stories/gleaningsOfHazelnutsInChinese.pdf', '6. Gleanings Of Hazelnuts In Chinese');
  hazelnutsA.parent(hzlDiv);

  var ww = hzlDiv.elt.offsetWidth;
  var hh = hzlDiv.elt.offsetHeight;

  hzlDiv.position(xInit - ww/4 - radius*0.04, yInit - radius - hh/3);

  // 1)
  var redDiv = createDiv();
  redDiv.size(radius, radius * 9/16);

  redA = createA('../stories/theRedCafe.pdf', '1. The Red Cafe');
  redA.parent(redDiv);

  // ww = redDiv.elt.offsetWidth;
  // hh = redDiv.elt.offsetHeight;

  redDiv.position(xInit + radius * sqrt(3)/2 + Math.min(windowWidth/20, windowHeight/20), yInit - .5 * radius);

  // 2)
  var gypsyDiv = createDiv();
  gypsyDiv.size(radius, radius * 9/16);

  gypsyA = createA('../stories/theGypsyDance.pdf', '2. The Gypsy Dance');
  gypsyA.parent(gypsyDiv);

  // ww = gypsyDiv.elt.offsetWidth;
  // hh = gypsyDiv.elt.offsetHeight;

  gypsyDiv.position(xInit + radius * sqrt(3)/2 + windowWidth/90, yInit + .5 * radius);

  // 3)
  var homeDiv = createDiv();
  homeDiv.size(radius, radius * 9/16);

  homeA = createA('../stories/aHomeForUs.pdf', '3. A Home for Us');
  homeA.parent(homeDiv);
  //
  // ww = homeA.elt.offsetWidth;
  // hh = homeA.elt.offsetHeight;

  homeDiv.position(xInit - ww/4, yInit + radius + hh/5);

  // 4)
  var denemeDiv = createDiv();
  denemeDiv.size(radius, radius * 9/16);

  denemeA = createA('../stories/denemeDreams.pdf', '4. Deneme Dreams');
  denemeA.parent(denemeDiv);

  // ww = redDiv.elt.offsetWidth;
  // hh = redDiv.elt.offsetHeight;

  denemeDiv.position(xInit - radius * sqrt(3)/2 - Math.min(1.4 * ww, 1.4 * hh), yInit + .5 * radius);

  // 5)
  var featheredDiv = createDiv();
  featheredDiv.size(radius, radius * 9/16);

  featheredA = createA('../stories/theFeatheredFairy.pdf', '5. The Feathered Fairy');
  featheredA.parent(featheredDiv);

  // ww = redDiv.elt.offsetWidth;
  // hh = redDiv.elt.offsetHeight;

  featheredDiv.position(xInit - radius * sqrt(3)/2 - Math.min(1.4 * ww, 1.4 * hh), yInit - .5 * radius);
}

function draw()
{

  frameRate(60);
  //console.log(atan(vehicle1.position.y/vehicle1.position.x));
  background(33, 36, 45);
  stroke('white')
  strokeWeight(3);
  fill('pink')
  for (var j = 0; j < positionVectorArr.length; j++)
  {
    if(j == positionVectorArr.length-1)
    {
      line(positionVectorArr[j].x, positionVectorArr[j].y, positionVectorArr[0].x, positionVectorArr[0].y)
    }
    else
    {
      line(positionVectorArr[j].x, positionVectorArr[j].y, positionVectorArr[j+1].x, positionVectorArr[j+1].y);
    }
  }
  vehicle1.flee(mouseVector);
  vehicle1.path(positionVectorArr);
  vehicle1.eulerUpdate(windowWidth, windowHeight);
  vehicle1.display();

  mouseVector.x = mouseX;
  mouseVector.y = mouseY;


  // scope yo, change later
  var centerX = windowWidth/2;
  var centerY = windowHeight/2;
  var rad = Math.min(windowWidth/3, windowHeight/3);

  // 2 o'clock #
  if(vehicle1.position.x > centerX && vehicle1.position.y < centerY - 0.2 * rad && vehicle1.position.y > centerY - rad + 0.2 * rad)
  {
    redA.style('color', '#ff0000', 'font-size', '1.5vh', 'text-align', 'left');
  }
  // 4
  else if (vehicle1.position.x > centerX && vehicle1.position.y > centerY + 0.2 * rad && vehicle1.position.y < centerY + rad - 0.2 * rad)
  {
    gypsyA.style('color', '#FFA500', 'font-size', '1.5vh', 'text-align', 'left');
  }
  // 6
  else if(vehicle1.position.y > centerY + rad -  0.1 * rad)
  {
    homeA.style('color', '#FFFF00', 'font-size', '1.5vh', 'text-align', 'left');
  }
  // 8
  else if (vehicle1.position.x < centerX && vehicle1.position.y > centerY + 0.2 * rad && vehicle1.position.y < centerY + rad - 0.2 * rad)
  {
    denemeA.style('color', '#00ff00', 'font-size', '1.5vh', 'text-align', 'left');
  }
  // 10
  else if (vehicle1.position.x < centerX && vehicle1.position.y < centerY - 0.2 * rad && vehicle1.position.y > centerY - rad + 0.2 * rad)
  {
    featheredA.style('color', '#0000ff', 'font-size', '1.5vh', 'text-align', 'left');
  }
  // 12
  else if(vehicle1.position.y <= centerY - rad + 0.1 * rad)
  {
    hazelnutsA.style('color', '#4B0082', 'font-size', '1.5vh', 'text-align', 'left');
  }

  else
  {
    hazelnutsA.style('color', '#ffffff','font-size', '1.5vh', 'text-align', 'left', 'font-family', 'Bitter', 'serif',  'text-decoration', 'none');
    redA.style('color', '#ffffff','font-size', '1.5vh', 'text-align', 'left', 'font-family', 'Bitter', 'serif',  'text-decoration', 'none');
    gypsyA.style('color', '#ffffff','font-size', '1.5vh', 'text-align', 'left', 'font-family', 'Bitter', 'serif',  'text-decoration', 'none');
    homeA.style('color', '#ffffff','font-size', '1.5vh', 'text-align', 'left', 'font-family', 'Bitter', 'serif',  'text-decoration', 'none');
    denemeA.style('color', '#ffffff','font-size', '1.5vh', 'text-align', 'left', 'font-family', 'Bitter', 'serif',  'text-decoration', 'none');
    featheredA.style('color', '#ffffff','font-size', '1.5vh', 'text-align', 'left', 'font-family', 'Bitter', 'serif',  'text-decoration', 'none');
  }
}
