import RoundObject from "../../../web/static/js/football/round_object";

describe("RoundObject", () => {
  it("constructor initializes position and radius", () => {
    let obj = new RoundObject(1, 2, 3, 4);

    expect(obj).toEqual(jasmine.objectContaining({
      x: jasmine.any(Number), 
      y: jasmine.any(Number), 
      radius: jasmine.any(Number), 
    }));
  });
});
