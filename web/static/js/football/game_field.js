// @flow
import Bar from "./bar"
import MotileRoundObject from "./motile_round_object"
import StraightSegment from "./straight_segment"
import GoalsType from "./goals_type"


// Field constants
export const UPPER_BORDER = 25;
export const LOWER_BORDER = 475;
export const LEFT_BORDER = 45;
export const RIGHT_BORDER = 755;

export const UPPER_GOALS = 175;
export const LOWER_GOALS = 325;
export const LEFT_GOALS = 7;
export const RIGHT_GOALS = 793;

const LEFT_INITIAL_POSITIONS = {
  "0": {x: LEFT_BORDER + 100, y: UPPER_BORDER + 100},
  "1": {x: LEFT_BORDER + 100, y: LOWER_BORDER - 100},
  "2": {x: LEFT_BORDER + 300, y: UPPER_BORDER + 100},
  "3": {x: LEFT_BORDER + 300, y: LOWER_BORDER - 100}
};

const RIGHT_INITIAL_POSITIONS = {
  "0": {x: RIGHT_BORDER - 100, y: UPPER_BORDER + 100},
  "1": {x: RIGHT_BORDER - 100, y: LOWER_BORDER - 100},
  "2": {x: RIGHT_BORDER - 300, y: UPPER_BORDER + 100},
  "3": {x: RIGHT_BORDER - 300, y: LOWER_BORDER - 100}
};


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

  // Checks if some round object is completely inside goals.
  // And returns the type of goals the object is inside(left or right)
  // and false otherwise.
  isGoalScored(object: MotileRoundObject): bool | number {
    if (object.x + object.radius <= LEFT_BORDER) return GoalsType.LEFT;

    if (object.x - object.radius >= RIGHT_BORDER) return GoalsType.RIGHT;

    return false;
  }

  // Returns coordinate of initial user position
  // by its number and team
  getInitialCoordinates(team: bool, position: number): ?Object {
    if (position > 4) {
      console.log("Wrong position number");
      return null;
    }

    const strPosition = position.toString();
    return team ? LEFT_INITIAL_POSITIONS[strPosition] : RIGHT_INITIAL_POSITIONS[strPosition];
  }
}
