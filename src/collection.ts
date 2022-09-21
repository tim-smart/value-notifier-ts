import { Subscribable, subscribable } from "./subscribable";
import { createKey, select } from "./utils";
import { ValueListenable, valueNotifier, ValueNotifier } from "./ValueNotifier";

export interface ValueNotifierCollection<A>
  extends ValueListenable<ValueNotifier<A>[]> {
  push(item: A): ValueNotifierCollection<A>;
  insertAt(index: number, item: A): ValueNotifierCollection<A>;
  remove(notifier: ValueNotifier<A>): ValueNotifierCollection<A>;
}

export function valueNotifierCollection<A>(
  items: A[]
): ValueNotifierCollection<A> {
  const notifiers = items.map((item) => valueNotifier(item));

  const sub: Subscribable<ValueNotifier<A>[]> = subscribable(
    () => {
      unsubscribes = subscribeToChildren();
    },
    () => {
      unsubscribes!.forEach((f) => f());
      unsubscribes = undefined;
    }
  );
  let unsubscribes: (() => void)[] | undefined;

  function onChange() {
    sub?.notifyListeners(notifiers);
  }

  function subscribeToChildren() {
    return notifiers.map((n) => n.subscribe(onChange));
  }

  const notifier: ValueNotifierCollection<A> = {
    get value() {
      return notifiers;
    },
    key: createKey(),
    select(f) {
      return select(notifier, f);
    },
    subscribe: sub.subscribe,
    push(item) {
      const n = valueNotifier(item);
      notifiers.push(n);

      if (sub) {
        const unsubscribe = n.subscribe(onChange);
        unsubscribes!.push(unsubscribe);
        sub.notifyListeners(notifiers);
      }

      return notifier;
    },
    insertAt(index, item) {
      const n = valueNotifier(item);
      notifiers.splice(index, 0, n);

      if (sub) {
        const unsubscribe = n.subscribe(onChange);
        unsubscribes!.splice(index, 0, unsubscribe);
        sub.notifyListeners(notifiers);
      }

      return notifier;
    },
    remove(n) {
      const index = notifiers.indexOf(n);
      notifiers.splice(index, 1);

      if (sub) {
        unsubscribes![index]();
        unsubscribes!.splice(index, 1);
        sub.notifyListeners(notifiers);
      }

      return notifier;
    },
  };

  return notifier;
}
