#!/usr/bin/env node
/*
 * try appending the `--experimental-wasm-modules` or
 * `--experimental-vm-modules` flags to `node`
 * if you have any problems using WASM
 */

import { main } from ".";

// const code = await main();
// process.exitCode = code;

/*
 * Use the code below if your environment does
 * not support top-level await
*/
main().then((code) => {
  process.exitCode = code;
});
