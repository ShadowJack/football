import Game from "../../../web/static/js/football/game";
import GameField from "../../../web/static/js/football/game_field";
import Player from "../../../web/static/js/football/player";

describe("Game", () => {
  it("constructor initializes gameField, player and ball", () => {
    let game = new Game(true);

    expect(game).toEqual(jasmine.objectContaining({
      gameField: jasmine.any(GameField),
      userPlayer: jasmine.any(Player),
      //ball: jasmine.anything(),
    }));
  });

  it("player's team is assigned during initialization", () => {
    let game = new Game(false);

    expect(game.userPlayer.team).toEqual(false);
  });
});
