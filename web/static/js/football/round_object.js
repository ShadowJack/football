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
    // Calculate squared distance between centers of objects
    let distance = (this.x - x)*(this.x - x) + (this.y - y)*(this.y - y);

    // Check if objects are colliding 
    return distance <= (this.radius + radius)*(this.radius + radius);
  }
}
