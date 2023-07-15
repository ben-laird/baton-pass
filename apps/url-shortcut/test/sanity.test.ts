import { fc, test } from "@fast-check/vitest";
import { assert, describe, it } from "vitest";

describe("Passing sanity test", () => {
  it("Should just pass", () => assert(1 + 1 === 2));

  test.prop([fc.float({ noNaN: true })])(
    "Should also pass",
    (num) => 2 * num === num + num,
  );
});
