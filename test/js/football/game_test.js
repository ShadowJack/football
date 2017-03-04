import Game from "../../../web/static/js/football/game";
import {default as GameField, LEFT_BORDER, RIGHT_BORDER, UPPER_BORDER, LOWER_BORDER} from "../../../web/static/js/football/game_field";
import Player from "../../../web/static/js/football/player";
import Ball from "../../../web/static/js/football/ball";

describe("Game", () => {
  it("constructor initializes gameField, player and ball", () => {
    let game = new Game(true, 1);

    expect(game).toEqual(jasmine.objectContaining({
      gameField: jasmine.any(GameField),
      userPlayer: jasmine.any(Player),
      ball: jasmine.any(Ball)
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

  it("pust the ball at the center of the game", () => {
    let game = new Game(true, 1);

    const centerX = (LEFT_BORDER + RIGHT_BORDER) / 2;
    const centerY = (UPPER_BORDER + LOWER_BORDER) / 2;
    expect(game.ball.x).toEqual(centerX);
    expect(game.ball.y).toEqual(centerY);
  });
});
