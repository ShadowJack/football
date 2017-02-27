import Player from "../../../web/static/js/football/player";
import NavigationEvent from "../../../web/static/js/football/navigation_event";


describe("Player", () => {
  it("is assigned to one of two teams", () => {
    let player = new Player(0, 0, true);

    expect(player).toEqual(jasmine.objectContaining({
      team: true
    }));
  });

  it("handles external navigation events by changing player's state", () => {
    let player = new Player(200, 200, true);

    let event = new NavigationEvent(NavigationEvent.PRESSED, NavigationEvent.UP);
    player.handleNavigationEvent(event);

    expect(player.keysPressed[NavigationEvent.UP]).toEqual(true);
    expect(player.keysPressed[NavigationEvent.DOWN]).toEqual(false);
    expect(player.keysPressed[NavigationEvent.LEFT]).toEqual(false);
    expect(player.keysPressed[NavigationEvent.RIGHT]).toEqual(false);
  });

  it("changes player's speed when navigation event is received", () => {
    let player = new Player(200, 200, false);

    let event = new NavigationEvent(NavigationEvent.PRESSED, NavigationEvent.RIGHT);
    player.handleNavigationEvent(event);

    expect(player.vx).toBeGreaterThan(0);
  });

  it("has limited max speed", () => {
    let player = new Player(200, 200, false);
    let event = new NavigationEvent(NavigationEvent.PRESSED, NavigationEvent.UP);
    player.handleNavigationEvent(event);

    let maxSpeed = Math.abs(player.vy);
    let anotherEvent = new NavigationEvent(NavigationEvent.PRESSED, NavigationEvent.RIGHT);
    player.handleNavigationEvent(event);

    let currentSpeed = Math.sqrt(player.vx * player.vx + player.vy * player.vy);
    expect(currentSpeed).toBeCloseTo(maxSpeed, 0.1);
  });

  it("does't move when all navigation keys are up", () => {
    let player = new Player(200, 200, false);
    let event = new NavigationEvent(NavigationEvent.PRESSED, NavigationEvent.RIGHT);
    player.handleNavigationEvent(event);

    let releaseEvent = new NavigationEvent(NavigationEvent.RELEASED, NavigationEvent.RIGHT);
    player.handleNavigationEvent(releaseEvent);

    expect(player.vx).toEqual(0);
  });
});
