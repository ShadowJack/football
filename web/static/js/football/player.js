// @flow

import MotileRoundObject from "./motile_round_object";
import NavigationEvent from "./navigation_event";
import Ball from "./ball";
import Team from "./team"

// Absolute maximum speed for the player
const MAX_SPEED = 1.7;

const PLAYER_MASS = 1;
const PLAYER_RADIUS = 16;
const SPHERE_RADIUS = 24;


export default class Player extends MotileRoundObject {
  // Team the player belongs to
  team: Team;
  // State of up/right/down/left directions pressed
  keysPressed: Object;

  constructor(x: number, y: number, team: Team, type: string) {
    super(x, y, PLAYER_RADIUS, PLAYER_MASS, 0, 0);

    this.team = team;

    this.cssClass = `player ${type}`;

    this.keysPressed = {}; 
    this.keysPressed[NavigationEvent.UP] = false;
    this.keysPressed[NavigationEvent.RIGHT] = false;
    this.keysPressed[NavigationEvent.DOWN] = false;
    this.keysPressed[NavigationEvent.LEFT] = false;
  }

  // Checks if our player collides with 
  // other motile object and if so, changes speed 
  // of other object according to their momentums.
  collideWithMotileRoundObject(otherObj: MotileRoundObject): MotileRoundObject {
    if (!this.isCollidingWithRoundObject(otherObj)) {
      return otherObj;
    }

    let {x, y, radius, mass, vx, vy} = otherObj;

    // Calculate distance
    const distX = this.x - x; 
    const distY = this.y - y;
    const distance = Math.sqrt(distX * distX + distY * distY);

    // Calculate angle between line that connects centers of circles
    // and projection of this line to X axis
    const cosX = distX / distance; 
    const sinX = distY / distance;

    // Place both object so that they are not intersecting
    // 1. Calc the center of line that connects centers of
    // both objects
    const midX = (this.x + x) / 2;
    const midY = (this.y + y) / 2;
    // 2. Move both objects
    this.x = midX + this.radius * cosX;
    this.y = midY + this.radius * sinX;
    otherObj.x = midX - radius * cosX;
    otherObj.y = midY - radius * sinX;
    
    // Rotate vectors of speed so that the centers of both circles are placed on the X axis
    const rotatedThisVX = this.vx * cosX + this.vy * sinX;
    const rotatedThisVY = this.vx * (-sinX) + this.vy * cosX;
    const rotatedObjVX = vx * cosX + vy * sinX;
    const rotatedObjVY = vx * (-sinX) + vy * cosX;
    
    // Calculate new speeds - only X components are changed
    const newRotatedThisVX = ((this.mass - mass) * rotatedThisVX + 2 * mass * rotatedObjVX) / (this.mass + mass);
    const newRotatedObjVX = rotatedThisVX + newRotatedThisVX - rotatedObjVX;

    // Rotate speeds back
    otherObj.vx = newRotatedObjVX * cosX - rotatedObjVY * sinX;
    otherObj.vy = newRotatedObjVX * sinX + rotatedObjVY * cosX;

    return otherObj;
  }

  collideWithPlayer(otherPlayer: Player) {

  }


  handleNavigationEvent({type, direction}: NavigationEvent): void {
    this.keysPressed[direction] = type === NavigationEvent.PRESSED;
    this.updateSpeed();
  }

  updateSpeed(): void {
    // Default speed values
    let vx = 0;
    let vy = 0;

    if(this.keysPressed[NavigationEvent.UP]) vy -= MAX_SPEED;
    if(this.keysPressed[NavigationEvent.RIGHT]) vx += MAX_SPEED;
    if(this.keysPressed[NavigationEvent.DOWN]) vy += MAX_SPEED;
    if(this.keysPressed[NavigationEvent.LEFT]) vx -= MAX_SPEED;

    // Normalize total speed not to exceed MAX_SPEED
    if (vx !== 0 && vy !== 0) {
      const norm = 1 / Math.sqrt(2);
      vx *= norm;
      vy *= norm;
    }

    this.vx = vx;
    this.vy = vy;
  }

  // Update speed of the ball if it's inside
  // of player's sphere
  kick(ball: Ball) {
    const distX = this.x - ball.x; 
    const distY = this.y - ball.y;
    const distance = Math.sqrt(distX * distX + distY * distY);

    if(distance > SPHERE_RADIUS + ball.radius) {
      return;
    }


    // Push the ball along the line that connects
    // centers of the player and the ball.

    // More the distance - less the speed of the ball
    const MAX_BALL_SPEED = 10;
    const MIN_BALL_SPEED = 0.1;
 
    // Formula for resulting ball speed: vBall = a * delta + b
    var a = (MAX_BALL_SPEED - MIN_BALL_SPEED) / (this.radius - SPHERE_RADIUS); 
    var b = MAX_BALL_SPEED - a * this.radius;
    var newBallSpeed = a * (distance - ball.radius) + b;

    // sin and cos of angle between line that connects
    // centers of the player and the ball and X axis
    const cosX = -distX / distance; 
    const sinX = -distY / distance;

    ball.vx = cosX * newBallSpeed;
    ball.vy = sinX * newBallSpeed;
  }

  // Update player position
  move(timePassed: number) {
    this.x += this.vx * timePassed;
    this.y += this.vy * timePassed;
  }
}
