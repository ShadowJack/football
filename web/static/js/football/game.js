// @flow

import GameField from "./game_field";
import Player from "./player";
import NavigationEvent from "./navigation_event";

export default class Game {
  gameField: GameField;
  userPlayer: Player;

  constructor (userTeam: bool, userPosition: number) {
    this.gameField = new GameField();

    // Put player on the field according to its initial position
    const coordinates = this.gameField.getInitialCoordinates(userTeam, userPosition);
    if (!coordinates) {
      // TODO: show error message
      return;
    }
    this.userPlayer = new Player(coordinates.x, coordinates.y, userTeam); 
    //this.ball = new Ball();
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
      //TODO: Handle kick event
  }

}
