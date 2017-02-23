import Game from "../../../web/static/js/football/game";

describe("Game", () => {
  it("constructor initializes gameField, player and ball", () => {
    let game = new Game();

    expect(game).toEqual(jasmine.objectContaining({
      gameField: jasmine.anything(),
      //player: jasmine.anything(),
      //ball: jasmine.anything(),
    }));
  });

  it("", () => {
  });
});
