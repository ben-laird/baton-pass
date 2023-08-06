import { describe } from "vitest";
import { fc, test } from "@fast-check/vitest";

describe("Math Helpers tests", () => {
  test.prop([fc.integer(), fc.integer()])(
    "Should add two numbers",
    (number1, number2) => number1 + number2 * 2 === number1 + number2 + number2,
  );
});
