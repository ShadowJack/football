import Game from "../../../web/static/js/football/game";
import {default as GameField, LEFT_BORDER, RIGHT_BORDER, UPPER_BORDER, LOWER_BORDER} from "../../../web/static/js/football/game_field";
import Player from "../../../web/static/js/football/player";
import Team from "../../../web/static/js/football/team";
import Ball from "../../../web/static/js/football/ball";

describe("Game", () => {
  it("constructor initializes gameField, player and ball", () => {
    let game = new Game(["1"], [], [], "1");

    expect(game).toEqual(jasmine.objectContaining({
      gameField: jasmine.any(GameField),
      userPlayer: jasmine.any(Player),
      ball: jasmine.any(Ball)
    }));
  });

  it("player's team is assigned during initialization", () => {
    let game = new Game(['0'], ["1"], [], "1");

    expect(game.userPlayer.team).toEqual(Team.RIGHT);
  });

  it("player is positioned on the field with regard to his team", () => {
    let game = new Game(["1"], [], [], "1");

    const centerX = (LEFT_BORDER + RIGHT_BORDER) / 2;
    expect(game.userPlayer.x).toBeLessThan(centerX);
  });

  it("puts the ball at the center of the game", () => {
    let game = new Game(["1"], [], [], "1");

    const centerX = (LEFT_BORDER + RIGHT_BORDER) / 2;
    const centerY = (UPPER_BORDER + LOWER_BORDER) / 2;
    expect(game.ball.x).toEqual(centerX);
    expect(game.ball.y).toEqual(centerY);
  });

  it("creates other players", () => {
    let game = new Game(["1"], ["2"], [], "1");

    expect(game.otherPlayers.has("2")).toEqual(true);
    expect(game.otherPlayers.has("1")).toEqual(false);
  })
});
