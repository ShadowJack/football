import Player from "../../../web/static/js/football/player";
import Team from "../../../web/static/js/football/team";
import NavigationEvent from "../../../web/static/js/football/navigation_event";
import Ball from "../../../web/static/js/football/ball";


describe("Player", () => {
  it("is assigned to one of two teams", () => {
    let player = new Player(0, 0, Team.LEFT);

    expect(player).toEqual(jasmine.objectContaining({
      team: Team.LEFT
    }));
  });

  it("handles external navigation events by changing player's state", () => {
    let player = new Player(200, 200, Team.LEFT);

    let event = new NavigationEvent(NavigationEvent.PRESSED, NavigationEvent.UP);
    player.handleNavigationEvent(event);

    expect(player.keysPressed[NavigationEvent.UP]).toEqual(true);
    expect(player.keysPressed[NavigationEvent.DOWN]).toEqual(false);
    expect(player.keysPressed[NavigationEvent.LEFT]).toEqual(false);
    expect(player.keysPressed[NavigationEvent.RIGHT]).toEqual(false);
  });

  it("changes player's speed when navigation event is received", () => {
    let player = new Player(200, 200, Team.LEFT);

    let event = new NavigationEvent(NavigationEvent.PRESSED, NavigationEvent.RIGHT);
    player.handleNavigationEvent(event);

    expect(player.vx).toBeGreaterThan(0);
  });

  it("has limited max speed", () => {
    let player = new Player(200, 200, Team.RIGHT);
    let event = new NavigationEvent(NavigationEvent.PRESSED, NavigationEvent.UP);
    player.handleNavigationEvent(event);

    let maxSpeed = Math.abs(player.vy);
    let anotherEvent = new NavigationEvent(NavigationEvent.PRESSED, NavigationEvent.RIGHT);
    player.handleNavigationEvent(anotherEvent);

    let currentSpeed = Math.sqrt(player.vx * player.vx + player.vy * player.vy);
    expect(currentSpeed).toBeCloseTo(maxSpeed, 0.1);
  });

  it("does't move when all navigation keys are up", () => {
    let player = new Player(200, 200, Team.RIGHT);
    let event = new NavigationEvent(NavigationEvent.PRESSED, NavigationEvent.RIGHT);
    player.handleNavigationEvent(event);

    let releaseEvent = new NavigationEvent(NavigationEvent.RELEASED, NavigationEvent.RIGHT);
    player.handleNavigationEvent(releaseEvent);

    expect(player.vx).toEqual(0);
  });

  it("changes the speed of the ball if ball is near and kick is pressed", () => {
    let player = new Player(200, 200, Team.RIGHT);
    let ball = new Ball(200, 220);

    player.kick(ball);

    expect(ball.vy).not.toEqual(0);
  });

  it("doesn't affect the ball if it's out of sphere of player's influence", () => {
    let player = new Player(200, 200, Team.RIGHT);
    let ball = new Ball(200, 300);

    player.kick(ball);

    expect(ball.vx).toEqual(0);
    expect(ball.vy).toEqual(0);
  });

  it("changes position according to speed and time passed", () => {
    let player = new Player(200, 200, Team.LEFT);
    player.vx = 4;
    player.vy = -3;

    const timePassed = 2;
    player.move(timePassed);

    expect(player.x).toEqual(208);
    expect(player.y).toEqual(194);
  });
});
