import Ball from "../../../web/static/js/football/ball";


describe("Ball", () => {
  it("updates its position and speed according to time passed", () => {
    let ball = new Ball(100, 100);
    ball.vx = 5;
    ball.vy = -6;

    const timePassed = 5;
    ball.move(timePassed)

    expect(ball.x).toBeGreaterThan(100);
    expect(ball.y).toBeLessThan(100);
    expect(ball.vx).toBeLessThan(5);
    expect(ball.vy).toBeGreaterThan(-6);
  });

  it("stops eventually", () => {
    let ball = new Ball(100, 100);
    ball.vx = 1;

    ball.move(100);

    expect(ball.vx).toEqual(0);
  });
});
