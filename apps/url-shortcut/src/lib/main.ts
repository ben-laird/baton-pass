import { add, subtract } from "./lib";

/**
 * The main script. When this package is `install`ed,
 * this is the function that will run when you call `npx <<package name>>` or similar.
 * @returns an integer representing the exit code of the program
 */
export async function main(): Promise<number> {
  const addMessage = `2 + 2 = ${add(2, 2)}`;
  console.log(addMessage);

  const minusMessage = `2 - 2 = ${subtract(2, 2)}`;
  console.log(minusMessage);

  return 0;
}
