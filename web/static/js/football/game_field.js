// @flow
import Bar from "./bar"
import MotileRoundObject from "./motile_round_object"
import StraightSegment from "./straight_segment"


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
  borders: Array<StraightSegment>;

  constructor() {
    this.bars = [];
    // Upper-left
    this.bars.push(new Bar(LEFT_BORDER, UPPER_GOALS));
    // Lower-left
    this.bars.push(new Bar(LEFT_BORDER, LOWER_GOALS));
    // Upper-right
    this.bars.push(new Bar(RIGHT_BORDER, UPPER_GOALS));
    // Lower-right
    this.bars.push(new Bar(RIGHT_BORDER, LOWER_GOALS));

    this.borders = [];
    // Upper
    this.borders.push(new StraightSegment(LEFT_BORDER, UPPER_BORDER, RIGHT_BORDER, UPPER_BORDER)); 
    // Lower
    this.borders.push(new StraightSegment(LEFT_BORDER, LOWER_BORDER, RIGHT_BORDER, LOWER_BORDER));
    // Upper-left
    this.borders.push(new StraightSegment(LEFT_BORDER, UPPER_BORDER, LEFT_BORDER, UPPER_GOALS));
    // Lower-left
    this.borders.push(new StraightSegment(LEFT_BORDER, LOWER_GOALS, LEFT_BORDER, LOWER_BORDER));
    // Upper-right
    this.borders.push(new StraightSegment(RIGHT_BORDER, UPPER_BORDER, RIGHT_BORDER, UPPER_GOALS));
    // Lower-right
    this.borders.push(new StraightSegment(RIGHT_BORDER, LOWER_GOALS, RIGHT_BORDER, LOWER_BORDER));
  }


  // Checks for collision with each bar
  // and modifies the state of passed object if collision occures
  collideWithBars(object: MotileRoundObject): void {
    // Check collision with each bar
    this.bars.forEach(bar => object.collideWithRoundObject(bar));
  }


  // Checks for collision with each field border
  // and modifies the state of passed object if collision occures
  collideWithBorders(object: MotileRoundObject): void {
    // Check collision with each border
    this.borders.forEach(border => object.collideWithSegment(border));
  }
}
