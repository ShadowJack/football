// @flow

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
  isCollidingWith({x, y, radius}: RoundObject): bool {
    const distX = this.x - x; 
    const distY = this.y - y;
    const squaredDistance = distX * distX + distY * distY;

    const squaredRadiusesSum = (this.radius + radius)*(this.radius + radius);

    return squaredDistance <= squaredRadiusesSum;
  }
}
