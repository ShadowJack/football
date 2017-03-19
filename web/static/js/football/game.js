// @flow

import GameField from "./game_field";
import Player from "./player";
import Team from "./team";
import NavigationEvent from "./navigation_event";
import Ball from "./ball";

const gameTimeNorm = 16;

export default class Game {
  gameField: GameField;
  userPlayer: Player;
  otherPlayers: Map<string, Player>;
  ball: Ball;

  canvas: ?HTMLCanvasElement;
  lastRender: number;

  peers: Array<Peer>;

  constructor (team1: Array<string>, team2: Array<string>, peers: Array<Peer>, currentUserId: string, canvas: ?HTMLCanvasElement = null) {
    // Save communicaton info
    this.peers = peers;

    this.canvas = canvas;
    let context = canvas && canvas.getContext("2d");
    this.gameField = new GameField(context);
    this.gameField.draw();

    /// Create the player object owned by current user
    let {playerCoords, team} = this.getPlayerTeamAndPosition(team1, team2, currentUserId);
    if (!playerCoords) {
      // TODO: show error message
      console.log("Wasn't able to setup current player position");
      return;
    }
    this.userPlayer = new Player(playerCoords.x, playerCoords.y, team, "user-player"); 

    // Initialize all other players
    this.otherPlayers = new Map();
    team1.concat(team2).forEach((playerId) => {
      if (playerId == currentUserId) return;

      let data = this.getPlayerTeamAndPosition(team1, team2, playerId);
      if (!data.playerCoords) {
        console.log(`Wasn't able to setup player: ${playerId}`);
        return;
      }

      let newPlayer = new Player(data.playerCoords.x, data.playerCoords.y, data.team, data.team == team ? "alley-player" : "enemy-player");
      this.otherPlayers.set(playerId, newPlayer);
    });

    // Put the ball at the center
    const ballCoords = this.gameField.getCenter();
    this.ball = new Ball(ballCoords.x, ballCoords.y);
  }

  getPlayerTeamAndPosition(team1: Array<string>, team2: Array<string>, currentUserId: string) {
    // Check what team current user belongs to
    let team = team1.indexOf(currentUserId) != -1 ? Team.LEFT : Team.RIGHT;
    let position = team == Team.LEFT ? team1.indexOf(currentUserId) : team2.indexOf(currentUserId);
    // Get field coordeinates according to player's initial position
    const playerCoords = this.gameField.getInitialCoordinates(team, position);
    return {playerCoords, team};
  }

  start() {
    // Handle keys that manage player movement
    $(document).keydown((evt) => this.handleKeyEvent(evt));
    $(document).keyup((evt) => this.handleKeyEvent(evt));
    this.lastRender = 0;
    window.requestAnimationFrame(timestamp => this.gameLoop(timestamp));
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

  ///
  // Main game loop - update world state,
  // redraw everything movable, wait for another iteration
  gameLoop(timestamp: number) {
    let millisecondsSinceLastRender = timestamp - this.lastRender;

    this.updateState(millisecondsSinceLastRender);

    this.redraw();

    // TODO: Send info to peers

    this.lastRender = timestamp;
    window.requestAnimationFrame(timestamp => this.gameLoop(timestamp));
  }

  ///
  // Update game state based on the time passed
  // since the last update
  updateState(millisecondsSinceLastRender: number) {
    // Normalize time in the game
    let time = millisecondsSinceLastRender / gameTimeNorm;

    // Update all positions
    this.userPlayer.move(time);
    this.otherPlayers.forEach(player => player.move(time));
    this.ball.move(time);

    // Check for collisions
    this.gameField.collideWithBars(this.ball); 
    this.gameField.collideWithBorders(this.ball);

    this.gameField.collideWithBars(this.userPlayer);
    this.gameField.collideWithBorders(this.userPlayer);

    //TODO: implement
    this.userPlayer.collideWithMotileRoundObject(this.ball);

    this.otherPlayers.forEach(player => {
      this.gameField.collideWithBars(player);
      this.gameField.collideWithBorders(player);
      player.collideWithMotileRoundObject(this.userPlayer);
      player.collideWithMotileRoundObject(this.ball);
      this.otherPlayers.forEach(otherPlayer => {
        if (otherPlayer == player) return;
        player.collideWithMotileRoundObject(otherPlayer);
      });
    });

    // TODO: Check for game events

  }

  redraw() {
    this.userPlayer.draw();
    this.otherPlayers.forEach(player => player.draw());
    this.ball.draw();
  }
}
