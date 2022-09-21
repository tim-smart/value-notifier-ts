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

let globalKeyCounter = 0;
function createKey() {
  return `valueListenable${globalKeyCounter++}`;
}

export function valueNotifier<A>(
  initialValue: A,
  { equals = Object.is }: ValueNotifierOpts<A> = {}
): ValueNotifier<A> {
  let value = initialValue;

  const listeners: Array<(a: A) => void> = [];
  let listenerCount = 0;
  let notifier: ValueNotifier<A>;

  function set(a: A) {
    if (equals(a, value)) return notifier;

    value = a;
    notifyListeners();
    return notifier;
  }

  function update(f: (a: A) => A) {
    value = f(value);
    notifyListeners();
    return notifier;
  }

  function subscribe(handler: (a: A) => void): () => void {
    listeners.push(handler);
    const index = listenerCount++;

    return () => {
      listeners.splice(index, 1);
      listenerCount--;
    };
  }

  function notifyListeners() {
    for (let index = 0; index < listenerCount; index++) {
      listeners[index](value);
    }
  }

  notifier = {
    key: createKey(),
    get value() {
      return value;
    },
    set,
    update,
    select: (f, opts) => select(notifier, f, opts),
    subscribe,
  };

  return notifier;
}

function select<A, B>(
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
