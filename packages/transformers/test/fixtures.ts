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

export type UniTransformerFixtures = typeof uniTransformerFixtures;

export interface UTFInput {
  type: "X";
  testValue: string;
}

export interface UTFOutput {
  type: "Y";
  testValue: string;
}

export const uniTransformerFixtures = new Fixtures<UTFInput, UTFOutput>(
  ({ testValue }) => ({ type: "Y", testValue }),
  [{ name: "Empty string", input: { type: "X", testValue: "" } }],
);
