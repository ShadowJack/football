import GameField from "../../../web/static/js/football/game_field";
import MotileRoundObject from "../../../web/static/js/football/motile_round_object";
import GoalsType from "../../../web/static/js/football/goals_type";

describe("GameField", () => {
  let gameField;

  beforeEach(function() {
    gameField = new GameField(null);
  });

  it("constructor initializes goal bars", () => {
    expect(gameField).toEqual(jasmine.objectContaining({
      bars: jasmine.any(Array),
    }));
    expect(gameField.bars.length).toEqual(4);
  });

  it("doesn't change motile round game object if it doesn't touch bars", () => {
    let object = new MotileRoundObject(400, 250, 10, 1);
    gameField.collideWithBars(object);

    expect(object).toEqual(new MotileRoundObject(400, 250, 10, 1));
  });

  it("changes motile round game object speed if it touches bars", () => {
    let object = new MotileRoundObject(48, 175, 5, 1);
    gameField.collideWithBars(object);

    expect(object).not.toEqual(new MotileRoundObject(48, 175, 5, 1));
  });

  it("doesn't change motile round game object's speed if it doesn't touch field boundaries", () => {
    let object = new MotileRoundObject(400, 250, 10, 1);
    gameField.collideWithBorders(object);

    expect(object).toEqual(new MotileRoundObject(400, 250, 10, 1));
  });

  it("changes motile round game object speed if it touches field boundaries", () => {
    let object = new MotileRoundObject(50, 100, 10, 1);
    gameField.collideWithBorders(object);

    expect(object).not.toEqual(new MotileRoundObject(50, 100, 10, 1));
  });

  it("changes motile round game object speed if it touches goal boundaries", () => {
    let object = new MotileRoundObject(15, 250, 10, 1);
    gameField.collideWithBorders(object);

    expect(object.x).toEqual(17);
  });

  it("changes motile round game object speed if it touches game boundaries", () => {
    let object = new MotileRoundObject(5, 5, 10, 1);
    gameField.collideWithGameBorders(object);

    expect(object.x).toEqual(10);
    expect(object.y).toEqual(10);
  });

  it("detacts that round object is inside goals", () => {
    let object = new MotileRoundObject(20, 250, 10, 1);
    let goals = gameField.isGoalScored(object);

    expect(goals).toEqual(GoalsType.LEFT);
  });

  it("detacts that round object is not inside goals", () => {
    let object = new MotileRoundObject(400, 250, 10, 1);
    let isInsideGoals = gameField.isGoalScored(object);

    expect(isInsideGoals).toEqual(false);
  });
});
