export type SubscribableHandler<A> = (value: A) => void;

export interface Subscribable<A> {
  readonly listeners: SubscribableHandler<A>[];
  readonly listenerCount: number;
  subscribe(handler: SubscribableHandler<A>): () => void;
  notifyListeners(value: A): void;
}

export function subscribable<A, Acc>(
  setup?: () => Acc,
  teardown?: (acc: Acc) => void
): Subscribable<A> {
  const listeners: Array<(a: A) => void> = [];
  let listenerCount = 0;
  let acc: Acc | undefined;

  function subscribe(handler: (a: A) => void): () => void {
    if (listenerCount === 0 && setup) {
      acc = setup();
    }

    listeners.push(handler);
    listenerCount++;

    return () => {
      listeners.splice(listeners.indexOf(handler), 1);
      listenerCount--;

      if (listenerCount === 0 && teardown) {
        teardown(acc!);
      }
    };
  }

  function notifyListeners(value: A) {
    for (let index = 0; index < listenerCount; index++) {
      listeners[index](value);
    }
  }

  return {
    listeners,
    get listenerCount() {
      return listenerCount;
    },
    notifyListeners,
    subscribe,
  };
}
