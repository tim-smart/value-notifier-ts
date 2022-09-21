import { ValueListenable, ValueNotifierOpts } from "./ValueNotifier";

let globalKeyCounter = 0;
export function createKey() {
  return `valueListenable${globalKeyCounter++}`;
}

export function select<A, B>(
  parent: ValueListenable<A>,
  f: (value: A) => B,
  { equals = Object.is }: ValueNotifierOpts<B> = {}
) {
  const child: ValueListenable<B> = {
    key: createKey(),
    get value() {
      return f(parent.value);
    },
    subscribe(handler) {
      let value = f(parent.value);

      return parent.subscribe((parentValue) => {
        const newValue = f(parentValue);
        if (equals(value, newValue)) {
          return;
        }

        value = newValue;
        handler(value);
      });
    },
    select: (f, opts) => select(child, f, opts),
  };

  return child;
}
