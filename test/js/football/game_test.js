import Game from "../../../web/static/js/football/game";
import {default as GameField, LEFT_BORDER, RIGHT_BORDER} from "../../../web/static/js/football/game_field";
import Player from "../../../web/static/js/football/player";

describe("Game", () => {
  it("constructor initializes gameField, player and ball", () => {
    let game = new Game(true, 1);

    expect(game).toEqual(jasmine.objectContaining({
      gameField: jasmine.any(GameField),
      userPlayer: jasmine.any(Player),
      //ball: jasmine.anything(),
    }));
  });

  it("player's team is assigned during initialization", () => {
    let game = new Game(false, 1);

    expect(game.userPlayer.team).toEqual(false);
  });

  it("player is positioned on the field with regard to his team", () => {
    let game = new Game(true, 1);

    const centerX = (LEFT_BORDER + RIGHT_BORDER) / 2;
    expect(game.userPlayer.x).toBeLessThan(centerX);
  });
});
