type TupleOfLen<T extends number, U extends any[] = []> = U['length'] extends T ? U : TupleOfLen<T, [...U, any]>;

type Decrease<T extends number> = TupleOfLen<T> extends [...infer U, any] ? U['length'] : 0;

type PopTuple<T extends any[]> = T extends [...any[], infer U] ? U : never;

type PopTupleRemaining<T extends any[]> = T extends [...infer U, any] ? U : never;

type TupleToObjectInner<Tuple extends any[], Obj extends Record<string, any>, Len extends number> = Len extends 0
    ? Obj
    : TupleToObjectInner<
          PopTupleRemaining<Tuple>,
          Obj & {
              [key in Decrease<Len>]: PopTuple<Tuple>;
          },
          Decrease<Len>
      >;

type ExpandAnd<T> = { [key in keyof T]: T[key] };

export type TupleToObject<T extends any[]> = ExpandAnd<TupleToObjectInner<T, {}, T['length']>>;
