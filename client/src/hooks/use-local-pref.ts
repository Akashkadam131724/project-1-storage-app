import { useState } from "react";

export function useLocalPref<T>(read: () => T, write: (value: T) => void) {
  const [value, setValue] = useState(read);

  function change(next: T) {
    write(next);
    setValue(next);
  }

  return [value, change] as const;
}
