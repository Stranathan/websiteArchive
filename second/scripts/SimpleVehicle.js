// equilateral triangle made in display() method

class SimpleVehicle
{
  // @param (xPos, yPos) the center of an equilateral triangle
  // @param sideLength, the length of the quilateral side
  constructor(xPos, yPos, sideLength, maxSpeed, maxAccl)
  {
    this.position = createVector(xPos, yPos);
    this.velocity = p5.Vector.random2D()
    this.velocity.mult(12);
    this.acceleration = createVector();
    this.desireVector = createVector();
    this.steeringVector = createVector();

    this.sideLength = sideLength;
    this.maxSpeed = maxSpeed;
    this.maxAccl = maxAccl;
    this.radius = 80;
    this.pathRadius = 10;
    this.fleeRadius = 80;
  }

  eulerUpdate(xLim, yLim)
  {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);

    if (this.position.x > xLim || this.position.x < 0 || this.position.y > yLim || this.position.y < 0) {
      this.velocity = this.velocity.mult(-1);
    }
    this.acceleration.mult(0);
  }

  seek(target)
  {
    var desireVector = createVector(); // this is just relative position vector
    var steeringVector = createVector();

    desireVector = p5.Vector.sub(target, this.position);
    desireVector.setMag(this.maxSpeed); // shorthand for normalize & multiply
    steeringVector = p5.Vector.sub(desireVector, this.velocity);
    steeringVector.limit(this.maxAccl);
    this.acceleration.add(steeringVector);
  }

  arrive(target)
  {
    var desireVector = createVector(); // this is just relative position vector
    var steeringVector = createVector();

    var desireVector = p5.Vector.sub(target, this.position); // A vector pointing from the location to the newTarget
    var desireMagnitude = desireVector.mag();
    // Scale with arbitrary damping within 100 pixels
    if (desireMagnitude < this.radius)
    {
      var interpolatedDesireMag = map(desireMagnitude, 0, this.radius, 0, this.maxSpeed);
      desireVector.setMag(interpolatedDesireMag);
    }
    else
    {
      desireVector.setMag(this.maxSpeed);
    }
    steeringVector = p5.Vector.sub(desireVector, this.velocity);
    steeringVector.limit(this.maxAccl);
    this.acceleration.add(steeringVector);
  }

  flee(target)
  {
    let desireVector = p5.Vector.sub(target, this.position);
    desireVector.normalize();
    desireVector.mult(-10*this.maxSpeed);

    let steeringVector = p5.Vector.add(desireVector, this.velocity);
    steeringVector.limit();
    if(this.position.dist(target) <= this.fleeRadius)
    {
      this.acceleration.add(steeringVector);
    }
    else
    {
      return;
    }
  }

  closest(in_point, arrayOfPoints)
  {
      let minimum = Infinity;
      let index = NaN;
      for (let i=0; i < arrayOfPoints.length; i++)
      {
        let point = arrayOfPoints[i];
        let dist = in_point.dist(point);
        if (dist < minimum){
          minimum = dist;
          index = i;
        }
      }
      if (index+1 >= arrayOfPoints.length)
      {
        return [arrayOfPoints[index], arrayOfPoints[index-1]];
      }
      return [arrayOfPoints[index], arrayOfPoints[index+1]];
  }

  path(arrayOfPositionVectors)
  {
    let deltaTime = 10;

    let velocityCopy = this.velocity.copy();
    // kinematics with no acceleration -- x_f = x_0 + v+0(t)
    velocityCopy.mult(deltaTime);
    let futurePos = p5.Vector.add(this.position, velocityCopy);

    let closests = this.closest(futurePos, arrayOfPositionVectors);

    let aa = closests[1];
    let bb = closests[0];

    let a_to_futurePos = p5.Vector.sub(futurePos, aa);
    let a_to_b_Segment = p5.Vector.sub(bb, aa);
    a_to_b_Segment.normalize();
    a_to_b_Segment.mult(a_to_futurePos.dot(a_to_b_Segment));

    let orthoPoint = p5.Vector.add(aa, a_to_b_Segment);
    // should probably be like 2 possible velocity time steps instead of arbitrary value
    let plusALittle = a_to_b_Segment.normalize();
    plusALittle.mult(this.velocity.mag());

    let newTarget = p5.Vector.add(orthoPoint, plusALittle);

    let orthoHeight = p5.Vector.dist(futurePos, orthoPoint);
    if (orthoHeight > this.pathRadius)
    {
      this.seek(newTarget);
    }
}

  display()
  {
    push();
    translate(this.position.x, this.position.y);
    rotate(this.velocity.heading() + (Math.PI/2)); // to accomodate triangle shape
    stroke(255, 182, 193, 100);
    strokeWeight(4);
    fill("pink")
    triangle(-this.sideLength/2, this.sideLength*Math.sqrt(3)/4, this.sideLength/2, this.sideLength*Math.sqrt(3)/4, 0, -this.sideLength*Math.sqrt(3)/4);
    fill("purple");
    ellipse(0, -this.sideLength*Math.sqrt(3)/4, 4, 4);
    pop();
  }
}
