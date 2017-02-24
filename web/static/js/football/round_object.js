// @flow
import StraightSegment from "./straight_segment";

/* Basic object that has round shape */
export default class RoundObject {
  x: number;
  y: number;
  radius: number;

  constructor(x: number, y: number, r: number) {
    this.x = x;
    this.y = y;
    this.radius = r;
  }

  // Check if our object collides with another round object
  isCollidingWithRoundObject({x, y, radius}: RoundObject): bool {
    const distX = this.x - x; 
    const distY = this.y - y;
    const squaredDistance = distX * distX + distY * distY;

    const squaredRadiusesSum = (this.radius + radius)*(this.radius + radius);

    return squaredDistance <= squaredRadiusesSum;
  }

  // Check if our object collides with straight segment
  isCollidingWithSegment({x1, y1, x2, y2}: StraightSegment): bool {

    // Segment is horizontal
    if (y1 == y2) {
      if (x1 < x2) {
        return this.x > x1 && this.x < x2 && Math.abs(this.y - y1) < this.radius;
      }
      else {
        return this.x > x2 && this.x < x1 && Math.abs(this.y - y1) < this.radius;
      }
    }

    // Segment is vertical
    if (x1 == x2) {
      if (y1 < y2) {
        return this.y > y1 && this.y < y2 && Math.abs(this.x - x1) < this.radius;
      }
      else {
        return this.y > y2 && this.y < y1 && Math.abs(this.x - x1) < this.radius;
      }
    }

    // Segment is sloped - not required for now
    return false;
  }
}

