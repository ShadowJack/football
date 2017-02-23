// @flow
import Bar from "./bar"
import MotileRoundObject from "./motile_round_object"

// Field constants
const UPPER_BORDER = 25;
const LOWER_BORDER = 475;
const LEFT_BORDER = 45;
const RIGHT_BORDER = 755;

const UPPER_GOALS = 175;
const LOWER_GOALS = 325;
const LEFT_GOALS = 7;
const RIGHT_GOALS = 793;


/*
 * Class that checks if other game objects
 * contact with game field borders and goals
 */
export default class GameField {
  bars: Array<Bar>;

  constructor() {
    this.bars = [];

    this.bars.push(new Bar(LEFT_GOALS, UPPER_GOALS));
    this.bars.push(new Bar(LEFT_GOALS, LOWER_GOALS));
    this.bars.push(new Bar(RIGHT_GOALS, UPPER_GOALS));
    this.bars.push(new Bar(RIGHT_GOALS, LOWER_GOALS));
  }

  collideWithBars(object: MotileRoundObject): MotileRoundObject {
    // Check collision with each bar
    this.bars.forEach(bar => object.collideWith(bar));
    return object;
  }
}
