import { beforeEach, describe } from "vitest";

interface Ctx {
  base: string;
  path: string;
  url: URL;
}

describe<Ctx>("X-Callback-URL", (it) => {
  beforeEach<Ctx>((ctx) => {
    ctx.base = "things://";
    ctx.path = "/json";
    ctx.url = new URL(ctx.path, ctx.base);
  });

  it("should produce an x-callback URL", ({ expect, base, path, url }) => {
    url.searchParams.set("auth-token", "memes");

    expect(url.href).toEqual(`${base}${path}?auth-token=memes`);
  });
});
