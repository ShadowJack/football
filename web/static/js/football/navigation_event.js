// @flow
type Direction = "UP" | "RIGHT" | "DOWN" | "LEFT";
type EventType = "PRESSED" | "RELEASED";


const _UP = "UP";
const _RIGHT = "RIGHT";
const _DOWN = "DOWN";
const _LEFT = "LEFT";

const _PRESSED = "PRESSED";
const _RELEASED = "RELEASED";


export default class NavigationEvent {
  type: EventType;
  direction: Direction;

  constructor(type: EventType, direction: Direction) {
    this.type = type;
    this.direction = direction;
  }

  static get UP(): Direction {
    return _UP;
  }

  static get RIGHT(): Direction {
    return _RIGHT;
  }

  static get DOWN(): Direction {
    return _DOWN;
  }

  static get LEFT(): Direction {
    return _LEFT;
  }

  static get PRESSED(): EventType {
    return _PRESSED;
  }

  static get RELEASED(): EventType {
    return _RELEASED;
  }
}
