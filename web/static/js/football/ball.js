// @flow

import MotileRoundObject from "./motile_round_object";


const TENSION_COEFF = 0.95;
const BALL_MASS = 1;
const BALL_RADIUS = 14;

export default class Ball extends MotileRoundObject {
  constructor(x: number, y: number) {
    super(x, y, BALL_RADIUS, BALL_MASS);
    this.cssClass = "ball";
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
      if (Math.abs(speed) < 0.1) {
        speed = 0;
        break;
      }
    }

    return {position, speed};
  }
}
