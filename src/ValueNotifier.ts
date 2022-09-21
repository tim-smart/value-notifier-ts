export interface ValueNotifier<A> {
  readonly value: A;
  set(value: A): ValueNotifier<A>;
  update(f: (value: A) => A): ValueNotifier<A>;
  subscribe(handler: (value: A) => void): () => void;
}

export interface ValueNotifierOpts<A> {
  equals?: (a: A, b: A) => boolean;
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
    get value() {
      return value;
    },
    set,
    update,
    subscribe,
  };

  return notifier;
}
