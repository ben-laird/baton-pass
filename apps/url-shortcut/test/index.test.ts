import { beforeEach, describe } from "vitest";
import { urlFixtures } from "./fixtures";

import { ShortcutURL } from "../src";

interface Ctx {
  base: string;
  path: string;
  url: ShortcutURL;
}

describe<Ctx>("X-Callback-URL", (it) => {
  beforeEach<Ctx>((ctx) => {
    ctx.base = "things://";
    ctx.path = "/json";
    ctx.url = new ShortcutURL(ctx.path, ctx.base);
  });

  it("should produce a valid URL despite x-callback", ({
    expect,
    url,
    base,
    path,
  }) => {
    url.searchParams.set("auth-token", "memes");

    expect(url.href).toEqual(`${base}${path}?auth-token=memes`);
  });

  for (const [name, { input, expectedOutput, options }] of urlFixtures) {
    it(`should produce a valid URL: ${name}`, ({ expect, url }) => {
      url.searchParams.set("data", JSON.stringify(input));

      const testOutput = url.href;

      if (options?.debug) console.log(testOutput);

      expect(testOutput, `URL Test "${name}" failed!`).toEqual(expectedOutput);
    });
  }
});
