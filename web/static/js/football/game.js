// @flow

import GameField from "./game_field";
import Player from "./player";
import NavigationEvent from "./navigation_event";
import Ball from "./ball";

export default class Game {
  gameField: GameField;
  userPlayer: Player;
  ball: Ball;

  constructor (userTeam: bool, userPosition: number) {
    this.gameField = new GameField();

    // Put player on the field according to its initial position
    const playerCoords = this.gameField.getInitialCoordinates(userTeam, userPosition);
    if (!playerCoords) {
      // TODO: show error message
      return;
    }
    this.userPlayer = new Player(playerCoords.x, playerCoords.y, userTeam); 

    const ballCoords = this.gameField.getCenter();
    this.ball = new Ball(ballCoords.x, ballCoords.y);
  }

  start() {
    // Handle keys that manage player movement
    $(document).keydown(this.handleKeyEvent);
    $(document).keyup(this.handleKeyEvent);
    return;
  }

  handleKeyEvent(evt: Object) {
    let navEvent = NavigationEvent.handleKeyEvent(evt);
    if (navEvent) {
      this.userPlayer.handleNavigationEvent(navEvent);
      return;
    }

    // handle "kick" event
    if(evt.type == "keydown" && evt.which == 32) {
      this.userPlayer.kick(this.ball);
    }
  }

}
