// @flow


import MotileRoundObject from "./motile_round_object";


// TODO: set right radius and mass values
const BALL_RADIUS = 3;
const BALL_MASS = 3;

export default class Ball extends MotileRoundObject {
  constructor(x: number, y: number) {
    super(x, y, BALL_RADIUS, BALL_MASS);
  }
}
