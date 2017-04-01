// @flow

import GameField from "./game_field";
import Player from "./player";
import Team from "./team";
import NavigationEvent from "./navigation_event";
import Ball from "./ball";

const GAME_TIME_NORM = 16;
const GAME_TIME_TOTAL_SECONDS = 60 * 6;
const BROADCAST_PERIOD = 50;

export default class Game {
  gameField: GameField;
  userPlayer: Player;
  userId: string;
  otherPlayers: Map<string, Player>;
  ball: Ball;
  // Time since the game started
  gameTimer: number;
  score: Map<Team, number>;

  canvas: HTMLCanvasElement;
  lastRender: number;
  lastBroadcast: number;

  peers: Array<Peer>;

  constructor (team1: Array<string>, team2: Array<string>, peers: Array<Peer>, currentUserId: string) {
    this.userId = currentUserId;

    // Save communicaton info
    this.peers = peers;
    this.peers.forEach(peer => {
      if (!peer.dataChannel) return;

      peer.dataChannel.onmessage = (event) => this.onMessageReceived(event);
    });

    // Setup initial score
    this.score = new Map;
    this.score.set(Team.LEFT, 0);
    this.score.set(Team.RIGHT, 0);

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
    this.lastBroadcast = 0;
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
      this.broadcastState();
      return;
    }

    // handle "kick" event
    if(evt.type == "keydown" && evt.which == 32) {
      this.userPlayer.kick(this.ball);
      this.broadcastState();
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

    // Broadcast current state approximately once in 50ms
    if (timestamp - this.lastBroadcast >= BROADCAST_PERIOD) {
      this.broadcastState();
      this.lastBroadcast = timestamp;
    }

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
      // Other player * Ball
      player.collideWithMotileRoundObject(this.ball);
      // Other player * Current player
      this.userPlayer.collideWithRoundObject(player);

      // NOTICE: Commented out because we expect
      // that all other players will check for collisions
      // and send results to us
      //
      // Other player * All rest players
      // this.otherPlayers.forEach(otherPlayer => {
      //   if (otherPlayer == player) return;
      //   player.collideWithRoundObject(otherPlayer);
      // });
    });

    /// Check game events
    // Check if the goal is scored
    const teamScored = this.gameField.isGoalScored(this.ball);
    if (teamScored != null) {
      // Display congratz message for a second
      this.showInfoMessage(`${teamScored == Team.LEFT ? "Left" : "Right"} team has scored a goal!`, 1000);
      this.score.set(teamScored, this.score.get(teamScored) + 1);

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

    $("#Score").text(`${this.score.get(Team.LEFT)}:${this.score.get(Team.RIGHT)}`);

    this.userPlayer.draw();
    this.otherPlayers.forEach(player => player.draw());
    this.ball.draw();
  }

  broadcastState() {
    this.peers.forEach(peer => {
      if (!peer.dataChannel) return;

      const payload = {
        id: this.userId,
        b: {
          x: this.ball.x.toFixed(2),
          y: this.ball.y.toFixed(2),
          vx: this.ball.vx.toFixed(2),
          vy: this.ball.vy.toFixed(2)
        },
        p: {
          x: this.userPlayer.x.toFixed(2),
          y: this.userPlayer.y.toFixed(2),
          vx: this.userPlayer.vx.toFixed(2),
          vy: this.userPlayer.vy.toFixed(2)
        }
      };
      peer.dataChannel.send(JSON.stringify(payload));
    });
  }

  onMessageReceived(event: any) {
    const payload = JSON.parse(event.data);

    const player = this.otherPlayers.get(payload.id);
    if (!player) return;

    // Update player position
    const {x, y, vx, vy} = payload.p;
    player.x = parseFloat(x);
    player.y = parseFloat(y);
    player.vx = parseFloat(vx);
    player.vy = parseFloat(vy);

    // Merge ball info
    this.ball.merge(payload.b);
  }
}
