export type Eco<E, M> = { meta?: M; env?: E };

export type Biome<C, E, M> = {
  ctx: C;
} & Eco<E, M>;

type Ctx<T, C, E, M> = (value: T, eco: Eco<E, M>) => C;

// rome-ignore lint/suspicious/noExplicitAny: Should only be used in generics, where the any's won't leak
type AnyBiomeParams = BiomeParams<any, any, any, any>;

interface BiomeParams<T = unknown, C = unknown, E = unknown, M = unknown> {
  ctx: Ctx<T, C, E, M>;
  ecosystem: Eco<E, M>;
}

// interface EditorParams<T = unknown, C = unknown, E = unknown, M = unknown> {
//   input: (input: unknown) => T;
//   ctx: Ctx<T, C, E, M>;
//   ecosystem: Eco<E, M>;
// }

export type YToX<X, Y, C, E, M> = (y: Y, biome: Biome<C, E, M>) => X;
export type XToY<X, Y, C, E, M> = (x: X, biome: Biome<C, E, M>) => Y;

// Builders

// class Editor<T, C, E, M> {
//   constructor(readonly params: EditorParams<T, C, E, M>) {}
// }

interface EditorCreator<I> {
  <O, B extends Partial<AnyBiomeParams>>(params: {
    creator: (params: { input: I; biome: B }) => O;
    biomeParams: B;
  }): TransformerEditor<I, O, B>;

  <O>(params: {
    creator: (params: { input: I }) => O;
  }): TransformerEditor<I, O, {}>;
}

class TransformerEditor<I, O, B extends Partial<BiomeParams>> {
  static new<I>() {
    const create: EditorCreator<I> = <O, B extends Partial<BiomeParams>>(
      params:
        | {
            creator: (params: { input: I; biome: B }) => O;
            biomeParams: B;
          }
        | {
            creator: (params: { input: I }) => O;
          },
    ) => {
      if ("biomeParams" in params) {
        const { creator, biomeParams } = params;

        return new TransformerEditor(creator, biomeParams);
      }

      return new TransformerEditor(params.creator, {});
    };

    return { create };
  }

  private constructor(
    readonly creator: (params: { input: I; biome: B }) => O,
    readonly biomeParams: B,
  ) {}
}

class TransformerCreator<I, O, P extends Partial<AnyBiomeParams>> {
  constructor(protected ctx: TransformerEditor<I, O, P>) {}

  create(input: I) {
    return this.ctx.creator({ input: input, biome: this.ctx.biomeParams });
  }
}

// BiTransformer

export type BiCtx<X, Y, C, E, M> = Ctx<
  { type: "X"; x: X } | { type: "Y"; y: Y },
  C,
  E,
  M
>;

export class BiTransformer<X, Y, C, E, M> {
  protected xToY: XToY<X, Y, C, E, M>;
  protected yToX: YToX<X, Y, C, E, M>;

  protected ctx: BiCtx<X, Y, C, E, M>;
  protected ecosystem: Eco<E, M>;

  protected get meta() {
    return this.ecosystem.meta;
  }

  protected get env() {
    return this.ecosystem.env;
  }

  static new = <X, Y>() => {
    function eco<E, M>(ecosystem: Eco<E, M>) {
      function ctx<C>(ctx: BiCtx<X, Y, C, E, M>) {
        return new TransformerCreator(
          TransformerEditor.new<{
            yToX: YToX<X, Y, C, E, M>;
            xToY: XToY<X, Y, C, E, M>;
          }>().create({
            biomeParams: { ctx, ecosystem },
            creator({ input, biome }) {
              return new BiTransformer({ ...input, ...biome });
            },
          }),
        );
      }

      return { ctx };
    }

    return { eco };
  };

  protected constructor(params: {
    xToY: XToY<X, Y, C, E, M>;
    yToX: YToX<X, Y, C, E, M>;

    ctx: BiCtx<X, Y, C, E, M>;
    ecosystem: Eco<E, M>;
  }) {
    ({
      ctx: this.ctx,
      xToY: this.xToY,
      yToX: this.yToX,
      ecosystem: this.ecosystem,
    } = params);
  }

  get transform() {
    const getEcosystem = (meta?: M): Eco<E, M> => ({
      env: this.env,
      meta: meta ?? this.meta,
    });

    return {
      xToY: (x: X, meta?: M) =>
        this.xToY(x, {
          ctx: this.ctx({ type: "X", x }, getEcosystem(meta)),
          ...getEcosystem(meta),
        }),

      yToX: (y: Y, meta?: M) =>
        this.yToX(y, {
          ctx: this.ctx({ type: "Y", y }, getEcosystem(meta)),
          ...getEcosystem(meta),
        }),
    };
  }
}

// UniTransformer

export type UniCtx<X, C, E, M> = Ctx<X, C, E, M>;

export class UniTransformer<X, Y, C, E, M> {
  protected xToY: XToY<X, Y, C, E, M>;

  protected ctx: UniCtx<X, C, E, M>;
  protected ecosystem: Eco<E, M>;

  protected get meta() {
    return this.ecosystem.meta;
  }

  protected get env() {
    return this.ecosystem.env;
  }

  static new = <X, Y>() => {
    function eco<E, M>(ecosystem: Eco<E, M>) {
      function ctx<C>(ctx: UniCtx<X, C, E, M>) {
        return new TransformerCreator(
          TransformerEditor.new<{
            xToY: XToY<X, Y, C, E, M>;
          }>().create({
            biomeParams: { ctx, ecosystem },
            creator({ input, biome }) {
              return new UniTransformer({ ...input, ...biome });
            },
          }),
        );
      }

      return { ctx };
    }

    return { eco };
  };

  protected constructor(params: {
    xToY: XToY<X, Y, C, E, M>;

    ctx: UniCtx<X, C, E, M>;
    ecosystem: Eco<E, M>;
  }) {
    ({ ctx: this.ctx, xToY: this.xToY, ecosystem: this.ecosystem } = params);
  }

  transform(x: X, meta?: M) {
    const eco = { ...this.ecosystem, meta: meta ?? this.ecosystem.meta };

    return this.xToY(x, {
      ctx: this.ctx(x, eco),
      ...eco,
    });
  }
}
