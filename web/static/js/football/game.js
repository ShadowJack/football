// @flow
import GameField from "./game_field";
import Player from "./player";
import NavigationEvent from "./navigation_event";


export default class Game {
  gameField: GameField;
  userPlayer: Player;

  constructor (userTeam: bool) {
    console.log("User team:", userTeam);
    this.gameField = new GameField();
    this.userPlayer = new Player(0, 0, userTeam); 
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
