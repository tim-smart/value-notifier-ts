# value-notifier-ts

Inspired by `ValueNotifer` from Flutter, `valueNotifer` is a simple way of
listening to changes and updating a value.

## Example

```typescript
import { valueNotifer } from "value-notifier-ts";
import { useValueListenable } from "value-notifier-ts/react";

const counter = valueNotifer(0);

export function CounterText() {
  const count = useValueListenable(counter);
  return <div>Current count: {count}</div>;
}

export function CounterButton() {
  const increment = () => counter.update((count) => count + 1);

  return <button onClick={increment}>Increment</button>;
}
```
