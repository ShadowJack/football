// @flow

import GameField from "./game_field";
import Player from "./player";
import Team from "./team";
import NavigationEvent from "./navigation_event";
import Ball from "./ball";

const GAME_TIME_NORM = 16;
const GAME_TIME_TOTAL_SECONDS = 60 * 6;

export default class Game {
  gameField: GameField;
  userPlayer: Player;
  otherPlayers: Map<string, Player>;
  ball: Ball;
  // Time since the game started
  gameTimer: number;

  canvas: HTMLCanvasElement;
  lastRender: number;

  peers: Array<Peer>;

  constructor (team1: Array<string>, team2: Array<string>, peers: Array<Peer>, currentUserId: string) {
    // Save communicaton info
    this.peers = peers;

    // Create game canvas
    this.canvas = document.createElement("canvas");
    this.canvas.id = "GameCanvas";
    this.canvas.setAttribute("width", "800");
    this.canvas.setAttribute("height", "500");
    $("main").prepend(this.canvas);

    // Draw game field
    let context = this.canvas && this.canvas.getContext("2d");
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
    // Start game timer
    this.gameTimer = 0;
    $("#GameTimer").show();

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
    if (this.lastRender != 0) {
      this.gameTimer += millisecondsSinceLastRender;
    }

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
    let time = millisecondsSinceLastRender / GAME_TIME_NORM;

    // Update all positions
    this.userPlayer.move(time);
    this.otherPlayers.forEach(player => player.move(time));
    this.ball.move(time);

    // Check for collisions
    // Ball * Field
    this.gameField.collideWithBars(this.ball); 
    this.gameField.collideWithBorders(this.ball);

    // Current player * Field
    this.gameField.collideWithBars(this.userPlayer);
    this.gameField.collideWithGameBorders(this.userPlayer);

    // Current player * Ball
    this.userPlayer.collideWithMotileRoundObject(this.ball);

    this.otherPlayers.forEach(player => {
      // Other player * Field
      this.gameField.collideWithBars(player);
      this.gameField.collideWithGameBorders(player);
      // Other player * Current player
      player.collideWithMotileRoundObject(this.userPlayer);
      // Other player * Ball
      player.collideWithMotileRoundObject(this.ball);
      // Other player * All rest players
      this.otherPlayers.forEach(otherPlayer => {
        if (otherPlayer == player) return;
        player.collideWithMotileRoundObject(otherPlayer);
      });
    });

    /// Check game events
    // Check if the goal is scored
    const teamScored = this.gameField.isGoalScored(this.ball);
    if (teamScored) {
      // Display congratz message for a second
      this.showInfoMessage(`${teamScored == Team.LEFT ? "Left" : "Right"} team has scored a goal!`, 1000);
      // Reset the ball and all players
      this.ball.reset();
      this.userPlayer.reset();
      this.otherPlayers.forEach(p => p.reset());
    }

    // Check if game time is out
    if (this.gameTimer / 1000 >= GAME_TIME_TOTAL_SECONDS) {
      this.showInfoMessage("Time has run out");
    }
  }

  showInfoMessage(text: string, duration: number = 0) {
    $("#InfoMessage").html(text);
    $("#InfoMessage").show();
    if (duration) {
      setTimeout(() => $("#InfoMessage").hide(), 1000);
    }
  }

  redraw() {
    const fullSeconds = Math.floor(this.gameTimer / 1000);
    const minutes = Math.floor(fullSeconds / 60);
    const seconds = fullSeconds % 60;
    $("#GameTimer").text(`0${minutes}:${seconds < 10 ? "0" + seconds : seconds}`);

    this.userPlayer.draw();
    this.otherPlayers.forEach(player => player.draw());
    this.ball.draw();
  }
}
