// @flow


import MotileRoundObject from "./motile_round_object";


const TENSION_COEFF = 0.95;
const BALL_MASS = 1;
const BALL_RADIUS = 14;

export default class Ball extends MotileRoundObject {
  constructor(x: number, y: number) {
    super(x, y, BALL_RADIUS, BALL_MASS);
    this.draw();
  }

  draw() {
    if (!this.displayedElement) {
      this.displayedElement = $("<div/>", {
        "class": "motile-round-object ball",
        "width": this.radius * 2,
        "height": this.radius * 2
      });
      $("main").append(this.displayedElement);
    }

    this.displayedElement.css("left", this.x - this.radius);
    this.displayedElement.css("top", this.y - this.radius);
  }
}
