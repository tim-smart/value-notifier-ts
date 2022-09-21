import { useEffect, useState } from "react";
import { ValueListenable } from "./ValueNotifier";

export function useValueListenable<A>(notifier: ValueListenable<A>) {
  const [value, setValue] = useState(notifier.value);
  useEffect(() => notifier.subscribe(setValue), [notifier, setValue]);
  return value;
}
