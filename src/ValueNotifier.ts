export interface ValueListenable<A> {
  readonly value: A;
  select<B>(f: (value: A) => B): ValueListenable<B>;
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
    select: (f) => select(notifier, f),
    subscribe,
  };

  return notifier;
}

function select<A, B>(parent: ValueListenable<A>, f: (value: A) => B) {
  const child: ValueListenable<B> = {
    get value() {
      return f(parent.value);
    },
    subscribe(handler) {
      return parent.subscribe((value) => handler(f(value)));
    },
    select: (f) => select(child, f),
  };

  return child;
}
