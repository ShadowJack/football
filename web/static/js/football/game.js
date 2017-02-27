// @flow
import GameField from "./game_field";
import Player from "./player";


export default class Game {
  gameField: GameField;
  userPlayer: Player;

  constructor (userTeam: bool) {
    this.gameField = new GameField();
    //TODO: put player randomly somewhere on the field
    this.userPlayer = new Player(0, 0, userTeam); 
    //TODO: send info about player team and position to peers

    //this.ball = new Ball();
  }

  start() {
    console.log("Not implemented");
    return;
  }
}
