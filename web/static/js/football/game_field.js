// @flow
import {default as Bar, BAR_RADIUS} from "./bar"
import MotileRoundObject from "./motile_round_object"
import StraightSegment from "./straight_segment"
import GoalsType from "./goals_type"
import Team from "./team"


// Game canvas constants
const GAME_WIDTH = 800;
const GAME_HEIGHT = 500;

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
const RIGHT_INITIAL_POSITIONS = { "0": {x: RIGHT_BORDER - 100, y: UPPER_BORDER + 100},
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
  gameBorders: Array<StraightSegment>;
  context: ?CanvasRenderingContext2D;

  constructor(ctx: ?CanvasRenderingContext2D = null) {
    this.context = ctx;

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

    // Goals borders
    // Left
    this.borders.push(new StraightSegment(LEFT_GOALS, UPPER_GOALS, LEFT_BORDER, UPPER_GOALS)); 
    this.borders.push(new StraightSegment(LEFT_GOALS, LOWER_GOALS, LEFT_BORDER, LOWER_GOALS)); 
    this.borders.push(new StraightSegment(LEFT_GOALS, UPPER_GOALS, LEFT_GOALS, LOWER_GOALS)); 
    // Right
    this.borders.push(new StraightSegment(RIGHT_BORDER, UPPER_GOALS, RIGHT_GOALS, UPPER_GOALS)); 
    this.borders.push(new StraightSegment(RIGHT_BORDER, LOWER_GOALS, RIGHT_GOALS, LOWER_GOALS)); 
    this.borders.push(new StraightSegment(RIGHT_GOALS, UPPER_GOALS, RIGHT_GOALS, LOWER_GOALS)); 

    // Game borders
    this.gameBorders = [];
    this.gameBorders.push(new StraightSegment(0, 0, GAME_WIDTH, 0)); 
    this.gameBorders.push(new StraightSegment(GAME_WIDTH, 0, GAME_WIDTH, GAME_HEIGHT)); 
    this.gameBorders.push(new StraightSegment(GAME_WIDTH, GAME_HEIGHT, 0, GAME_HEIGHT)); 
    this.gameBorders.push(new StraightSegment(0, GAME_HEIGHT, 0, 0)); 
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

  // Checks for collision with game borders
  // and modifies the state of passed object if collision occures
  collideWithGameBorders(object: MotileRoundObject): void {
    // Check collision with each border
    this.gameBorders.forEach(border => object.collideWithSegment(border));
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
  getInitialCoordinates(team: Team, position: number): ?Object {
    if (position > 4) {
      console.log("Wrong position number");
      return null;
    }

    const strPosition = position.toString();
    //console.log(team);
    return team == Team.LEFT ? LEFT_INITIAL_POSITIONS[strPosition] : RIGHT_INITIAL_POSITIONS[strPosition];
  }

  getCenter() {
    return {x: (LEFT_BORDER + RIGHT_BORDER) / 2, y: (UPPER_BORDER + LOWER_BORDER) / 2};
  }

  // Draws the whole field in the current graphics context
  draw() {
    if (!this.context) return;

    // Background
    this.context.fillStyle = "rgb(120, 211, 118)";
    this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    // Don't know why, but without this, the first fill operation doesn't fill the whole canvas
    // but leaves some white stripe at right
    this.context.fillRect(10, 0, this.context.canvas.width, this.context.canvas.height);

    // Border
    this.context.strokeStyle = "rgb(17, 49, 17)";
    this.context.strokeRect(0, 0, this.context.canvas.width, this.context.canvas.height);

    // Field background
    this.context.fillStyle = "rgb(140, 217, 138)";
    this.context.fillRect(LEFT_BORDER, UPPER_BORDER, (RIGHT_BORDER - LEFT_BORDER), (LOWER_BORDER - UPPER_BORDER));

    // Field borders
    this.context.strokeStyle = "rgb(225, 225, 225)";
    this.context.lineWidth = 3;
    this.context.strokeRect(LEFT_BORDER, UPPER_BORDER, (RIGHT_BORDER - LEFT_BORDER), (LOWER_BORDER - UPPER_BORDER));

    // Central line
    const centerX = (LEFT_BORDER + RIGHT_BORDER) / 2;
    this.context.beginPath();
    this.context.moveTo(centerX, UPPER_BORDER);
    this.context.lineTo(centerX, LOWER_BORDER);
    this.context.stroke();

    // Central circle
    this.context.beginPath();
    const centerY = (UPPER_BORDER + LOWER_BORDER) / 2;
    const centralRadius = (LOWER_BORDER - UPPER_BORDER) / 4;
    this.context.arc(centerX, centerY, centralRadius, 0, 2 * Math.PI);
    this.context.stroke();

    // Center
    this.context.beginPath();
    this.context.arc(centerX, centerY, 5, 0, 2 * Math.PI);
    this.context.fillStyle = "rgb(225, 225, 225)";
    this.context.fill();

    // Goalkeeper areas border
    // Left
    this.context.beginPath();
    this.context.moveTo(LEFT_BORDER, UPPER_GOALS - 20);
    this.context.lineTo(LEFT_BORDER + 80, UPPER_GOALS - 20);
    this.context.lineTo(LEFT_BORDER + 80, LOWER_GOALS + 20);
    this.context.lineTo(LEFT_BORDER, LOWER_GOALS + 20);
    this.context.stroke();
    // Right
    this.context.beginPath();
    this.context.moveTo(RIGHT_BORDER, UPPER_GOALS - 20);
    this.context.lineTo(RIGHT_BORDER - 80, UPPER_GOALS - 20);
    this.context.lineTo(RIGHT_BORDER - 80, LOWER_GOALS + 20);
    this.context.lineTo(RIGHT_BORDER, LOWER_GOALS + 20);
    this.context.stroke();

    // Goals lines
    this.context.strokeStyle = "rgb(102, 102, 102)";
    // Left
    this.context.beginPath();
    this.context.moveTo(LEFT_BORDER, UPPER_GOALS);
    this.context.lineTo(LEFT_GOALS, UPPER_GOALS);
    this.context.lineTo(LEFT_GOALS, LOWER_GOALS);
    this.context.lineTo(LEFT_BORDER, LOWER_GOALS);
    this.context.stroke()
    // Right
    this.context.beginPath();
    this.context.moveTo(RIGHT_BORDER, UPPER_GOALS);
    this.context.lineTo(RIGHT_GOALS, UPPER_GOALS);
    this.context.lineTo(RIGHT_GOALS, LOWER_GOALS);
    this.context.lineTo(RIGHT_BORDER, LOWER_GOALS);
    this.context.stroke()

    // Goals bars
    this.context.beginPath();
    this.context.arc(LEFT_BORDER, UPPER_GOALS, BAR_RADIUS, 0, 2 * Math.PI);
    this.context.fill();
    this.context.beginPath();
    this.context.arc(LEFT_BORDER, LOWER_GOALS, BAR_RADIUS, 0, 2 * Math.PI);
    this.context.fill();
    this.context.beginPath();
    this.context.arc(RIGHT_BORDER, UPPER_GOALS, BAR_RADIUS, 0, 2 * Math.PI);
    this.context.fill();
    this.context.beginPath();
    this.context.arc(RIGHT_BORDER, LOWER_GOALS, BAR_RADIUS, 0, 2 * Math.PI);
    this.context.fill();
  }
}
