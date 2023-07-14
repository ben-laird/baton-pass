import { fc, test } from "@fast-check/vitest";
import { describe } from "vitest";

describe("Passing sanity test", (it) => {
  it("Should just pass", ({ expect }) => expect(1 + 1 === 2));

  test.prop([fc.float({ noNaN: true })])(
    "Should also pass",
    (num) => 2 * num === num + num,
  );
});
