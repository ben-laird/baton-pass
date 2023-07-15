import { describe } from "vitest";
import { fc, test } from "@fast-check/vitest";

import { add } from "../src";

describe("Math Helpers tests", () => {
  test.prop([fc.integer(), fc.integer()])(
    "Should add two numbers",
    (number1, number2) => add(number1, number2) === number1 + number2
  );
});
