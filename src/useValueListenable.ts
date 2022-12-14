import { useEffect, useState } from "react";
import { ValueListenable } from "./valueNotifier";

export function useValueListenable<A>(notifier: ValueListenable<A>) {
  const [value, setValue] = useState(notifier.value);
  useEffect(() => notifier.subscribe(setValue), [notifier, setValue]);
  return value;
}
