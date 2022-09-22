import { describe, test, expect } from "@jest/globals";
import { valueNotifierCollection } from "./";

describe("valueNotifierCollection", () => {
  test("listens to children", () => {
    const coll = valueNotifierCollection([1, 2, 3]);

    let count = 0;
    const cancel = coll.subscribe(() => count++);

    coll.value[0].set(-1);
    coll.value[1].set(-2);
    coll.value[2].set(-3);
    coll.value[2].set(-3);

    expect(count).toBe(3);

    cancel();
    coll.value[0].set(0);
    expect(count).toBe(3);
  });
});
