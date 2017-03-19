// @flow
import RoundObject from "./round_object";
import StraightSegment from "./straight_segment";


/* Basic round object that has speed */
export default class MotileRoundObject extends RoundObject {
  mass: number;
  vx: number;
  vy: number;
  displayedElement: ?JQuery;
  cssClass: string;

  constructor(x: number, y: number, r: number, m: number) {
    super(x, y, r);
    this.mass = m;
    this.vx = 0;
    this.vy = 0;
    this.cssClass = "";
  }


  // Checks if our motile object collides with 
  // other motile object and if so, changes speeds 
  // of both objects according to their momentums.
  collideWithMotileRoundObject(otherObj: MotileRoundObject): MotileRoundObject {
    let {x, y, radius, mass, vx, vy} = otherObj;

    if (!this.isCollidingWithRoundObject(otherObj)) {
      return otherObj;
    }

    //TODO: Objects are colliding => change speed of both objects according to their momentums
    return otherObj;
  }


  // Checks if our motile object collides with other steady object
  // and if so, changes position of our object.
  collideWithRoundObject(otherObj: RoundObject): void {
    let {x, y, radius} = otherObj;

    if (!this.isCollidingWithRoundObject(otherObj)) {
      return;
    }

    // Calculate the distance between centers of objects
    const distX = this.x - otherObj.x; 
    const distY = this.y - otherObj.y;
    const distance = Math.sqrt(distX * distX + distY * distY);

    // Cos and Sin of angle between the line that connects centers
    // of objects and X axis
    const cosX = distX / distance; 
    const sinX = distY / distance;
    
    // Move motile object so that it doesn't intersect steady object
    // 1. Calculate point of where objects should touch
    const pointX = otherObj.x + otherObj.radius * cosX;
    const pointY = otherObj.y + otherObj.radius * sinX;
    // 2. Move motile object
    this.x = pointX + this.radius * cosX;
    this.y = pointY + this.radius * sinX;
  }


  // Checks if our motile object collides with straight segment
  // and if so, changes speed and position
  // Returns true if collision occured
  collideWithSegment(segment: StraightSegment): bool {
    if (!this.isCollidingWithSegment(segment)) {
      return false;
    }

    let {x1, y1, x2, y2} = segment;

    // Segment is horizontal
    if (y1 == y2) {
      let isAboveSegment = this.y < y1;
      this.y = isAboveSegment ?  y1 - this.radius : y1 + this.radius;
      return true;
    }

    // Segment is vertical
    if (x1 == x2) {
      let isLeftToSegment = this.x < x1;
      this.x = isLeftToSegment ?  x1 - this.radius : x1 + this.radius;
      return true;
    }

    return false;
  }

  // Draws the motile round object on the screen
  draw() {
    if (!this.displayedElement) {
      this.displayedElement = $("<div/>", {
        "class": `motile-round-object ${this.cssClass}`,
        "width": this.radius * 2,
        "height": this.radius * 2
      });
      $("main").append(this.displayedElement);
    }

    this.displayedElement.css("left", this.x - this.radius);
    this.displayedElement.css("top", this.y - this.radius);
  }
}
