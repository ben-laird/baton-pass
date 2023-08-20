export type JsonObject = { [Key in string]: JsonValue } & {
  [Key in string]?: JsonValue | undefined;
};

export type JsonArray = JsonValue[] | readonly JsonValue[];

export type JsonPrimitive = string | number | boolean | null;

export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

export class ShortcutURL extends URL {
  get search() {
    const paramArray: string[] = [];

    for (const [param, value] of super.searchParams) {
      paramArray.push(
        `${encodeURIComponent(param)}=${encodeURIComponent(value)}`,
      );
    }

    return paramArray.join("&");
  }

  get href() {
    const baseAndPath = super.href.split("?")[0];

    return `${baseAndPath}?${this.search}`;
  }

  get params() {
    return new Map(this.searchParams);
  }

  addParams(params: Record<string, JsonValue>) {
    for (const param in params) {
      this.searchParams.append(param, JSON.stringify(params[param]));
    }
  }

  mergeParams(params: Record<string, JsonValue>) {
    for (const param in params) {
      this.searchParams.set(param, JSON.stringify(params[param]));
    }
  }

  setParams(params: Record<string, JsonValue>) {
    for (const [key] of this.searchParams) {
      this.searchParams.delete(key);
    }

    for (const param in params) {
      this.searchParams.set(param, JSON.stringify(params[param]));
    }
  }
}
