// @flow
import RoundObject from "./round_object";

/* Basic round object that has speed */
export default class MotileRoundObject extends RoundObject {
  mass: number;
  vx: number;
  vy: number;

  constructor(x: number, y: number, r: number, m: number) {
    super(x, y, r);
    this.mass = m;
    this.vx = 0;
    this.vy = 0;
  }

  // Checks if our motile object collides with other motile object and if so, changes speeds of both objects according to their momentums.
  collideWith(otherObj: MotileRoundObject): MotileRoundObject {
    let {x, y, radius, mass, vx, vy} = otherObj;

    if (!this.isCollidingWith(otherObj)) {
      return otherObj;
    }

    // Objects are colliding => change speed of both objects according to their momentums
  }

  // Checks if our motile object collides with other steady object
  // and if so, changes speed of our object.
  collideWith(otherObj: RoundObject): void {
    let {x, y, radius} = otherObj;

    if (!this.isCollidingWith(otherObj)) {
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
}
