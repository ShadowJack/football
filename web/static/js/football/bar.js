// @flow

import RoundObject from "./round_object"

/**
 * A class to represent one bar of a goals
 */

const BAR_RADIUS = 4;

export default class Bar extends RoundObject {
  constructor(x: number, y: number) {
    super(x, y, BAR_RADIUS);
  }
}
