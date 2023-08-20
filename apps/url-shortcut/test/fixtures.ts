import { JsonObject } from "../src";

interface Fixture<I, O> {
  input: I;
  expectedOutput: O;
  options?: { debug?: boolean };
}

interface CaseParams<I> {
  name: string;
  input: I;
  options?: { debug?: boolean };
}

class Fixtures<I, O> extends Map<string, Fixture<I, O>> {
  constructor(lambda: (input: I) => O, caseParams: CaseParams<I>[]) {
    super(
      caseParams.map(({ name, input, options }) => [
        name,
        {
          input,
          expectedOutput: lambda(input),
          options,
        },
      ]),
    );
  }
}

function JSONEncode(input: JsonObject[] | JsonObject) {
  return encodeURIComponent(JSON.stringify(input));
}

// URL

export type URLFixtures = typeof urlFixtures;

export const urlFixtures = new Fixtures<JsonObject[], string>(
  (input) => `things:///json?data=${JSONEncode(input)}`,
  [
    {
      name: "Simple To-Do",
      input: [
        {
          type: "to-do",
          attributes: {
            title: "2% Milk",
          },
        },
      ],
    },
    {
      name: "Add To-Do to existing list/project",
      input: [
        {
          type: "to-do",
          attributes: {
            title: "Distilled Water",
            list: "Glass",
          },
        },
      ],
    },
    {
      name: "Add To-Do to new list/project",
      options: { debug: true },
      input: [
        {
          type: "to-do",
          attributes: {
            title: "Spring Water",
            list: "Memes",
          },
        },
      ],
    },
    {
      name: "Project + To-Dos",
      input: [
        {
          type: "project",
          attributes: {
            title: "Go Shopping",
            items: [
              {
                type: "to-do",
                attributes: {
                  title: "Bread",
                },
              },
              {
                type: "to-do",
                attributes: {
                  title: "Milk",
                },
              },
            ],
          },
        },
      ],
    },
    {
      name: "To-Dos with special characters",
      input: [
        {
          type: "project",
          attributes: {
            title: "Go Shopping",
            items: [
              {
                type: "to-do",
                attributes: {
                  title: "White Bread",
                },
              },
              {
                type: "to-do",
                attributes: {
                  title: "2% Milk",
                },
              },
              {
                type: "to-do",
                attributes: {
                  title: "Gumdrops (multicolor, not monochrome)",
                },
              },
            ],
          },
        },
      ],
    },
    {
      name: "Project + To-Dos under new Area",
      options: { debug: true },
      input: [
        {
          type: "project",
          attributes: {
            title: "Go Shopping",
            area: "Memes",
            items: [
              {
                type: "to-do",
                attributes: {
                  title: "Bread",
                },
              },
              {
                type: "to-do",
                attributes: {
                  title: "Milk",
                },
              },
            ],
          },
        },
      ],
    },
  ],
);
