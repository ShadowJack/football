// @flow
import GameField from "./game_field";

export default class Game {
  gameField: GameField;

  constructor () {
    this.gameField = new GameField();
    //this.player = new Player();
    //this.ball = new Ball();
  }

  start() {
    console.log("Not implemented");
    return;
  }
}
