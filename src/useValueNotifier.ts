import { useEffect, useState } from "react";
import { ValueNotifier } from "./ValueNotifier";

export function useValueNotifier<A>(notifier: ValueNotifier<A>) {
  const [value, setValue] = useState(notifier.value);
  useEffect(() => notifier.subscribe(setValue), [notifier, setValue]);
  return value;
}
