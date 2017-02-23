import GameField from "../../../web/static/js/football/game_field";
import MotileRoundObject from "../../../web/static/js/football/motile_round_object";

describe("GameField", () => {
  let gameField;

  beforeEach(function() {
    gameField = new GameField();
  });

  it("constructor initializes goal bars", () => {
    expect(gameField).toEqual(jasmine.objectContaining({
      bars: jasmine.any(Array),
    }));
    expect(gameField.bars.length).toEqual(4);
  });

  it("doesn't change motile round game object if it doesn't touch bars", () => {
    let centralObject = new MotileRoundObject(400, 250, 10, 1);
    let objAfter = gameField.collideWithBars(centralObject);

    expect(objAfter).toEqual(centralObject);
  });

  it("changes motile round game object speed if it touches bars", () => {
    let collidingObj = new MotileRoundObject(10, 175, 5, 1);
    let objAfter = gameField.collideWithBars(obj);

    expect(objAfter).not.toEqual(collidingObj);
  });

  it("doesn't change motile round game object's speed if it doesn't touch field boundaries", () => {
    let centralObject = new MotileRoundObject(400, 250, 10, 1);
    let objAfter = gameField.collideWithBorders(centralObject);

    expect(objAfter).toEqual(centralObject);
  });

  it("changes motile round game object speed if it touches field boundaries", () => {
    let collidingObj = new MotileRoundObject(50, 100, 10, 1);
    let objAfter = gameField.collideWithBorders(obj);

    expect(objAfter).not.toEqual(collidingObj);
  });
});
