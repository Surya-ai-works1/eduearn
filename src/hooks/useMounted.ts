import { useEffect, useState } from "react";

/**
 * Custom hook to verify that a component has mounted in the browser client.
 * Uses a deferred set to avoid synchronous cascading render warnings in effects.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return mounted;
}
export default useMounted;
