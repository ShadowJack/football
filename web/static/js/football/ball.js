// @flow


import MotileRoundObject from "./motile_round_object";


const TENSION_COEFF = 0.95;
const BALL_MASS = 1;
const BALL_RADIUS = 14;

export default class Ball extends MotileRoundObject {
  constructor(x: number, y: number) {
    super(x, y, BALL_RADIUS, BALL_MASS);
  }
}
