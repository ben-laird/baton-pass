import { describe } from "vitest";
import { UTFInput, UTFOutput } from "./fixtures";

import { UniTransformer } from "../src";

describe("UniTransformer", (it) => {
  it("should construct", ({ expect }) => {
    const tr = UniTransformer.new<UTFInput, UTFOutput>()
      .eco({
        env: { memes: "" },
        meta: "memes",
      })
      .ctx(() => undefined)
      .create({
        xToY: ({ testValue }) => ({ type: "Y", testValue }),
      });

    const testOutput = tr.transform({ type: "X", testValue: "memes hee hee" });

    expect(testOutput);
  });
});
