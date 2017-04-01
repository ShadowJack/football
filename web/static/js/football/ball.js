// @flow

import MotileRoundObject from "./motile_round_object";
import RoundObject from "./round_object";
import StraightSegment from "./straight_segment";


const TENSION_COEFF = 0.96;
const BALL_MASS = 1.5;
const BALL_RADIUS = 14;

export default class Ball extends MotileRoundObject {
  constructor(x: number, y: number) {
    super(x, y, BALL_RADIUS, BALL_MASS);
    this.cssClass = "ball";
  }

  // Override:
  // Checks if the ball collides with other steady object
  // and if so, changes position and speed of the ball
  collideWithRoundObject(otherObj: RoundObject): void {
    super.collideWithRoundObject(otherObj);
    this.vx *= -1;
    this.vy *= -1;
  }

  // Override: 
  // Checks if the ball collides with straight segment
  // and if so, changes its speed and position
  // Returns true if collision occured
  collideWithSegment(segment: StraightSegment): bool {
    if (!super.collideWithSegment(segment)) return false;

    // Segment is horizontal - flip vertical speed
    if (segment.y1 == segment.y2) {
      this.vy *= -1;
      return true;
    }

    // Segment is vertical - flip horizontal speed
    if (segment.x1 == segment.x2) {
      this.vx *= -1;
      return true;
    }

    return false;
  }

  move(timePassed: number) {
    // Update x position and speed
    let {position, speed} = this.getUpdatedPositionAndSpeed(this.x, this.vx, timePassed);
    this.x = position;
    this.vx = speed;

    // Update y position and speed
    ({position, speed} = this.getUpdatedPositionAndSpeed(this.y, this.vy, timePassed));
    this.y = position;
    this.vy = speed;
  }

  getUpdatedPositionAndSpeed(position: number, speed: number, time: number) {
    for(let i = 0; i < time; i++) {
      position += speed;
      speed *= TENSION_COEFF;
      if (Math.abs(speed) < 0.05) {
        speed = 0;
        break;
      }
    }

    return {position, speed};
  }

  merge({x, y, vx, vy}: any) {
    this.x = (this.x + parseFloat(x)) / 2;
    this.y = (this.y + parseFloat(y)) / 2;
    this.vx = (this.vx + parseFloat(vx)) / 2;
    this.vy = (this.vy + parseFloat(vy)) / 2;
  }
}
