import { useEffect, useState } from "react";

// Returns a debounced copy of `value` that only updates after `delay` ms
// have passed without `value` changing — used for search-as-you-type inputs
// so we don't fire an API call on every keystroke.
export function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
