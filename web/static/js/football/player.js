// @flow

import MotileRoundObject from "./motile_round_object";
import NavigationEvent from "./navigation_event";


// Absolute maximum speed for the player
const MAX_SPEED = 1.7;

const PLAYER_MASS = 1;
const PLAYER_RADIUS = 16;
const SPHERE_RADIUS = 24;


export default class Player extends MotileRoundObject {
  // Team of a player: true - left, false - right
  team: bool;
  // State of up/right/down/left directions pressed
  keysPressed: Object;

  constructor(x: number, y: number, team: bool) {
    super(x, y, PLAYER_RADIUS, PLAYER_MASS, 0, 0);

    this.team = team;

    this.keysPressed = {}; 
    this.keysPressed[NavigationEvent.UP] = false;
    this.keysPressed[NavigationEvent.RIGHT] = false;
    this.keysPressed[NavigationEvent.DOWN] = false;
    this.keysPressed[NavigationEvent.LEFT] = false;
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
      vx /= norm;
      vy /= norm;
    }

    this.vx = vx;
    this.vy = vy;
  }

}
