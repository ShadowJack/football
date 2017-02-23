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
    let object = new MotileRoundObject(400, 250, 10, 1);
    gameField.collideWithBars(object);

    expect(object).toEqual(new MotileRoundObject(400, 250, 10, 1));
  });

  it("changes motile round game object speed if it touches bars", () => {
    let object = new MotileRoundObject(10, 175, 5, 1);
    gameField.collideWithBars(object);

    expect(object).not.toEqual(new MotileRoundObject(10, 175, 5, 1));
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
});
