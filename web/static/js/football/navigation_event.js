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

  static handleKeyEvent(evt: Object): ?NavigationEvent {
    let eventType: string;
    if (evt.type === "keydown") {
      eventType = _PRESSED;
    }
    else if (evt.type === "keyup") {
      eventType = _RELEASED;
    }
    else {
      return;
    }

    let direction: string;
    switch (evt.which) {
      case 37:
      case 65:
        direction = _LEFT;
        break;
      case 38:
      case 87:
        direction = _UP;
        break;
      case 39:
      case 68:
        direction = _RIGHT;
        break;
      case 40:
      case 83:
        direction = _DOWN;
        break;
      default:
        return;
    }

    return new NavigationEvent(eventType, direction);
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
