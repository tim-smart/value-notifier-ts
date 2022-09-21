import { subscribable } from "./subscribable";
import { createKey, select } from "./utils";

export interface ValueListenable<A> {
  readonly key: string;
  readonly value: A;
  select<B>(
    f: (value: A) => B,
    opts?: ValueNotifierOpts<B>
  ): ValueListenable<B>;
  subscribe(handler: (value: A) => void): () => void;
}

export interface ValueNotifier<A> extends ValueListenable<A> {
  set(value: A): ValueNotifier<A>;
  update(f: (value: A) => A): ValueNotifier<A>;
}

export interface ValueNotifierOpts<A> {
  equals?: (a: A, b: A) => boolean;
}

export function valueNotifier<A>(
  initialValue: A,
  { equals = Object.is }: ValueNotifierOpts<A> = {}
): ValueNotifier<A> {
  let value = initialValue;
  let notifier: ValueNotifier<A>;
  const sub = subscribable<A>();

  function set(a: A) {
    if (equals(a, value)) return notifier;

    value = a;
    sub.notifyListeners(value);
    return notifier;
  }

  function update(f: (a: A) => A) {
    value = f(value);
    sub.notifyListeners(value);
    return notifier;
  }

  notifier = {
    key: createKey(),
    get value() {
      return value;
    },
    set,
    update,
    select: (f, opts) => select(notifier, f, opts),
    subscribe: sub.subscribe,
  };

  return notifier;
}
